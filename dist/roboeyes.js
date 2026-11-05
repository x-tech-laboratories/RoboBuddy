/*
 * RoboEyes for the web: a TypeScript port of FluxGarage RoboEyes for OLED Displays V 1.1.1,
 * with a mouth added.
 *
 * Original library: Copyright (C) 2024-2025 Dennis Hoelscher
 * www.fluxgarage.com
 * www.youtube.com/@FluxGarage
 * https://github.com/FluxGarage/RoboEyes
 *
 * Port and mouth: Copyright (C) 2026 X Tech Laboratories
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * ---------------------------------------------------------------------------------------------
 * How this port differs from the Arduino original
 *
 * - The logic, names, defaults and timings are the original's. update() and drawEyes() run the
 *   same steps in the same order, including the "halfway to the target every frame" tweening.
 * - Drawing goes through a small Display interface. CanvasDisplay draws with vector shapes, so it
 *   is sharp at any size. Instead of painting the eyelids over the eyes in the background colour,
 *   it cuts them out of the eyes, which gives clean edges and lets the background be transparent.
 * - A face is composed of face states: an eye state (a top and bottom lid, or closed), a mouth
 *   state, a look (a position, or wander) and toggles (curious, sweat, shake, talk). Moods are named
 *   combinations of them (config.ts). A lid has a height, an angle and a curve, so the original's
 *   tired, angry and happy eyelids are three eye states among many. The tired mood is called sad
 *   here (TIRED still works). Sad and angry are exactly the original triangles; happy is a curve
 *   close to the original's rounded rectangle. configure() changes any setting.
 * - precision: "pixel" keeps the original's integer maths, so the motion matches an OLED frame for
 *   frame. "smooth" (the default, modes.smooth) uses fractional values for softer motion on large
 *   screens. The original's idle mode is the wander look, and the face starts with it; the original
 *   starts with idle off. The positions of setPosition() are looks too.
 * - begin() also re-centres the eyes for the new screen size (the original only does that on the
 *   next setPosition() call).
 * - New: a mouth. It is always a single line under the eyes; only its length, how far below the
 *   eyes it sits, and how far each of its two corners bends up or down change. It follows the eyes,
 *   eases like every other value, takes its shape from the mood, and can shrink away completely
 *   (setMouthWidth(0)).
 * - anim_laugh() swings the eyes with the same halfway-per-frame easing as a blink, instead of
 *   jumping every frame, and the mouth bounces on its own. The original's anim_confused() is gone:
 *   shaking the head, and its new sibling nodding, are looks (see shakeHead and nod in a look),
 *   which swing the eyes and mouth together until another look is set.
 * ---------------------------------------------------------------------------------------------
 */
import { defaultConfig, mergeConfig, } from './config.js';
export * from './config.js';
// For mood type switch
export const DEFAULT = 0;
export const SAD = 1;
export const TIRED = SAD; // the original's name for SAD
export const ANGRY = 2;
export const HAPPY = 3;
export const SMIRK = 4; // port: default eyes, one-sided smile (not in the original)
export const ASLEEP = 5; // port: sleepy eyes looking ahead, the closed gasp mouth's dot, no blinking (not in the original)
export const HAPPY_ASLEEP = 6; // port: sleepy eyes looking ahead, no blinking (not in the original)
export const WORRIED = 7; // port: sad eyes, mouth up on the left and down on the right (not in the original)
export const FURIOUS = 8; // port: angry eyes and frown, curious, shaking and looking around (not in the original)
// For turning things on or off
export const ON = true;
export const OFF = false;
// For switch "predefined positions"
export const N = 1; // north, top center
export const NE = 2; // north-east, top right
export const E = 3; // east, middle right
export const SE = 4; // south-east, bottom right
export const S = 5; // south, bottom center
export const SW = 6; // south-west, bottom left
export const W = 7; // west, middle left
export const NW = 8; // north-west, top left
// Port: the mood constants name these entries of FaceConfig.moods
const MOOD_NAMES = ['default', 'sad', 'angry', 'happy', 'smirk', 'asleep', 'happyAsleep', 'worried', 'furious'];
// Port: the position constants name these entries of FaceConfig.looks
const POSITION_LOOKS = ['center', 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
// Port: each toggle and the field that holds it (shake is the original's horizontal flicker)
const TOGGLES = { autoblink: 'autoblinker', curious: 'curious', sweat: 'sweat', shake: 'hFlicker', talk: 'mouthTalk' };
/** Draws onto a <canvas>. Sharp at any size and device pixel ratio. */
export class CanvasDisplay {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.width = 128;
        this.height = 64;
        this.background = 'transparent';
        this.main = '#ffffff';
        const ctx = canvas.getContext('2d');
        if (!ctx)
            throw new Error('RoboEyes: canvas 2D context is not available');
        this.ctx = ctx;
        if (options.background)
            this.background = options.background;
        if (options.main)
            this.main = options.main;
    }
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.resize();
    }
    /** Matches the canvas's pixel size to how big it is on screen. Called on every frame, so CSS sizing just works. */
    resize() {
        const ratio = (typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);
        const cssWidth = this.canvas.clientWidth || this.width;
        const cssHeight = this.canvas.clientHeight || this.height;
        const w = Math.max(1, Math.round(cssWidth * ratio));
        const h = Math.max(1, Math.round(cssHeight * ratio));
        if (this.canvas.width !== w || this.canvas.height !== h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
        this.ctx.setTransform(w / this.width, 0, 0, h / this.height, 0, 0);
    }
    clearDisplay() {
        this.resize();
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        if (this.background !== 'transparent') {
            ctx.fillStyle = this.background;
            ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    fillRoundRect(x, y, w, h, r, cutouts = []) {
        if (w <= 0 || h <= 0)
            return;
        const ctx = this.ctx;
        ctx.save();
        // Each cut-out becomes a clip of "everything except this shape".
        for (const cut of cutouts) {
            ctx.beginPath();
            ctx.rect(-this.width, -this.height, this.width * 3, this.height * 3);
            if (cut.kind === 'triangle') {
                const [a, b, c] = cut.points;
                ctx.moveTo(a[0], a[1]);
                ctx.lineTo(b[0], b[1]);
                ctx.lineTo(c[0], c[1]);
                ctx.closePath();
            }
            else if (cut.kind === 'path') {
                tracePath(ctx, cut.path);
                ctx.closePath();
            }
            else {
                roundRectPath(ctx, cut.x, cut.y, cut.w, cut.h, cut.r);
            }
            ctx.clip('evenodd');
        }
        ctx.beginPath();
        roundRectPath(ctx, x, y, w, h, r);
        ctx.fillStyle = this.main;
        ctx.fill();
        ctx.restore();
    }
    strokeLine(path, thickness, closed = false) {
        if (thickness <= 0)
            return;
        const ctx = this.ctx;
        ctx.beginPath();
        tracePath(ctx, path);
        if (closed) {
            ctx.closePath();
            ctx.fillStyle = this.main;
            ctx.fill();
        }
        ctx.strokeStyle = this.main;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    }
    display() { }
}
function tracePath(ctx, path) {
    ctx.moveTo(path.start[0], path.start[1]);
    for (const seg of path.segments) {
        if (seg.control)
            ctx.quadraticCurveTo(seg.control[0], seg.control[1], seg.to[0], seg.to[1]);
        else
            ctx.lineTo(seg.to[0], seg.to[1]);
    }
}
/** Adds a rounded rectangle to the current path, clamping the radius the way Adafruit GFX does. */
function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}
/** Arduino's random(max): a whole number from 0 to max - 1. */
function random(max) {
    return max > 0 ? Math.floor(Math.random() * max) : 0;
}
function millis() {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
export class RoboEyes {
    //*********************************************************************************************
    //  GENERAL METHODS
    //*********************************************************************************************
    /** Pass a canvas to draw on it, or any object implementing Display. config changes any default setting. */
    constructor(target, options = {}) {
        /** "pixel" keeps the original's whole-number maths; "smooth" allows fractions for softer motion. */
        this.precision = defaultConfig.modes.smooth ? 'smooth' : 'pixel';
        // For general setup - screen size and max. frame rate
        this.screenWidth = 128; // OLED display width, in pixels
        this.screenHeight = 64; // OLED display height, in pixels
        this.frameRate = defaultConfig.frameRate; // port: kept, so getConfig() gives back what was set
        this.frameInterval = Math.trunc(1000 / this.frameRate); // default value for 50 frames per second (1000/50 = 20 milliseconds)
        this.fpsTimer = 0; // for timing the frames per second
        // For controlling mood types and expressions
        // Port: a face is composed of face states (an eye state, a mouth state, a look and toggles), which moods
        // combine, instead of the original's tired/angry/happy flags. See config.ts.
        this.eyeStates = structuredClone(defaultConfig.eyeStates);
        this.mouthStates = structuredClone(defaultConfig.mouthStates);
        this.looks = structuredClone(defaultConfig.looks);
        this.moods = structuredClone(defaultConfig.moods);
        this.mood = 'default'; // the mood set last
        this.eyeState = 'open';
        this.mouthState = 'softSmile';
        this.look = defaultConfig.look;
        this.toggleDefaults = { ...defaultConfig.toggles }; // each toggle when a mood says nothing about it
        this.curious = defaultConfig.toggles.curious; // if true, draw the outer eye larger when looking left or right
        this.curiousGrowth = defaultConfig.curious.growth; // port: how much taller the outer eye gets
        this.curiousEdge = defaultConfig.curious.edge; // port: how close to the screen edge an eye must be to grow
        this.cyclops = defaultConfig.modes.cyclops; // if true, draw only one eye
        this.eyesClosed = false; // port: true while the eye state keeps both eyes closed
        this.eyeLheld = false; // port: true while the eye state keeps the left eye closed (both, or a wink)
        this.eyeRheld = false; // port: the same for the right eye
        this.eyeL_open = false; // left eye opened or closed?
        this.eyeR_open = false; // right eye opened or closed?
        //*********************************************************************************************
        //  Eyes Geometry
        //*********************************************************************************************
        // EYE LEFT - size and border radius
        this.eyeLwidthDefault = defaultConfig.eyes.left.width;
        this.eyeLheightDefault = defaultConfig.eyes.left.height;
        this.eyeLwidthCurrent = this.eyeLwidthDefault;
        this.eyeClosedHeight = defaultConfig.eyes.closedHeight; // port: how tall a closed eye stays (the original: 1)
        this.eyeLheightCurrent = this.eyeClosedHeight; // start with closed eye, otherwise set to eyeLheightDefault
        this.eyeLwidthNext = this.eyeLwidthDefault;
        this.eyeLheightNext = this.eyeLheightDefault;
        this.eyeLheightOffset = 0;
        // Border Radius
        this.eyeLborderRadiusDefault = defaultConfig.eyes.left.radius;
        this.eyeLborderRadiusCurrent = this.eyeLborderRadiusDefault;
        this.eyeLborderRadiusNext = this.eyeLborderRadiusDefault;
        // EYE RIGHT - size and border radius
        this.eyeRwidthDefault = defaultConfig.eyes.right.width;
        this.eyeRheightDefault = defaultConfig.eyes.right.height;
        this.eyeRwidthCurrent = this.eyeRwidthDefault;
        this.eyeRheightCurrent = this.eyeClosedHeight; // start with closed eye, otherwise set to eyeRheightDefault
        this.eyeRwidthNext = this.eyeRwidthDefault;
        this.eyeRheightNext = this.eyeRheightDefault;
        this.eyeRheightOffset = 0;
        // Border Radius
        this.eyeRborderRadiusDefault = defaultConfig.eyes.right.radius;
        this.eyeRborderRadiusCurrent = this.eyeRborderRadiusDefault;
        this.eyeRborderRadiusNext = this.eyeRborderRadiusDefault;
        // Space between eyes
        this.spaceBetweenDefault = defaultConfig.eyes.spacing;
        this.spaceBetweenCurrent = this.spaceBetweenDefault;
        this.spaceBetweenNext = 10;
        // EYE LEFT - Coordinates
        this.eyeLxDefault = Math.trunc((this.screenWidth - (this.eyeLwidthDefault + this.spaceBetweenDefault + this.eyeRwidthDefault)) / 2);
        this.eyeLyDefault = Math.trunc((this.screenHeight - this.eyeLheightDefault) / 2);
        this.eyeLx = this.eyeLxDefault;
        this.eyeLy = this.eyeLyDefault;
        this.eyeLxNext = this.eyeLx;
        this.eyeLyNext = this.eyeLy;
        // EYE RIGHT - Coordinates
        this.eyeRxDefault = this.eyeLx + this.eyeLwidthCurrent + this.spaceBetweenDefault;
        this.eyeRyDefault = this.eyeLy;
        this.eyeRx = this.eyeRxDefault;
        this.eyeRy = this.eyeRyDefault;
        this.eyeRxNext = this.eyeRx;
        this.eyeRyNext = this.eyeRy;
        // BOTH EYES
        // Port: the top and bottom eyelids, in pixels, set from the eye state. They replace the original's
        // tired, angry and happy eyelids, which are the sad, angry and happy eye states.
        this.lids = {
            left: { top: NO_LID, bottom: NO_LID },
            right: { top: NO_LID, bottom: NO_LID },
        };
        //*********************************************************************************************
        //  Mouth (not in the original)
        //*********************************************************************************************
        this.mouth = defaultConfig.modes.mouth; // draw a mouth under the eyes
        this.mouthThickness = defaultConfig.mouth.thickness; // line thickness in pixels
        this.mouthRadius = defaultConfig.mouth.radius; // how round the corners of an open mouth are
        this.mouthCurl = defaultConfig.mouth.curl; // how much of each end of the line bends, as a fraction of its length
        this.mouthWidth = defaultConfig.mouth.width; // the face's own length, used when the mouth state does not set it
        this.mouthMoodWidth = defaultConfig.mouth.moodWidth; // whether the mouth state sets the length
        // Space between the bottom of the eyes and the mouth, which sets how high the mouth sits
        this.mouthGapCurrent = defaultConfig.mouth.gap;
        this.mouthGapNext = defaultConfig.mouth.gap;
        this.mouthWidthCurrent = 0; // starts closed and grows in with the eyes
        this.mouthWidthNext = this.mouthWidth;
        this.mouthLeftCurrent = 0;
        this.mouthFollowLook = false; // Port: swap the corners as the eyes look left
        this.mouthLeftNext = 0;
        this.mouthRightCurrent = 0;
        this.mouthRightNext = 0;
        // Port prototype: the mouth's centre is a rectangle that opens downwards, and each corner opens by its own amount
        this.mouthOpenCurrent = 0;
        this.mouthOpenNext = 0;
        this.mouthLeftOpenCurrent = 0;
        this.mouthLeftOpenNext = 0;
        this.mouthRightOpenCurrent = 0;
        this.mouthRightOpenNext = 0;
        //*********************************************************************************************
        //  Macro Animations
        //*********************************************************************************************
        // Animation - horizontal flicker/shiver. Port: the shake toggle.
        this.hFlicker = false;
        this.hFlickerAlternate = false;
        this.hFlickerAmplitude = defaultConfig.shake.amplitude;
        // Animation - vertical flicker/shiver. Port: kept for setVFlicker(), but not a toggle and not in the config.
        this.vFlicker = false;
        this.vFlickerAlternate = false;
        this.vFlickerAmplitude = 10;
        // Animation - auto blinking
        this.autoblinker = defaultConfig.toggles.autoblink; // activate auto blink animation. Port: a toggle, so moods set it
        this.blinkInterval = defaultConfig.blink.interval; // basic interval between each blink in full seconds
        this.blinkSpeed = defaultConfig.blink.speed; // port: how much of the remaining way an eye goes each frame while blinking
        this.blinkIntervalVariation = defaultConfig.blink.variation; // interval variaton range in full seconds, random number inside of given range will be add to the basic blinkInterval, set to 0 for no variation
        this.blinktimer = 0; // for organising eyeblink timing
        // Animation - idle mode: eyes looking in random directions. Port: true while the look wanders.
        this.idle = false;
        this.idleInterval = defaultConfig.wander.interval; // basic interval between each eye repositioning in full seconds
        this.idleIntervalVariation = defaultConfig.wander.variation; // interval variaton range in full seconds, random number inside of given range will be add to the basic idleInterval, set to 0 for no variation
        this.idleAnimationTimer = 0; // for organising eyeblink timing
        // Port: a dart look - eyes glancing from side to side
        this.darting = false;
        this.dartSide = 1; // the side of the last glance: -1 left, 1 right (so the first glance is to the left)
        this.dartTimer = 0; // when the next glance is due
        // Animation - shake head (a look, replacing the original's "confused"): eyes and mouth shaking left and right
        this.shakeHead = false;
        this.shakeHeadAmplitude = defaultConfig.shakeHead.amplitude; // port: how far the face swings to each side
        this.shakeHeadSpeed = defaultConfig.shakeHead.speed; // how much of the remaining way it goes each frame
        // Port: the talk toggle - the opening flaps at random, as a fraction of the mouth state's opening (or talkOpen)
        this.mouthTalk = false;
        this.mouthTalkLevel = 1;
        this.mouthTalkTimer = 0; // when the next syllable is due
        this.talkSyllableMs = defaultConfig.talk.syllableMs;
        this.talkVariationMs = defaultConfig.talk.variationMs;
        this.talkPauseChance = defaultConfig.talk.pauseChance;
        this.talkOpen = defaultConfig.talk.open; // how far a mouth state with no opening of its own opens
        this.talkLipLift = defaultConfig.talk.lipLift;
        this.talkCornerSway = defaultConfig.talk.cornerSway;
        // Each corner keeps its own time: how much of the opening it follows, and how far it sways, until its timer is up
        this.mouthTalkCorner = [1, 1];
        this.mouthTalkSway = [0, 0];
        this.mouthTalkCornerTimer = [0, 0];
        this.mouthLipCurrent = 0; // how far the upper lip is raised
        // Port: animation - nod head: eyes and mouth swinging down and up
        this.nod = false;
        this.nodAmplitude = defaultConfig.nod.amplitude; // how far the face swings down and up
        this.nodSpeed = defaultConfig.nod.speed;
        // Animation - eyes laughing: eyes shaking up and down
        this.laugh = false;
        this.laughAnimationTimer = 0;
        this.laughAnimationDuration = defaultConfig.laugh.durationMs;
        this.laughToggle = true;
        this.laughAmplitude = defaultConfig.laugh.amplitude; // port: how far the eyes swing up and down
        this.laughMouthAmplitude = defaultConfig.laugh.mouthAmplitude; // port: how far the mouth bounces, on its own, while laughing
        // Port: the laugh, shake and nod swings, drawn on top of the eye and mouth positions
        this.shakeX = 0;
        this.shakeXNext = 0;
        this.shakeY = 0;
        this.shakeYNext = 0;
        this.mouthShakeY = 0;
        this.mouthShakeYNext = 0;
        // Animation - sweat on the forehead
        this.sweat = false;
        this.sweatBorderradius = 3;
        // Sweat drop 1
        this.sweat1XPosInitial = 2;
        this.sweat1XPos = 0;
        this.sweat1YPos = 2;
        this.sweat1YPosMax = 0;
        this.sweat1Height = 2;
        this.sweat1Width = 1;
        // Sweat drop 2
        this.sweat2XPosInitial = 2;
        this.sweat2XPos = 0;
        this.sweat2YPos = 2;
        this.sweat2YPosMax = 0;
        this.sweat2Height = 2;
        this.sweat2Width = 1;
        // Sweat drop 3
        this.sweat3XPosInitial = 2;
        this.sweat3XPos = 0;
        this.sweat3YPos = 2;
        this.sweat3YPosMax = 0;
        this.sweat3Height = 2;
        this.sweat3Width = 1;
        this.loop = 0;
        this.display = 'getContext' in target ? new CanvasDisplay(target) : target;
        if (options.config)
            this.configure(options.config);
        if (options.precision)
            this.precision = options.precision;
        this.setMood(this.mood);
    }
    /** Port: every setting as one object, the shape configure() takes. */
    getConfig() {
        return {
            frameRate: this.frameRate,
            eyes: {
                left: { width: this.eyeLwidthDefault, height: this.eyeLheightDefault, radius: this.eyeLborderRadiusDefault },
                right: { width: this.eyeRwidthDefault, height: this.eyeRheightDefault, radius: this.eyeRborderRadiusDefault },
                spacing: this.spaceBetweenDefault,
                closedHeight: this.eyeClosedHeight,
            },
            mouth: {
                gap: this.mouthGapNext, thickness: this.mouthThickness, radius: this.mouthRadius, curl: this.mouthCurl,
                width: this.mouthWidth, moodWidth: this.mouthMoodWidth,
            },
            blink: { interval: this.blinkInterval, variation: this.blinkIntervalVariation, speed: this.blinkSpeed },
            wander: { interval: this.idleInterval, variation: this.idleIntervalVariation },
            curious: { growth: this.curiousGrowth, edge: this.curiousEdge },
            laugh: { amplitude: this.laughAmplitude, mouthAmplitude: this.laughMouthAmplitude, durationMs: this.laughAnimationDuration },
            shakeHead: { amplitude: this.shakeHeadAmplitude, speed: this.shakeHeadSpeed },
            talk: { syllableMs: this.talkSyllableMs, variationMs: this.talkVariationMs, pauseChance: this.talkPauseChance, open: this.talkOpen, lipLift: this.talkLipLift, cornerSway: this.talkCornerSway },
            nod: { amplitude: this.nodAmplitude, speed: this.nodSpeed },
            shake: { amplitude: this.hFlickerAmplitude },
            modes: { cyclops: this.cyclops, mouth: this.mouth, smooth: this.precision === 'smooth' },
            look: this.look,
            toggles: { ...this.toggleDefaults },
            eyeStates: structuredClone(this.eyeStates),
            mouthStates: structuredClone(this.mouthStates),
            looks: structuredClone(this.looks),
            moods: structuredClone(this.moods),
        };
    }
    /** Port: change any settings at once. What the patch leaves out keeps its current value. */
    configure(patch) {
        const c = mergeConfig(this.getConfig(), patch);
        const l = c.eyes.left, r = c.eyes.right;
        this.setFramerate(c.frameRate);
        // Only what changed, so an eye that is closed right now stays closed
        if (l.width !== this.eyeLwidthDefault || r.width !== this.eyeRwidthDefault)
            this.setWidth(l.width, r.width);
        if (l.height !== this.eyeLheightDefault || r.height !== this.eyeRheightDefault)
            this.setHeight(l.height, r.height);
        if (l.radius !== this.eyeLborderRadiusDefault || r.radius !== this.eyeRborderRadiusDefault)
            this.setBorderradius(l.radius, r.radius);
        if (c.eyes.spacing !== this.spaceBetweenDefault)
            this.setSpacebetween(c.eyes.spacing);
        // An eye that is closing or closed takes the new height too
        const closed = this.eyeClosedHeight;
        this.eyeClosedHeight = Math.max(0, c.eyes.closedHeight);
        if (this.eyeLheightNext === closed)
            this.eyeLheightNext = this.eyeClosedHeight;
        if (this.eyeRheightNext === closed)
            this.eyeRheightNext = this.eyeClosedHeight;
        this.setMouthGap(c.mouth.gap);
        this.mouthThickness = c.mouth.thickness;
        this.mouthRadius = c.mouth.radius;
        this.mouthCurl = c.mouth.curl;
        this.mouthWidth = Math.max(0, c.mouth.width);
        this.mouthMoodWidth = c.mouth.moodWidth;
        this.blinkInterval = c.blink.interval;
        this.blinkIntervalVariation = c.blink.variation;
        this.blinkSpeed = Math.max(0.05, Math.min(1, c.blink.speed));
        this.idleInterval = c.wander.interval;
        this.idleIntervalVariation = c.wander.variation;
        this.curiousGrowth = c.curious.growth;
        this.curiousEdge = c.curious.edge;
        this.laughAmplitude = c.laugh.amplitude;
        this.laughMouthAmplitude = c.laugh.mouthAmplitude;
        this.laughAnimationDuration = c.laugh.durationMs;
        this.shakeHeadAmplitude = c.shakeHead.amplitude;
        this.shakeHeadSpeed = Math.max(0.05, Math.min(0.8, c.shakeHead.speed));
        this.talkSyllableMs = Math.max(20, c.talk.syllableMs);
        this.talkVariationMs = Math.max(0, c.talk.variationMs);
        this.talkPauseChance = Math.max(0, Math.min(1, c.talk.pauseChance));
        this.talkOpen = Math.max(0, c.talk.open);
        this.talkLipLift = Math.max(0, c.talk.lipLift);
        this.talkCornerSway = Math.max(0, c.talk.cornerSway);
        this.nodAmplitude = c.nod.amplitude;
        this.nodSpeed = Math.max(0.05, Math.min(0.8, c.nod.speed));
        this.hFlickerAmplitude = c.shake.amplitude;
        this.cyclops = c.modes.cyclops;
        this.mouth = c.modes.mouth;
        this.precision = c.modes.smooth ? 'smooth' : 'pixel';
        this.toggleDefaults = { ...c.toggles };
        // Each state gets whatever it leaves out from a level, open, unbent one
        this.eyeStates = {};
        for (const [name, state] of Object.entries(c.eyeStates))
            this.eyeStates[name] = eyesWith(OPEN_EYES, state);
        this.mouthStates = {};
        for (const [name, state] of Object.entries(c.mouthStates)) {
            this.mouthStates[name] = { left: state.left ?? 0, right: state.right ?? 0 };
            for (const key of ['open', 'leftOpen', 'rightOpen'])
                if (state[key])
                    this.mouthStates[name][key] = state[key];
            if (state.width !== undefined && state.width !== null)
                this.mouthStates[name].width = state.width;
            if (state.ownWidth)
                this.mouthStates[name].ownWidth = true;
            if (state.followLook)
                this.mouthStates[name].followLook = true;
            if (state.group)
                this.mouthStates[name].group = state.group;
        }
        this.looks = {};
        for (const [name, look] of Object.entries(c.looks)) {
            this.looks[name] = { x: look.x ?? 0.5, y: look.y ?? 0.5 };
            if (look.group)
                this.looks[name].group = look.group;
            if (look.wander)
                this.looks[name].wander = true;
            if (look.shakeHead)
                this.looks[name].shakeHead = true;
            if (look.nod)
                this.looks[name].nod = true;
            // dart: true (as the demo's checkbox sends) gets the default reach and hold
            if (look.dart)
                this.looks[name].dart = { reach: 0.5, holdMs: 600, ...(typeof look.dart === 'object' ? withoutNulls(look.dart) : {}) };
        }
        this.moods = {};
        for (const [name, mood] of Object.entries(c.moods))
            this.moods[name] = withoutNulls(mood);
        if (!this.moods.default)
            this.moods.default = {}; // setMood() falls back to it
        // The face states in use stay in use, now with their new values
        this.applyEyes(this.eyeState, this.eyesOverride);
        this.applyMouth(this.mouthState, this.mouthOverride);
        this.setLook(c.look);
    }
    /** Whole numbers in "pixel" precision, like the original's int and byte maths; unchanged in "smooth". */
    int(value) {
        return this.precision === 'pixel' ? Math.trunc(value) : value;
    }
    // Startup RoboEyes with defined screen-width, screen-height and max. frames per second
    begin(width, height, frameRate) {
        this.screenWidth = width; // OLED display width, in pixels
        this.screenHeight = height; // OLED display height, in pixels
        this.display.setSize(width, height);
        this.display.clearDisplay(); // clear the display buffer
        this.display.display(); // show empty screen
        this.eyeLheightCurrent = this.eyeClosedHeight; // start with closed eyes
        this.eyeRheightCurrent = this.eyeClosedHeight; // start with closed eyes
        this.setFramerate(frameRate); // calculate frame interval based on defined frameRate
        // Port: centre the eyes for the new screen size straight away, then take up the look.
        this.eyeLxNext = this.int(this.getScreenConstraint_X() / 2);
        this.eyeLyNext = this.int(this.getScreenConstraint_Y() / 2);
        this.eyeLx = this.eyeLxNext;
        this.eyeLy = this.eyeLyNext;
        this.eyeRx = this.eyeLx + this.eyeLwidthCurrent + this.spaceBetweenCurrent;
        this.eyeRy = this.eyeLy;
        this.setLook(this.look);
    }
    update() {
        // Limit drawing updates to defined max framerate
        if (millis() - this.fpsTimer >= this.frameInterval) {
            this.drawEyes();
            this.fpsTimer = millis();
        }
    }
    /** Port: calls update() on every animation frame until stop(). */
    start() {
        const tick = () => {
            this.update();
            this.loop = requestAnimationFrame(tick);
        };
        if (!this.loop)
            this.loop = requestAnimationFrame(tick);
    }
    stop() {
        cancelAnimationFrame(this.loop);
        this.loop = 0;
    }
    //*********************************************************************************************
    //  SETTERS METHODS
    //*********************************************************************************************
    // Calculate frame interval based on defined frameRate
    setFramerate(fps) {
        this.frameRate = fps;
        this.frameInterval = Math.trunc(1000 / fps);
    }
    // Set color values. Any CSS colour; 'transparent' background lets the page show through.
    setDisplayColors(background, main) {
        if (this.display instanceof CanvasDisplay) {
            this.display.background = background;
            this.display.main = main;
        }
    }
    setWidth(leftEye, rightEye) {
        this.eyeLwidthNext = leftEye;
        this.eyeRwidthNext = rightEye;
        this.eyeLwidthDefault = leftEye;
        this.eyeRwidthDefault = rightEye;
    }
    setHeight(leftEye, rightEye) {
        this.eyeLheightNext = leftEye;
        this.eyeRheightNext = rightEye;
        this.eyeLheightDefault = leftEye;
        this.eyeRheightDefault = rightEye;
    }
    // Set border radius for left and right eye
    setBorderradius(leftEye, rightEye) {
        this.eyeLborderRadiusNext = leftEye;
        this.eyeRborderRadiusNext = rightEye;
        this.eyeLborderRadiusDefault = leftEye;
        this.eyeRborderRadiusDefault = rightEye;
    }
    // Set space between the eyes, can also be negative
    setSpacebetween(space) {
        this.spaceBetweenNext = space;
        this.spaceBetweenDefault = space;
    }
    // Set mood expression. Port: a mood constant (SAD...) or the name of any entry in moods. The mood picks the face
    // states: its eye and mouth states (open and softSmile if it leaves them out, with its override), its toggles
    // (their defaults if it leaves them out) and its look (the look stays as it is if the mood has none).
    setMood(mood) {
        const name = typeof mood === 'number' ? MOOD_NAMES[mood] : mood;
        this.mood = name in this.moods ? name : 'default';
        const m = this.moods[this.mood];
        for (const [key, field] of Object.entries(TOGGLES)) {
            this[field] = m[key] ?? this.toggleDefaults[key];
        }
        this.applyEyes(m.eyes ?? 'open', m.override?.eyes ?? undefined);
        this.applyMouth(m.mouth ?? 'softSmile', m.override?.mouth ?? undefined);
        if (m.look)
            this.setLook(m.look);
    }
    // Port: set the eye state by name (see eyeStates), whatever the mood
    setEyes(name) {
        this.applyEyes(name);
    }
    // Port: set the mouth state by name (see mouthStates), whatever the mood
    setMouthState(name) {
        this.applyMouth(name);
    }
    // Port: set the look by name (see looks): a place for the eyes to go, or wander
    setLook(name) {
        const look = this.looks[name];
        if (!look)
            return;
        this.look = name;
        if (look.wander) {
            if (!this.idle)
                this.idleAnimationTimer = 0; // move on straight away
            this.idle = true;
            this.darting = false;
            return;
        }
        this.idle = false;
        if (look.dart) {
            if (!this.darting)
                this.dartTimer = 0; // first glance straight away; drawEyes() places the eyes
            this.darting = true;
            return;
        }
        this.darting = false;
        const fraction = (v) => Math.max(0, Math.min(1, v));
        this.eyeLxNext = this.int(this.getScreenConstraint_X() * fraction(look.x));
        this.eyeLyNext = this.int(this.getScreenConstraint_Y() * fraction(look.y));
    }
    /** Port: the eye state in use, with the mood's changes to it. */
    currentEyes() {
        return eyesWith(this.eyeStates[this.eyeState] ?? OPEN_EYES, this.eyesOverride);
    }
    /** Port: the mouth state in use, with the mood's changes to it. */
    currentMouth() {
        return { ...(this.mouthStates[this.mouthState] ?? { left: 0, right: 0 }), ...withoutNulls(this.mouthOverride) };
    }
    // The eyelids follow the eye state every frame; closing and opening happen here
    applyEyes(name, override) {
        this.eyeState = name;
        this.eyesOverride = override;
        const closed = this.currentEyes().closed;
        const left = closed === true || closed === 'left', right = closed === true || closed === 'right';
        // Close or open only the eyes that change, so an open eye doesn't blink on the way
        if (left !== this.eyeLheld) {
            if (left)
                this.close(true, false);
            else
                this.open(true, false);
        }
        if (right !== this.eyeRheld) {
            if (right)
                this.close(false, true);
            else
                this.open(false, true);
        }
        this.eyeLheld = left;
        this.eyeRheld = right;
        this.eyesClosed = left && right;
    }
    // The mouth is set here, so setMouthWidth() and setMouthCorners() can still change it afterwards
    applyMouth(name, override) {
        this.mouthState = name;
        this.mouthOverride = override;
        const shape = this.currentMouth();
        const ownWidth = (this.mouthMoodWidth || shape.ownWidth) && shape.width !== undefined;
        this.mouthWidthNext = ownWidth ? shape.width : this.mouthWidth;
        this.mouthLeftNext = shape.left;
        this.mouthRightNext = shape.right;
        this.mouthOpenNext = Math.max(0, shape.open ?? 0);
        this.mouthLeftOpenNext = Math.max(0, shape.leftOpen ?? 0);
        this.mouthRightOpenNext = Math.max(0, shape.rightOpen ?? 0);
        this.mouthFollowLook = !!shape.followLook;
    }
    // Set predefined position. Port: each position is a look (center, N, NE ...), so this is setLook() by another name.
    setPosition(position) {
        this.setLook(POSITION_LOOKS[position] ?? 'center');
    }
    // Set automated eye blinking, minimal blink interval in full seconds and blink interval variation range in full seconds
    // Port: auto blink is a toggle, so the next mood sets it again.
    setAutoblinker(active, interval, variation) {
        this.autoblinker = active;
        if (interval !== undefined)
            this.blinkInterval = interval;
        if (variation !== undefined)
            this.blinkIntervalVariation = variation;
    }
    // Set idle mode - automated eye repositioning, minimal time interval in full seconds and time interval variation range in full seconds
    // Port: idle mode is the wander look. Turning it off looks to the center.
    setIdleMode(active, interval, variation) {
        if (active)
            this.setLook('wander');
        else if (this.idle)
            this.setLook('center');
        if (interval !== undefined)
            this.idleInterval = interval;
        if (variation !== undefined)
            this.idleIntervalVariation = variation;
    }
    // Set curious mode - the respectively outer eye gets larger when looking left or right.
    // Port: a toggle, so the next mood sets it again.
    setCuriosity(curiousBit) {
        this.curious = curiousBit;
    }
    // Set cyclops mode - show only one eye
    setCyclops(cyclopsBit) {
        this.cyclops = cyclopsBit;
    }
    // Port: the shake toggle - the eyes jitter left and right every frame. The next mood sets it again.
    setShake(shakeBit, amplitude) {
        this.hFlicker = shakeBit;
        if (amplitude !== undefined)
            this.hFlickerAmplitude = amplitude; // in pixels
    }
    // Set horizontal flickering (displacing eyes left/right). Port: the shake toggle, so this is setShake().
    setHFlicker(flickerBit, amplitude) {
        this.setShake(flickerBit, amplitude);
    }
    // Set vertical flickering (displacing eyes up/down). Port: not a toggle, so no mood changes it.
    setVFlicker(flickerBit, amplitude) {
        this.vFlicker = flickerBit; // turn flicker on or off
        if (amplitude !== undefined)
            this.vFlickerAmplitude = amplitude; // define amplitude of flickering in pixels
    }
    // Port: a toggle, so the next mood sets it again.
    setSweat(sweatBit) {
        this.sweat = sweatBit; // turn sweat on or off
    }
    // Port: mouth on or off. Off keeps the original's layout exactly; on reserves a strip under the eyes.
    setMouth(mouthBit) {
        this.mouth = mouthBit;
        this.setLook(this.look); // the eyes have more or less room now
    }
    // Port: length of the mouth line in pixels. 0 shrinks it away completely.
    setMouthWidth(width) {
        this.mouthWidthNext = Math.max(0, width);
    }
    // Port: how far the mouth corners bend, in pixels. Positive up (smile), negative down (frown).
    // With one argument, both corners.
    setMouthCorners(left, right = left) {
        this.mouthLeftNext = left;
        this.mouthRightNext = right;
    }
    // Port: the talk toggle - the mouth keeps opening and closing, whatever the mouth state. The next mood sets it again.
    setTalk(talkBit) {
        this.mouthTalk = talkBit;
    }
    // Port: how high the mouth sits, as the space in pixels between the bottom of the eyes and the mouth
    setMouthGap(gap) {
        this.mouthGapNext = Math.max(0, gap);
    }
    //*********************************************************************************************
    //  GETTERS METHODS
    //*********************************************************************************************
    // Returns the max x position for left eye
    getScreenConstraint_X() {
        return this.screenWidth - this.eyeLwidthCurrent - this.spaceBetweenCurrent - this.eyeRwidthCurrent;
    }
    // Returns the max y position for left eye
    getScreenConstraint_Y() {
        // using default height here, because height will vary when blinking and in curious mode
        // Port: minus the strip the mouth needs, so it always stays on screen.
        return this.screenHeight - Math.max(this.eyeLheightDefault, this.cyclops ? 0 : this.eyeRheightDefault) - this.getMouthSpace();
    }
    // Port: room reserved under the eyes for the mouth (0 when the mouth is off)
    getMouthSpace() {
        // Plus the most any mouth state reaches below the line, so an open mouth never leaves the screen: its opening, or
        // a corner's opening below that corner's own bend
        const reach = (s) => Math.max(s.open ?? 0, (s.leftOpen ?? 0) - (s.left ?? 0), (s.rightOpen ?? 0) - (s.right ?? 0));
        const open = Math.max(0, ...Object.values(this.mouthStates).map(reach), ...(this.mouthOverride ? [reach(this.mouthOverride)] : []));
        return this.mouth ? this.mouthGapNext + this.mouthThickness + 3 + Math.max(open, this.mouthTalk ? this.talkOpen : 0) : 0;
    }
    //*********************************************************************************************
    //  BASIC ANIMATION METHODS
    //*********************************************************************************************
    // Close eye(s). With no arguments, both eyes.
    close(left = true, right = true) {
        if (left) {
            this.eyeLheightNext = this.eyeClosedHeight; // closing left eye
            this.eyeL_open = false; // left eye not opened (=closed)
        }
        if (right) {
            this.eyeRheightNext = this.eyeClosedHeight; // closing right eye
            this.eyeR_open = false; // right eye not opened (=closed)
        }
    }
    // Open eye(s). With no arguments, both eyes.
    open(left = true, right = true) {
        if (left)
            this.eyeL_open = true; // left eye opened - if true, drawEyes() will take care of opening eyes again
        if (right)
            this.eyeR_open = true; // right eye opened
    }
    // Trigger eyeblink(s) animation. With no arguments, both eyes.
    blink(left = true, right = true) {
        this.close(left, right);
        this.open(left, right);
    }
    //*********************************************************************************************
    //  MACRO ANIMATION METHODS
    //*********************************************************************************************
    // Play laugh animation - one shot animation of eyes shaking up and down
    anim_laugh() {
        this.laugh = true;
    }
    //*********************************************************************************************
    //  PRE-CALCULATIONS AND ACTUAL DRAWINGS
    //*********************************************************************************************
    drawEyes() {
        const int = (v) => this.int(v);
        //// PRE-CALCULATIONS - EYE SIZES AND VALUES FOR ANIMATION TWEENINGS ////
        // Vertical size offset for larger eyes when looking left or right (curious gaze)
        if (this.curious) {
            if (this.eyeLxNext <= this.curiousEdge) {
                this.eyeLheightOffset = this.curiousGrowth;
            }
            else if (this.eyeLxNext >= (this.getScreenConstraint_X() - this.curiousEdge) && this.cyclops) {
                this.eyeLheightOffset = this.curiousGrowth;
            }
            else {
                this.eyeLheightOffset = 0;
            } // left eye
            if (this.eyeRxNext >= this.screenWidth - this.eyeRwidthCurrent - this.curiousEdge) {
                this.eyeRheightOffset = this.curiousGrowth;
            }
            else {
                this.eyeRheightOffset = 0;
            } // right eye
        }
        else {
            this.eyeLheightOffset = 0; // reset height offset for left eye
            this.eyeRheightOffset = 0; // reset height offset for right eye
        }
        // Left eye height
        // Port: at the blink speed (halfway each frame by default, as the original)
        this.eyeLheightCurrent = this.blinkEase(this.eyeLheightCurrent, this.eyeLheightNext + this.eyeLheightOffset);
        this.eyeLy += int((this.eyeLheightDefault - this.eyeLheightCurrent) / 2); // vertical centering of eye when closing
        this.eyeLy -= int(this.eyeLheightOffset / 2);
        // Right eye height
        this.eyeRheightCurrent = this.blinkEase(this.eyeRheightCurrent, this.eyeRheightNext + this.eyeRheightOffset);
        this.eyeRy += int((this.eyeRheightDefault - this.eyeRheightCurrent) / 2); // vertical centering of eye when closing
        this.eyeRy -= int(this.eyeRheightOffset / 2);
        // Open eyes again after closing them
        if (this.eyeL_open) {
            if (this.eyeLheightCurrent <= this.eyeClosedHeight + this.eyeLheightOffset) {
                this.eyeLheightNext = this.eyeLheightDefault;
            }
        }
        if (this.eyeR_open) {
            if (this.eyeRheightCurrent <= this.eyeClosedHeight + this.eyeRheightOffset) {
                this.eyeRheightNext = this.eyeRheightDefault;
            }
        }
        // Left eye width
        this.eyeLwidthCurrent = int((this.eyeLwidthCurrent + this.eyeLwidthNext) / 2);
        // Right eye width
        this.eyeRwidthCurrent = int((this.eyeRwidthCurrent + this.eyeRwidthNext) / 2);
        // Space between eyes
        this.spaceBetweenCurrent = int((this.spaceBetweenCurrent + this.spaceBetweenNext) / 2);
        // Left eye coordinates
        this.eyeLx = int((this.eyeLx + this.eyeLxNext) / 2);
        this.eyeLy = int((this.eyeLy + this.eyeLyNext) / 2);
        // Right eye coordinates
        this.eyeRxNext = this.eyeLxNext + this.eyeLwidthCurrent + this.spaceBetweenCurrent; // right eye's x position depends on left eyes position + the space between
        this.eyeRyNext = this.eyeLyNext; // right eye's y position should be the same as for the left eye
        this.eyeRx = int((this.eyeRx + this.eyeRxNext) / 2);
        this.eyeRy = int((this.eyeRy + this.eyeRyNext) / 2);
        // Left eye border radius
        this.eyeLborderRadiusCurrent = int((this.eyeLborderRadiusCurrent + this.eyeLborderRadiusNext) / 2);
        // Right eye border radius
        this.eyeRborderRadiusCurrent = int((this.eyeRborderRadiusCurrent + this.eyeRborderRadiusNext) / 2);
        // Port: mouth length, height and corners ease the same way
        this.mouthWidthCurrent = this.ease(this.mouthWidthCurrent, this.mouthWidthNext);
        this.mouthGapCurrent = this.ease(this.mouthGapCurrent, this.mouthGapNext);
        // Port: a talking mouth picks a new opening each syllable, sometimes shut for a gap between words. The upper lip
        // lifts with the opening, and each corner follows it only loosely, on its own timing, and sways a little.
        const now = millis();
        if (this.mouthTalk) {
            if (now >= this.mouthTalkTimer) {
                this.mouthTalkLevel = Math.random() < this.talkPauseChance ? 0 : 0.35 + Math.random() * 0.65;
                this.mouthTalkTimer = now + this.talkSyllableMs + random(this.talkVariationMs);
            }
            for (const side of [0, 1]) {
                if (now < this.mouthTalkCornerTimer[side])
                    continue;
                this.mouthTalkCorner[side] = 0.6 + Math.random() * 0.4;
                this.mouthTalkSway[side] = (Math.random() * 2 - 1) * this.talkCornerSway;
                this.mouthTalkCornerTimer[side] = now + this.talkSyllableMs * (0.6 + Math.random() * 0.8) + random(this.talkVariationMs);
            }
        }
        const talk = this.mouthTalk ? this.mouthTalkLevel : 1;
        const [cornerL, cornerR] = this.mouthTalk ? this.mouthTalkCorner : [1, 1];
        const [swayL, swayR] = this.mouthTalk ? this.mouthTalkSway.map(sway => sway * talk) : [0, 0];
        this.mouthLeftCurrent = this.ease(this.mouthLeftCurrent, this.mouthLeftNext + swayL);
        this.mouthRightCurrent = this.ease(this.mouthRightCurrent, this.mouthRightNext + swayR);
        this.mouthLipCurrent = this.ease(this.mouthLipCurrent, this.mouthTalk ? talk * this.talkLipLift : 0);
        // A mouth state with no opening of its own opens by talkOpen in the middle and less at the corners (as wideSmile does)
        const bare = this.mouthTalk && !(this.mouthOpenNext > 0 || this.mouthLeftOpenNext > 0 || this.mouthRightOpenNext > 0);
        const [open, openL, openR] = bare ? [this.talkOpen, this.talkOpen * 0.4, this.talkOpen * 0.4] : [this.mouthOpenNext, this.mouthLeftOpenNext, this.mouthRightOpenNext];
        this.mouthOpenCurrent = this.ease(this.mouthOpenCurrent, open * talk);
        this.mouthLeftOpenCurrent = this.ease(this.mouthLeftOpenCurrent, openL * talk * cornerL);
        this.mouthRightOpenCurrent = this.ease(this.mouthRightOpenCurrent, openR * talk * cornerR);
        //// APPLYING MACRO ANIMATIONS ////
        if (this.autoblinker && !this.eyesClosed) {
            if (millis() >= this.blinktimer) {
                this.blink(!this.eyeLheld, !this.eyeRheld); // port: a winking eye stays closed
                this.blinktimer = millis() + (this.blinkInterval * 1000) + (random(this.blinkIntervalVariation) * 1000); // calculate next time for blinking
            }
        }
        // Laughing - eyes shaking up and down for the duration defined by laughAnimationDuration (default = 500ms)
        // Port: instead of the original's per-frame vertical flicker, the eyes swing at the pace of a blink,
        // and the mouth bounces the other way on its own.
        // Port: a look that shakes the head or nods starts the swing, which keeps going until the look changes
        const shaking = !!this.looks[this.look]?.shakeHead, nodding = !!this.looks[this.look]?.nod;
        if (shaking !== this.shakeHead) {
            this.shakeHead = shaking;
            this.shakeXNext = shaking ? -this.shakeHeadAmplitude : 0;
        }
        if (nodding !== this.nod) {
            this.nod = nodding;
            this.shakeYNext = nodding ? this.nodAmplitude : 0;
            this.mouthShakeYNext = this.shakeYNext;
        }
        if (this.laugh) {
            if (this.laughToggle) {
                this.shakeYNext = -this.laughAmplitude;
                this.mouthShakeYNext = this.laughMouthAmplitude;
                this.laughAnimationTimer = millis();
                this.laughToggle = false;
            }
            else if (millis() >= this.laughAnimationTimer + this.laughAnimationDuration) {
                this.shakeYNext = 0;
                this.mouthShakeYNext = 0;
                this.laughToggle = true;
                this.laugh = false;
            }
        }
        // Port: each swing eases like a blink, and turns back once it arrives
        this.shakeX = this.ease(this.shakeX, this.shakeXNext, this.shakeHeadSpeed);
        // Port: turning back takes the amplitude as it is now, so changing it applies to a swing already going
        if (this.shakeHead && this.shakeX === this.shakeXNext)
            this.shakeXNext = this.shakeXNext > 0 ? -this.shakeHeadAmplitude : this.shakeHeadAmplitude;
        const swingSpeed = this.nod ? this.nodSpeed : this.blinkSpeed; // a laugh swings at the pace of a blink
        this.shakeY = this.ease(this.shakeY, this.shakeYNext, swingSpeed);
        this.mouthShakeY = this.ease(this.mouthShakeY, this.mouthShakeYNext, swingSpeed);
        // The mouth turns back with the eyes, so it moves at the same pace: with them when nodding, and the other
        // way, by its own amount, when laughing
        if ((this.laugh || this.nod) && this.shakeY === this.shakeYNext) {
            const up = this.shakeYNext > 0, amplitude = this.laugh ? this.laughAmplitude : this.nodAmplitude;
            this.shakeYNext = up ? -amplitude : amplitude;
            this.mouthShakeYNext = this.laugh ? (up ? this.laughMouthAmplitude : -this.laughMouthAmplitude) : this.shakeYNext;
        }
        // Idle - eyes moving to random positions on screen
        if (this.idle && !this.eyesClosed) {
            if (millis() >= this.idleAnimationTimer) {
                this.eyeLxNext = random(this.getScreenConstraint_X());
                this.eyeLyNext = random(this.getScreenConstraint_Y());
                this.idleAnimationTimer = millis() + (this.idleInterval * 1000) + (random(this.idleIntervalVariation) * 1000); // calculate next time for eyes repositioning
            }
        }
        // Port: a dart look glances to the other side once each glance has been held for its time
        const dartLook = this.darting ? this.looks[this.look] : undefined;
        if (dartLook?.dart && !this.eyesClosed && millis() >= this.dartTimer) {
            const fraction = (v) => Math.max(0, Math.min(1, v));
            this.dartSide = -this.dartSide;
            this.eyeLxNext = this.int(this.getScreenConstraint_X() * fraction(dartLook.x + this.dartSide * dartLook.dart.reach));
            this.eyeLyNext = this.int(this.getScreenConstraint_Y() * fraction(dartLook.y));
            this.dartTimer = millis() + dartLook.dart.holdMs;
        }
        // Adding offsets for horizontal flickering/shivering
        if (this.hFlicker) {
            if (this.hFlickerAlternate) {
                this.eyeLx += this.hFlickerAmplitude;
                this.eyeRx += this.hFlickerAmplitude;
            }
            else {
                this.eyeLx -= this.hFlickerAmplitude;
                this.eyeRx -= this.hFlickerAmplitude;
            }
            this.hFlickerAlternate = !this.hFlickerAlternate;
        }
        // Adding offsets for vertical flickering/shivering
        if (this.vFlicker) {
            if (this.vFlickerAlternate) {
                this.eyeLy += this.vFlickerAmplitude;
                this.eyeRy += this.vFlickerAmplitude;
            }
            else {
                this.eyeLy -= this.vFlickerAmplitude;
                this.eyeRy -= this.vFlickerAmplitude;
            }
            this.vFlickerAlternate = !this.vFlickerAlternate;
        }
        // Cyclops mode, set second eye's size and space between to 0
        if (this.cyclops) {
            this.eyeRwidthCurrent = 0;
            this.eyeRheightCurrent = 0;
            this.spaceBetweenCurrent = 0;
        }
        //// ACTUAL DRAWINGS ////
        const d = this.display;
        d.clearDisplay(); // start with a blank screen
        // Prepare mood type transitions. Port: the lids come from the mood (the original's tired, angry
        // and happy eyelids are those moods' lid shapes), scaled to the eye's height as it is right now.
        // Each eye's lids: the shared ones with that eye's own changes, sized to that eye (in cyclops mode, the one
        // eye's halves use the left and right lids, both sized to it)
        const eyes = this.currentEyes();
        for (const side of ['left', 'right']) {
            const own = eyes[side];
            const h = side === 'right' && !this.cyclops ? this.eyeRheightCurrent : this.eyeLheightCurrent;
            this.lids[side] = {
                top: this.easeLid(this.lids[side].top, { ...eyes.top, ...own?.top }, h),
                bottom: this.easeLid(this.lids[side].bottom, { ...eyes.bottom, ...own?.bottom }, h),
            };
        }
        // The original draws each eye, then paints the eyelids over it in the background colour.
        // Here the eyelid shapes are cut out of the eye instead.
        // Port: the swings move the drawn eyes only; drawMouth() adds the mouth's own share.
        // Port: eyes of different heights share their bottom edge, so the shorter one sits lower
        const tallest = Math.max(this.eyeLheightDefault, this.cyclops ? 0 : this.eyeRheightDefault);
        const lx = this.eyeLx + this.shakeX, ly = this.eyeLy + this.shakeY + (tallest - this.eyeLheightDefault), lw = this.eyeLwidthCurrent, lh = this.eyeLheightCurrent;
        const rx = this.eyeRx + this.shakeX, ry = this.eyeRy + this.shakeY + (tallest - this.eyeRheightDefault), rw = this.eyeRwidthCurrent, rh = this.eyeRheightCurrent;
        const leftCuts = [];
        const rightCuts = [];
        if (!this.cyclops) {
            // Each eye's outer corner faces its own side of the screen
            leftCuts.push(...this.lidCuts(lx + lw, lx, ly, lh, this.lids.left));
            rightCuts.push(...this.lidCuts(rx, rx + rw, ry, rh, this.lids.right));
        }
        else {
            // Cyclops: one lid per half of the eye, both with their inner corner in the middle
            const mid = lx + int(lw / 2);
            leftCuts.push(...this.lidCuts(mid, lx, ly, lh, this.lids.left), ...this.lidCuts(mid, lx + lw, ly, lh, this.lids.right));
        }
        // Draw basic eye rectangles, with their eyelids cut out
        d.fillRoundRect(lx, ly, lw, lh, this.eyeLborderRadiusCurrent, leftCuts); // left eye
        if (!this.cyclops) {
            d.fillRoundRect(rx, ry, rw, rh, this.eyeRborderRadiusCurrent, rightCuts); // right eye
        }
        // Port: the mouth
        this.drawMouth();
        // Add sweat drops
        if (this.sweat) {
            // Sweat drop 1 -> left corner
            if (this.sweat1YPos <= this.sweat1YPosMax) {
                this.sweat1YPos += 0.5;
            } // vertical movement from initial to max
            else {
                this.sweat1XPosInitial = random(30);
                this.sweat1YPos = 2;
                this.sweat1YPosMax = (random(10) + 10);
                this.sweat1Width = 1;
                this.sweat1Height = 2;
            } // if max vertical position is reached: reset all values for next drop
            if (this.sweat1YPos <= this.sweat1YPosMax / 2) {
                this.sweat1Width += 0.5;
                this.sweat1Height += 0.5;
            } // shape grows in first half of animation ...
            else {
                this.sweat1Width -= 0.1;
                this.sweat1Height -= 0.5;
            } // ... and shrinks in second half of animation
            this.sweat1XPos = int(this.sweat1XPosInitial - (this.sweat1Width / 2)); // keep the growing shape centered to initial x position
            d.fillRoundRect(this.sweat1XPos, this.sweat1YPos, this.sweat1Width, this.sweat1Height, this.sweatBorderradius); // draw sweat drop
            // Sweat drop 2 -> center area
            if (this.sweat2YPos <= this.sweat2YPosMax) {
                this.sweat2YPos += 0.5;
            } // vertical movement from initial to max
            else {
                this.sweat2XPosInitial = random((this.screenWidth - 60)) + 30;
                this.sweat2YPos = 2;
                this.sweat2YPosMax = (random(10) + 10);
                this.sweat2Width = 1;
                this.sweat2Height = 2;
            } // if max vertical position is reached: reset all values for next drop
            if (this.sweat2YPos <= this.sweat2YPosMax / 2) {
                this.sweat2Width += 0.5;
                this.sweat2Height += 0.5;
            } // shape grows in first half of animation ...
            else {
                this.sweat2Width -= 0.1;
                this.sweat2Height -= 0.5;
            } // ... and shrinks in second half of animation
            this.sweat2XPos = int(this.sweat2XPosInitial - (this.sweat2Width / 2)); // keep the growing shape centered to initial x position
            d.fillRoundRect(this.sweat2XPos, this.sweat2YPos, this.sweat2Width, this.sweat2Height, this.sweatBorderradius); // draw sweat drop
            // Sweat drop 3 -> right corner
            if (this.sweat3YPos <= this.sweat3YPosMax) {
                this.sweat3YPos += 0.5;
            } // vertical movement from initial to max
            else {
                this.sweat3XPosInitial = (this.screenWidth - 30) + (random(30));
                this.sweat3YPos = 2;
                this.sweat3YPosMax = (random(10) + 10);
                this.sweat3Width = 1;
                this.sweat3Height = 2;
            } // if max vertical position is reached: reset all values for next drop
            if (this.sweat3YPos <= this.sweat3YPosMax / 2) {
                this.sweat3Width += 0.5;
                this.sweat3Height += 0.5;
            } // shape grows in first half of animation ...
            else {
                this.sweat3Width -= 0.1;
                this.sweat3Height -= 0.5;
            } // ... and shrinks in second half of animation
            this.sweat3XPos = int(this.sweat3XPosInitial - (this.sweat3Width / 2)); // keep the growing shape centered to initial x position
            d.fillRoundRect(this.sweat3XPos, this.sweat3YPos, this.sweat3Width, this.sweat3Height, this.sweatBorderradius); // draw sweat drop
        }
        d.display(); // show drawings on display
    } // end of drawEyes method
    //*********************************************************************************************
    //  MOUTH (port addition)
    //*********************************************************************************************
    /** A lid in pixels for an eye h tall, eased like the original's eyelids. */
    easeLid(current, shape, h) {
        const int = (v) => this.int(v);
        const angle = Math.max(-1, Math.min(1, shape.angle));
        // A positive curve takes the middle further in; a negative one takes the corners further in instead, and the
        // bow brings the middle back to where it was
        const corners = h * Math.max(0, -shape.curve);
        const next = {
            inner: int(h * shape.height * Math.min(1, 1 - angle) + corners),
            outer: int(h * shape.height * Math.min(1, 1 + angle) + corners),
            bow: int(h * shape.curve),
        };
        return {
            inner: int((current.inner + next.inner) / 2),
            outer: int((current.outer + next.outer) / 2),
            bow: int((current.bow + next.bow) / 2),
        };
    }
    /**
     * The cut-outs for an eye's top and bottom lids, between its inner and outer edge (x positions,
     * either way round). A fully tilted lid with no curve is exactly the original's tired or angry
     * triangle.
     */
    lidCuts(innerX, outerX, y, h, lids) {
        const cuts = [];
        const midX = (innerX + outerX) / 2;
        // Each lid: its edge runs from the inner to the outer corner and bows by twice the curve at its
        // control point, so its middle comes in by the curve. The rest of the shape lies outside the eye.
        const lid = (lid, edgeY, dir, farY) => {
            if (Math.max(lid.inner, lid.outer, (lid.inner + lid.outer) / 2 + lid.bow) <= 0)
                return;
            const inner = [innerX, edgeY + dir * lid.inner];
            const outer = [outerX, edgeY + dir * lid.outer];
            const control = [midX, edgeY + dir * ((lid.inner + lid.outer) / 2 + lid.bow * 2)];
            cuts.push({
                kind: 'path',
                path: { start: [innerX, farY], segments: [{ to: inner }, { control, to: outer }, { to: [outerX, farY] }] },
            });
        };
        lid(lids.top, y - 1, 1, y - 1 - h); // as the original: the top lid starts a pixel above the eye
        lid(lids.bottom, y + h + 1, -1, y + h + 1 + h); // and the bottom lid a pixel below it
        return cuts;
    }
    /**
     * An eye's height while it blinks: blinkSpeed of the remaining way each frame. At 0.5 in "pixel" precision
     * this is exactly the original's int((current + next) / 2), including stopping a pixel short when opening.
     */
    blinkEase(current, target) {
        const value = current + (target - current) * this.blinkSpeed;
        // Snap the last half pixel in "smooth", or a closing eye would linger before it counts as closed and reopens
        if (this.precision === 'smooth')
            return Math.abs(target - value) < 0.5 ? target : value;
        const whole = Math.trunc(value);
        // Below half speed, a whole-pixel step can round to nothing: keep opening a pixel a frame, up to the
        // original's one-pixel-short stop
        if (whole === current && target - current > 1)
            return current + 1;
        return whole;
    }
    /** Halfway to the target each frame, like every value in the original. Always arrives, in both precisions. */
    ease(current, next, speed = 0.5) {
        const value = current + (next - current) * speed;
        if (this.precision === 'smooth')
            return Math.abs(next - value) < 0.05 ? next : value;
        // Round away from the current value so whole-number steps never stall one short of the target.
        const step = next > current ? Math.ceil(value) : Math.floor(value);
        return step;
    }
    /**
     * The mouth is one line, centred under the eyes, that moves with them (blinks leave it alone,
     * since the eyes close around their centre; it follows a head shake and a nod, and bounces on its
     * own when laughing). Its middle
     * stays straight; only the two corners bend, each by its own amount, over the outer quarter of
     * the line on each side.
     */
    drawMouth() {
        if (!this.mouth)
            return;
        const width = this.mouthWidthCurrent;
        // As the mouth shrinks below its own thickness it also thins, so it vanishes instead of leaving a dot.
        const thickness = Math.min(this.mouthThickness, width);
        if (thickness <= 0.2)
            return;
        const leftEdge = this.eyeLx;
        const rightEdge = this.cyclops ? this.eyeLx + this.eyeLwidthCurrent : this.eyeRx + this.eyeRwidthCurrent;
        const cx = (leftEdge + rightEdge) / 2 + this.shakeX;
        const eyeCentre = this.eyeLy + this.eyeLheightCurrent / 2;
        const tallest = Math.max(this.eyeLheightDefault, this.cyclops ? 0 : this.eyeRheightDefault); // the eyes' shared bottom edge
        const y = eyeCentre + this.eyeLheightDefault / 2 + (tallest - this.eyeLheightDefault) + this.mouthGapCurrent + this.mouthThickness / 2 + this.mouthShakeY;
        const x0 = cx - width / 2, x1 = cx + width / 2;
        const curl = width * this.mouthCurl; // how much of each end bends
        const clamp = (lift) => Math.max(-curl, Math.min(curl, lift)); // corners never bend further than they are long
        let left = this.mouthLeftCurrent, right = this.mouthRightCurrent;
        if (this.mouthFollowLook) {
            // 0 looking right or ahead, 1 looking left (fully mirrored a quarter of the way over), easing between
            const reach = this.getScreenConstraint_X();
            const mirror = reach > 0 ? Math.max(0, Math.min(1, (0.5 - this.eyeLx / reach) * 4)) : 0;
            [left, right] = [left + (right - left) * mirror, right + (left - right) * mirror];
        }
        const liftL = clamp(left), liftR = clamp(right);
        // The top edge is the line as before. With any opening, the bottom edge runs back under it, lower by the
        // corner's own opening at each end and by the centre's opening in between; a closed mouth is just the line.
        const open = this.mouthOpenCurrent, openL = this.mouthLeftOpenCurrent, openR = this.mouthRightOpenCurrent;
        const k = 0.4; // where each curl's control point sits along it
        const yt = y - this.mouthLipCurrent; // the top edge, raised by the upper lip
        if (open <= 0.05 && openL <= 0.05 && openR <= 0.05) {
            this.display.strokeLine({
                start: [x0, yt - liftL],
                segments: [
                    { control: [x0 + curl * k, yt], to: [x0 + curl, yt] },
                    { to: [x1 - curl, yt] },
                    { control: [x1 - curl * k, yt], to: [x1, yt - liftR] },
                ],
            }, thickness);
            return;
        }
        // One end of the mouth, from the inner end of its top curl, round the corner, down its side and back along the
        // bottom curl. The radius rounds where the side meets each curl: both are cut short, and a bend joins them.
        const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        const quad = (a, c, b, t) => lerp(lerp(a, c, t), lerp(c, b, t), t);
        const endOf = (dir, lift, own) => {
            const xe = dir < 0 ? x0 : x1, xi = xe - dir * curl, xc = xe - dir * curl * k;
            const r = Math.max(0, Math.min(this.mouthRadius, own / 2));
            // how far along a curl its cut is, so the bend takes about r of it
            const cut = (chord) => (r > 0.05 && chord > 0 ? Math.min(0.8, r / (chord * 1.1)) : 0);
            const topIn = [xi, yt], topCtl = [xc, yt], corner = [xe, yt - lift];
            const botIn = [xi, y + open], botCtl = [xc, y + open], bottom = [xe, y - lift + own];
            const tu = cut(Math.hypot(curl, lift)), bu = cut(Math.hypot(curl, y + open - bottom[1]));
            const nodes = [
                topIn, quad(topIn, topCtl, corner, 1 - tu), [xe, corner[1] + r], [xe, bottom[1] - r], quad(bottom, botCtl, botIn, bu), botIn,
            ];
            const controls = [lerp(topIn, topCtl, 1 - tu), corner, undefined, bottom, lerp(botCtl, botIn, bu)];
            return { nodes, controls };
        };
        const endR = endOf(1, liftR, openR), endL = endOf(-1, liftL, openL);
        const segments = [{ to: endR.nodes[0] }];
        endR.controls.forEach((control, i) => segments.push({ control, to: endR.nodes[i + 1] }));
        segments.push({ to: endL.nodes[5] });
        // the left end is the same shape mirrored, so it is walked backwards
        for (let i = 4; i >= 0; i--)
            segments.push({ control: endL.controls[i], to: endL.nodes[i] });
        this.display.strokeLine({ start: endL.nodes[0], segments }, thickness, true);
    }
}
const LEVEL = { height: 0, angle: 0, curve: 0 };
const NO_LID = { inner: 0, outer: 0, bow: 0 };
const OPEN_EYES = { top: LEVEL, bottom: LEVEL, closed: false };
/** An eye state with a patch laid over it. */
function eyesWith(base, patch) {
    const eyes = {
        top: { ...base.top, ...withoutNulls(patch?.top) },
        bottom: { ...base.bottom, ...withoutNulls(patch?.bottom) },
        closed: patch?.closed ?? base.closed,
    };
    // null takes it out of its folder
    const group = patch?.group === null ? undefined : patch?.group ?? base.group;
    if (group)
        eyes.group = group;
    for (const side of ['left', 'right']) {
        // null drops that eye's own lids, so it goes back to the shared ones
        const own = patch?.[side] === null ? {} : lidsWith(base[side], patch?.[side]);
        if (own.top || own.bottom)
            eyes[side] = own;
    }
    return eyes;
}
/** One eye's own lids with a patch laid over them; a lid with nothing in it is left out. */
function lidsWith(base, patch) {
    const lids = {};
    for (const which of ['top', 'bottom']) {
        const lid = { ...base?.[which], ...withoutNulls(patch?.[which]) };
        if (Object.keys(lid).length)
            lids[which] = lid;
    }
    return lids;
}
/** obj without the keys whose value is null or undefined, which mean "left out". */
function withoutNulls(obj) {
    return Object.fromEntries(Object.entries(obj ?? {}).filter(([, value]) => value !== null && value !== undefined));
}

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
 * - Laughing is a toggle (setLaugh(); anim_laugh() turns it on): the eyes lift and squint and the mouth opens
 *   and lifts with each bounce, until it is turned off. The original's anim_confused() is gone:
 *   shaking the head, and its new sibling nodding, are looks (see shakeHead and nod in a look),
 *   which swing the eyes and mouth together until another look is set.
 * ---------------------------------------------------------------------------------------------
 */

import {
    defaultConfig, mergeConfig, type EyeState, type FaceConfig, type FaceConfigPatch,
    type EyeLids, type LidShape, type LookState, type MoodConfig, type MouthState, type Patch, type Toggles, type Viseme,
} from './config.js';
import { textToVisemes, type SpeechOptions } from './speech.js';
export * from './config.js';
export { textToVisemes, type SpeechOptions } from './speech.js';

// For mood type switch
export const DEFAULT = 0;
export const SAD = 1;
export const TIRED = SAD; // the original's name for SAD
export const ANGRY = 2;
export const HAPPY = 3;
export const SMIRK = 4; // port: default eyes, one-sided smile (not in the original)
export const ASLEEP = 5; // port: closed eyes looking ahead, the closed gasp mouth's dot, no blinking (not in the original)
export const PEACEFUL = 6; // port: sleepy eyes looking ahead, no blinking (not in the original)
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
// for middle center set DEFAULT

export type Mood = typeof DEFAULT | typeof SAD | typeof ANGRY | typeof HAPPY | typeof SMIRK | typeof ASLEEP
    | typeof PEACEFUL | typeof WORRIED | typeof FURIOUS;
// Port: the mood constants name these entries of FaceConfig.moods
const MOOD_NAMES = ['default', 'sad', 'angry', 'happy', 'smirk', 'asleep', 'peaceful', 'worried', 'furious'];
// Port: the position constants name these entries of FaceConfig.looks
const POSITION_LOOKS = ['center', 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
// Port: each toggle and the field that holds it (shake is the original's horizontal flicker)
const TOGGLES = { autoblink: 'autoblinker', curious: 'curious', sweat: 'sweat', shake: 'hFlicker', talk: 'mouthTalk', laugh: 'laugh', cry: 'cry' } as const;
export type Position = typeof DEFAULT | typeof N | typeof NE | typeof E | typeof SE | typeof S | typeof SW | typeof W | typeof NW;
type Point = [number, number];

/** What RoboEyes draws with: the handful of primitives the original takes from Adafruit GFX. */
export interface Display {
    setSize(width: number, height: number): void;
    clearDisplay(): void;
    /** A filled rounded rectangle in the main colour, minus any cut-outs (the eyelids). */
    fillRoundRect(x: number, y: number, w: number, h: number, r: number, cutouts?: Cutout[]): void;
    /** A line of the given thickness with round ends, through the given points, in the main colour. closed: join the
     *  end back to the start and fill what it encloses, so the line becomes the edge of a solid shape. */
    strokeLine(points: MouthPath, thickness: number, closed?: boolean): void;
    display(): void;
}

export type Cutout =
    | { kind: 'triangle'; points: [Point, Point, Point] }
    | { kind: 'roundRect'; x: number; y: number; w: number; h: number; r: number }
    | { kind: 'path'; path: MouthPath };

/** A line or outline: a start point, then quadratic curves and straight segments. */
export type MouthPath = { start: Point; segments: Array<{ control?: Point; to: Point }> };

/** Draws onto a <canvas>. Sharp at any size and device pixel ratio. */
export class CanvasDisplay implements Display {
    private ctx: CanvasRenderingContext2D;
    private width = 128;
    private height = 64;
    background = 'transparent';
    main = '#ffffff';

    constructor(private canvas: HTMLCanvasElement, options: { background?: string; main?: string } = {}) {
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('RoboEyes: canvas 2D context is not available');
        this.ctx = ctx;
        if (options.background) this.background = options.background;
        if (options.main) this.main = options.main;
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.resize();
    }

    /** Matches the canvas's pixel size to how big it is on screen. Called on every frame, so CSS sizing just works. */
    private resize() {
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

    fillRoundRect(x: number, y: number, w: number, h: number, r: number, cutouts: Cutout[] = []) {
        if (w <= 0 || h <= 0) return;
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
            } else if (cut.kind === 'path') {
                tracePath(ctx, cut.path);
                ctx.closePath();
            } else {
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

    strokeLine(path: MouthPath, thickness: number, closed = false) {
        if (thickness <= 0) return;
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

    display() { /* drawing on a canvas is immediate */ }
}

function tracePath(ctx: CanvasRenderingContext2D, path: MouthPath) {
    ctx.moveTo(path.start[0], path.start[1]);
    for (const seg of path.segments) {
        if (seg.control) ctx.quadraticCurveTo(seg.control[0], seg.control[1], seg.to[0], seg.to[1]);
        else ctx.lineTo(seg.to[0], seg.to[1]);
    }
}

/** Adds a rounded rectangle to the current path, clamping the radius the way Adafruit GFX does. */
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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
function random(max: number) {
    return max > 0 ? Math.floor(Math.random() * max) : 0;
}

function millis() {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/** An eyelid in pixels: how far it comes in at the inner and outer corner, and how much further in the middle. */
interface LidPixels { inner: number; outer: number; bow: number }

export class RoboEyes {
    // Yes, everything is currently still accessible. Be responsible and don't mess things up :)

    display: Display;
    /** "pixel" keeps the original's whole-number maths; "smooth" allows fractions for softer motion. */
    precision: 'pixel' | 'smooth' = defaultConfig.modes.smooth ? 'smooth' : 'pixel';

    // For general setup - screen size and max. frame rate
    screenWidth = 128; // OLED display width, in pixels
    screenHeight = 64; // OLED display height, in pixels
    frameRate = defaultConfig.frameRate; // port: kept, so getConfig() gives back what was set
    frameInterval = Math.trunc(1000 / this.frameRate); // default value for 50 frames per second (1000/50 = 20 milliseconds)
    fpsTimer = 0; // for timing the frames per second

    // For controlling mood types and expressions
    // Port: a face is composed of face states (an eye state, a mouth state, a look and toggles), which moods
    // combine, instead of the original's tired/angry/happy flags. See config.ts.
    eyeStates: Record<string, EyeState> = structuredClone(defaultConfig.eyeStates);
    mouthStates: Record<string, MouthState> = structuredClone(defaultConfig.mouthStates);
    looks: Record<string, LookState> = structuredClone(defaultConfig.looks);
    moods: Record<string, MoodConfig> = structuredClone(defaultConfig.moods);
    mood = 'default'; // the mood set last
    baseMood = 'default'; // the last mood set to stay: what a temporary mood goes back to
    tempMoodEnd = 0; // when a temporary mood ends (millis()), 0 if the mood in use is not temporary
    eyeState = 'open';
    mouthState = 'softSmile';
    look = defaultConfig.look;
    eyesOverride: Patch<EyeState> | undefined; // the mood's changes to the eye state, while that state is in use
    mouthOverride: Partial<MouthState> | undefined; // the same for the mouth state
    toggleDefaults: Toggles = { ...defaultConfig.toggles }; // each toggle when a mood says nothing about it
    curious = defaultConfig.toggles.curious; // if true, draw the outer eye larger when looking left or right
    curiousGrowth = defaultConfig.curious.growth; // port: how much taller the outer eye gets
    curiousEdge = defaultConfig.curious.edge; // port: how close to the screen edge an eye must be to grow
    cyclops = defaultConfig.modes.cyclops; // if true, draw only one eye
    reducedMotion: boolean | 'auto' = defaultConfig.modes.reducedMotion; // port: keep each pose, stop what keeps moving
    eyeScale = 1; // port: how big the eyes are drawn, easing to the mood's scale
    eyesClosed = false; // port: true while the eye state keeps both eyes closed
    eyeLheld = false; // port: true while the eye state keeps the left eye closed (both, or a wink)
    eyeRheld = false; // port: the same for the right eye
    eyeL_open = false; // left eye opened or closed?
    eyeR_open = false; // right eye opened or closed?

    //*********************************************************************************************
    //  Eyes Geometry
    //*********************************************************************************************

    // EYE LEFT - size and border radius
    eyeLwidthDefault = defaultConfig.eyes.left.width;
    eyeLheightDefault = defaultConfig.eyes.left.height;
    eyeLwidthCurrent = this.eyeLwidthDefault;
    faceOffsetY = defaultConfig.eyes.offsetY; // port: how far the centred face is moved down from the screen's middle
    eyeClosedHeight = defaultConfig.eyes.closedHeight; // port: how tall a closed eye stays (the original: 1)
    eyeLheightCurrent = this.eyeClosedHeight; // start with closed eye, otherwise set to eyeLheightDefault
    eyeLwidthNext = this.eyeLwidthDefault;
    eyeLheightNext = this.eyeLheightDefault;
    eyeLheightOffset = 0;
    // Border Radius
    eyeLborderRadiusDefault = defaultConfig.eyes.left.radius;
    eyeLborderRadiusCurrent = this.eyeLborderRadiusDefault;
    eyeLborderRadiusNext = this.eyeLborderRadiusDefault;

    // EYE RIGHT - size and border radius
    eyeRwidthDefault = defaultConfig.eyes.right.width;
    eyeRheightDefault = defaultConfig.eyes.right.height;
    eyeRwidthCurrent = this.eyeRwidthDefault;
    eyeRheightCurrent = this.eyeClosedHeight; // start with closed eye, otherwise set to eyeRheightDefault
    eyeRwidthNext = this.eyeRwidthDefault;
    eyeRheightNext = this.eyeRheightDefault;
    eyeRheightOffset = 0;
    // Border Radius
    eyeRborderRadiusDefault = defaultConfig.eyes.right.radius;
    eyeRborderRadiusCurrent = this.eyeRborderRadiusDefault;
    eyeRborderRadiusNext = this.eyeRborderRadiusDefault;

    // Space between eyes
    spaceBetweenDefault = defaultConfig.eyes.spacing;
    spaceBetweenCurrent = this.spaceBetweenDefault;
    spaceBetweenNext = 10;

    // EYE LEFT - Coordinates
    eyeLxDefault = Math.trunc((this.screenWidth - (this.eyeLwidthDefault + this.spaceBetweenDefault + this.eyeRwidthDefault)) / 2);
    eyeLyDefault = Math.trunc((this.screenHeight - this.eyeLheightDefault) / 2);
    eyeLx = this.eyeLxDefault;
    eyeLy = this.eyeLyDefault;
    eyeLxNext = this.eyeLx;
    eyeLyNext = this.eyeLy;

    // EYE RIGHT - Coordinates
    eyeRxDefault = this.eyeLx + this.eyeLwidthCurrent + this.spaceBetweenDefault;
    eyeRyDefault = this.eyeLy;
    eyeRx = this.eyeRxDefault;
    eyeRy = this.eyeRyDefault;
    eyeRxNext = this.eyeRx;
    eyeRyNext = this.eyeRy;

    // BOTH EYES
    // Port: the top and bottom eyelids, in pixels, set from the eye state. They replace the original's
    // tired, angry and happy eyelids, which are the sad, angry and happy eye states.
    lids = {
        left: { top: NO_LID, bottom: NO_LID },
        right: { top: NO_LID, bottom: NO_LID },
    };

    //*********************************************************************************************
    //  Mouth (not in the original)
    //*********************************************************************************************

    mouth = defaultConfig.modes.mouth; // draw a mouth under the eyes
    mouthThickness = defaultConfig.mouth.thickness; // line thickness in pixels
    mouthRadius = defaultConfig.mouth.radius; // how round the corners of an open mouth are
    mouthCurl = defaultConfig.mouth.curl; // how much of each end of the line bends, as a fraction of its length
    mouthWidth = defaultConfig.mouth.width; // the face's own length, used when the mouth state does not set it
    mouthMoodWidth = defaultConfig.mouth.moodWidth; // whether the mouth state sets the length
    // Space between the bottom of the eyes and the mouth, which sets how high the mouth sits
    mouthGapCurrent = defaultConfig.mouth.gap;
    mouthGapNext = defaultConfig.mouth.gap;
    mouthWidthCurrent = 0; // starts closed and grows in with the eyes
    mouthWidthNext = this.mouthWidth;
    mouthLeftCurrent = 0;
    mouthFollowLook = false; // Port: swap the corners as the eyes look left
    mouthLeftNext = 0;
    mouthRightCurrent = 0;
    mouthRightNext = 0;
    // Port prototype: the mouth's centre is a rectangle that opens downwards, and each corner opens by its own amount
    mouthOpenCurrent = 0;
    mouthOpenNext = 0;
    mouthLeftOpenCurrent = 0;
    mouthLeftOpenNext = 0;
    mouthRightOpenCurrent = 0;
    mouthRightOpenNext = 0;

    //*********************************************************************************************
    //  Macro Animations
    //*********************************************************************************************

    // Animation - horizontal flicker/shiver. Port: the shake toggle.
    hFlicker = false;
    hFlickerAlternate = false;
    hFlickerAmplitude = defaultConfig.shake.amplitude;

    // Animation - vertical flicker/shiver. Port: kept for setVFlicker(), but not a toggle and not in the config.
    vFlicker = false;
    vFlickerAlternate = false;
    vFlickerAmplitude = 10;

    // Animation - auto blinking
    autoblinker = defaultConfig.toggles.autoblink; // activate auto blink animation. Port: a toggle, so moods set it
    blinkInterval = defaultConfig.blink.interval; // basic interval between each blink in full seconds
    blinkSpeed = defaultConfig.blink.speed; // port: how much of the remaining way an eye goes each frame while blinking
    blinkIntervalVariation = defaultConfig.blink.variation; // interval variaton range in full seconds, random number inside of given range will be add to the basic blinkInterval, set to 0 for no variation
    blinktimer = 0; // for organising eyeblink timing

    // Animation - idle mode: eyes looking in random directions. Port: true while the look wanders.
    idle = false;
    idleInterval = defaultConfig.wander.interval; // basic interval between each eye repositioning in full seconds
    idleIntervalVariation = defaultConfig.wander.variation; // interval variaton range in full seconds, random number inside of given range will be add to the basic idleInterval, set to 0 for no variation
    idleAnimationTimer = 0; // for organising eyeblink timing

    // Port: a follow look - eyes following the point lookAt() gave
    following = false;
    followFullX = defaultConfig.follow.fullX; // how far toward the edge the point must be for the eyes to turn fully across (the demo reads it)
    followFullY = defaultConfig.follow.fullY; // and down
    followX = 0.5; // where the eyes look while following, as fractions of how far they can move
    followY = 0.5;

    // Animation - shake head (a look, replacing the original's "confused"): eyes and mouth shaking left and right
    shakeHead = false;
    shakeHeadAmplitude = defaultConfig.shakeHead.amplitude; // port: how far the face swings to each side
    shakeHeadSpeed = defaultConfig.shakeHead.speed; // how much of the remaining way it goes each frame

    // Port: the talk toggle - the opening flaps at random, as a fraction of the mouth state's opening (or talkOpen)
    mouthTalk = false;
    mouthTalkLevel = 1;
    mouthTalkTimer = 0; // when the next syllable is due
    talkSyllableMs = defaultConfig.talk.syllableMs;
    talkVariationMs = defaultConfig.talk.variationMs;
    talkPauseChance = defaultConfig.talk.pauseChance;
    talkOpen = defaultConfig.talk.open; // how far a mouth state with no opening of its own opens
    talkLipLift = defaultConfig.talk.lipLift;
    talkCornerSway = defaultConfig.talk.cornerSway;
    // Each corner keeps its own time: how much of the opening it follows, and how far it sways, until its timer is up
    mouthTalkCorner = [1, 1];
    mouthTalkSway = [0, 0];
    mouthTalkCornerTimer = [0, 0];
    mouthLipCurrent = 0; // how far the upper lip is raised
    // Port: a viseme (a mouth shape of speech) overrides the random talk; speakVisemes() plays a list of them in turn
    visemes: Record<string, Viseme> = structuredClone(defaultConfig.talk.visemes);
    viseme: string | Viseme | null = null; // a name from the table, or a shape of its own
    visemeQueue: Array<{ viseme: string | Viseme; ms: number }> = [];
    visemeEnd = 0; // when the current viseme of the queue is over

    // Port: animation - nod head: eyes and mouth swinging down and up
    nod = false;
    nodAmplitude = defaultConfig.nod.amplitude; // how far the face swings down and up
    nodSpeed = defaultConfig.nod.speed;

    // Port: the laugh toggle - the face bounces with each "ha": the eyes lift and squint, the mouth opens and bounces with them
    laugh = defaultConfig.toggles.laugh;
    laughLevel = 0; // 0 to 1: how far into the laugh the face is, easing in and out as the toggle changes
    laughPhase = 0; // where the bounce is, in radians
    laughLast = 0; // when the laugh was last stepped, in milliseconds
    laughFrequency = defaultConfig.laugh.frequency; // bounces ("ha"s) per second
    laughAmplitude = defaultConfig.laugh.amplitude; // how far the eyes lift, in pixels
    laughMouthAmplitude = defaultConfig.laugh.mouthAmplitude; // how far the mouth lifts, in pixels
    laughSquint = defaultConfig.laugh.squint; // how far the bottom lids come up (the happy eyes' fraction of the eye's height)
    laughMouthOpen = defaultConfig.laugh.mouthOpen; // how far the mouth opens at the top of a bounce, in pixels
    laughY = 0; // the bounce now, added to the eyes
    laughMouthY = 0; // and to the mouth
    laughOpenAmount = 0; // 0 to 1: how open the mouth is for the laugh right now

    // Port: the laugh, shake and nod swings, drawn on top of the eye and mouth positions
    shakeX = 0;
    shakeXNext = 0;
    shakeY = 0;
    shakeYNext = 0;
    mouthShakeY = 0;
    mouthShakeYNext = 0;

    // Port: the cry toggle - teardrops run down from the outer corner of each eye
    cry = defaultConfig.toggles.cry;
    cryDrops = defaultConfig.cry.drops; // drops running at once from each eye
    crySpeed = defaultConfig.cry.speed; // how far a drop falls each frame, in pixels
    cryFall = defaultConfig.cry.fall; // how far a drop runs before it is gone, in pixels
    crySize = defaultConfig.cry.size; // a drop's width, in pixels
    cryRise = defaultConfig.cry.rise; // how far up inside the eye a drop starts, so it runs from the corner, in pixels
    cryFrequency = defaultConfig.cry.frequency; // sobs (bounces) per second
    cryAmplitude = defaultConfig.cry.amplitude; // how far the eyes lift each sob, in pixels
    cryMouthAmplitude = defaultConfig.cry.mouthAmplitude; // how far the mouth lifts each sob, in pixels
    cryLevel = 0; // 0 to 1: how far into the sobbing the face is, easing in and out as the toggle changes
    cryPhase = 0; // where the sob is, in radians
    cryLast = 0; // when the sobbing was last stepped, in milliseconds
    cryY = 0; // the sob now, added to the eyes
    cryMouthY = 0; // and to the mouth
    tears: { y: number; dx: number }[][] = [[], []]; // each eye's drops: how far they have fallen and how far they wander from the corner

    // Animation - sweat on the forehead
    sweat = false;
    sweatBorderradius = 3;

    // Sweat drop 1
    sweat1XPosInitial = 2;
    sweat1XPos = 0;
    sweat1YPos = 2;
    sweat1YPosMax = 0;
    sweat1Height = 2;
    sweat1Width = 1;

    // Sweat drop 2
    sweat2XPosInitial = 2;
    sweat2XPos = 0;
    sweat2YPos = 2;
    sweat2YPosMax = 0;
    sweat2Height = 2;
    sweat2Width = 1;

    // Sweat drop 3
    sweat3XPosInitial = 2;
    sweat3XPos = 0;
    sweat3YPos = 2;
    sweat3YPosMax = 0;
    sweat3Height = 2;
    sweat3Width = 1;

    private loop = 0;

    //*********************************************************************************************
    //  GENERAL METHODS
    //*********************************************************************************************

    /** Pass a canvas to draw on it, or any object implementing Display. config changes any default setting. */
    constructor(target: HTMLCanvasElement | Display, options: { precision?: 'pixel' | 'smooth'; config?: FaceConfigPatch } = {}) {
        this.display = 'getContext' in target ? new CanvasDisplay(target) : target;
        if (options.config) this.configure(options.config);
        if (options.precision) this.precision = options.precision;
        this.setMood(this.mood);
    }

    /** Port: every setting as one object, the shape configure() takes. */
    getConfig(): FaceConfig {
        return {
            frameRate: this.frameRate,
            eyes: {
                left: { width: this.eyeLwidthDefault, height: this.eyeLheightDefault, radius: this.eyeLborderRadiusDefault },
                right: { width: this.eyeRwidthDefault, height: this.eyeRheightDefault, radius: this.eyeRborderRadiusDefault },
                spacing: this.spaceBetweenDefault,
                closedHeight: this.eyeClosedHeight,
                offsetY: this.faceOffsetY,
            },
            mouth: {
                gap: this.mouthGapNext, thickness: this.mouthThickness, radius: this.mouthRadius, curl: this.mouthCurl,
                width: this.mouthWidth, moodWidth: this.mouthMoodWidth,
            },
            blink: { interval: this.blinkInterval, variation: this.blinkIntervalVariation, speed: this.blinkSpeed },
            wander: { interval: this.idleInterval, variation: this.idleIntervalVariation },
            curious: { growth: this.curiousGrowth, edge: this.curiousEdge },
            follow: { fullX: this.followFullX, fullY: this.followFullY },
            laugh: { frequency: this.laughFrequency, amplitude: this.laughAmplitude, mouthAmplitude: this.laughMouthAmplitude, squint: this.laughSquint, mouthOpen: this.laughMouthOpen },
            cry: { drops: this.cryDrops, speed: this.crySpeed, fall: this.cryFall, size: this.crySize, rise: this.cryRise, frequency: this.cryFrequency, amplitude: this.cryAmplitude, mouthAmplitude: this.cryMouthAmplitude },
            shakeHead: { amplitude: this.shakeHeadAmplitude, speed: this.shakeHeadSpeed },
            talk: { syllableMs: this.talkSyllableMs, variationMs: this.talkVariationMs, pauseChance: this.talkPauseChance, open: this.talkOpen, lipLift: this.talkLipLift, cornerSway: this.talkCornerSway, visemes: structuredClone(this.visemes) },
            nod: { amplitude: this.nodAmplitude, speed: this.nodSpeed },
            shake: { amplitude: this.hFlickerAmplitude },
            modes: { cyclops: this.cyclops, mouth: this.mouth, smooth: this.precision === 'smooth', reducedMotion: this.reducedMotion },
            look: this.look,
            toggles: { ...this.toggleDefaults },
            eyeStates: structuredClone(this.eyeStates),
            mouthStates: structuredClone(this.mouthStates),
            looks: structuredClone(this.looks),
            moods: structuredClone(this.moods),
        };
    }

    /** Port: change any settings at once. What the patch leaves out keeps its current value. */
    configure(patch: FaceConfigPatch) {
        const c = mergeConfig(this.getConfig(), patch);
        const l = c.eyes.left, r = c.eyes.right;
        this.setFramerate(c.frameRate);
        // Only what changed, so an eye that is closed right now stays closed
        if (l.width !== this.eyeLwidthDefault || r.width !== this.eyeRwidthDefault) this.setWidth(l.width, r.width);
        if (l.height !== this.eyeLheightDefault || r.height !== this.eyeRheightDefault) this.setHeight(l.height, r.height);
        if (l.radius !== this.eyeLborderRadiusDefault || r.radius !== this.eyeRborderRadiusDefault) this.setBorderradius(l.radius, r.radius);
        if (c.eyes.spacing !== this.spaceBetweenDefault) this.setSpacebetween(c.eyes.spacing);
        // An eye that is closing or closed takes the new height too
        const closed = this.eyeClosedHeight;
        this.eyeClosedHeight = Math.max(0, c.eyes.closedHeight);
        this.faceOffsetY = c.eyes.offsetY;
        if (this.eyeLheightNext === closed) this.eyeLheightNext = this.eyeClosedHeight;
        if (this.eyeRheightNext === closed) this.eyeRheightNext = this.eyeClosedHeight;
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
        this.followFullX = Math.max(0.05, Math.min(1, c.follow.fullX));
        this.followFullY = Math.max(0.05, Math.min(1, c.follow.fullY));
        this.laughAmplitude = c.laugh.amplitude;
        this.laughMouthAmplitude = c.laugh.mouthAmplitude;
        this.laughFrequency = c.laugh.frequency;
        this.laughSquint = c.laugh.squint;
        this.laughMouthOpen = c.laugh.mouthOpen;
        this.cryDrops = Math.max(0, Math.min(2, Math.round(c.cry.drops))); // two lanes at most
        this.crySpeed = Math.max(0.1, c.cry.speed);
        this.cryFall = Math.max(1, c.cry.fall);
        this.crySize = Math.max(1, c.cry.size);
        this.cryRise = Math.max(0, c.cry.rise);
        this.cryFrequency = c.cry.frequency;
        this.cryAmplitude = c.cry.amplitude;
        this.cryMouthAmplitude = c.cry.mouthAmplitude;
        this.shakeHeadAmplitude = c.shakeHead.amplitude;
        this.shakeHeadSpeed = Math.max(0.05, Math.min(0.8, c.shakeHead.speed));
        this.talkSyllableMs = Math.max(20, c.talk.syllableMs);
        this.talkVariationMs = Math.max(0, c.talk.variationMs);
        this.talkPauseChance = Math.max(0, Math.min(1, c.talk.pauseChance));
        this.talkOpen = Math.max(0, c.talk.open);
        this.talkLipLift = Math.max(0, c.talk.lipLift);
        this.talkCornerSway = Math.max(0, c.talk.cornerSway);
        this.visemes = structuredClone(c.talk.visemes);
        this.nodAmplitude = c.nod.amplitude;
        this.nodSpeed = Math.max(0.05, Math.min(0.8, c.nod.speed));
        this.hFlickerAmplitude = c.shake.amplitude;
        this.cyclops = c.modes.cyclops;
        this.mouth = c.modes.mouth;
        this.precision = c.modes.smooth ? 'smooth' : 'pixel';
        this.reducedMotion = c.modes.reducedMotion;
        this.toggleDefaults = { ...c.toggles };
        // Each state gets whatever it leaves out from a level, open, unbent one
        this.eyeStates = {};
        for (const [name, state] of Object.entries(c.eyeStates)) this.eyeStates[name] = eyesWith(OPEN_EYES, state);
        this.mouthStates = {};
        for (const [name, state] of Object.entries(c.mouthStates)) {
            this.mouthStates[name] = { left: state.left ?? 0, right: state.right ?? 0 };
            for (const key of ['open', 'leftOpen', 'rightOpen'] as const) if (state[key]) this.mouthStates[name][key] = state[key];
            if (state.width !== undefined && state.width !== null) this.mouthStates[name].width = state.width;
            if (state.ownWidth) this.mouthStates[name].ownWidth = true;
            if (state.followLook) this.mouthStates[name].followLook = true;
            if (state.group) this.mouthStates[name].group = state.group;
        }
        this.looks = {};
        for (const [name, look] of Object.entries(c.looks)) {
            this.looks[name] = { x: look.x ?? 0.5, y: look.y ?? 0.5 };
            if (look.group) this.looks[name].group = look.group;
            if (look.wander) this.looks[name].wander = typeof look.wander === 'object' ? withoutNulls(look.wander) : true;
            if (look.follow) this.looks[name].follow = true;
            if (look.shakeHead) this.looks[name].shakeHead = true;
            if (look.nod) this.looks[name].nod = true;
        }
        this.moods = {};
        for (const [name, mood] of Object.entries(c.moods)) this.moods[name] = withoutNulls(mood);
        if (!this.moods.default) this.moods.default = {}; // setMood() falls back to it
        // The face states in use stay in use, now with their new values
        this.applyEyes(this.eyeState, this.eyesOverride);
        this.applyMouth(this.mouthState, this.mouthOverride);
        this.setLook(c.look);
    }

    /** Whole numbers in "pixel" precision, like the original's int and byte maths; unchanged in "smooth". */
    private int(value: number) {
        return this.precision === 'pixel' ? Math.trunc(value) : value;
    }

    // Startup RoboEyes with defined screen-width, screen-height and max. frames per second
    begin(width: number, height: number, frameRate: number) {
        this.screenWidth = width; // OLED display width, in pixels
        this.screenHeight = height; // OLED display height, in pixels
        this.display.setSize(width, height);
        this.display.clearDisplay(); // clear the display buffer
        this.display.display(); // show empty screen
        this.eyeLheightCurrent = this.eyeClosedHeight; // start with closed eyes
        this.eyeRheightCurrent = this.eyeClosedHeight; // start with closed eyes
        this.setFramerate(frameRate); // calculate frame interval based on defined frameRate
        // Port: the eyes' widths and spacing may still be easing from the library defaults to the configured ones; settle
        // them first, or the look is worked out for the wrong size and the face starts off-centre.
        this.eyeLwidthCurrent = this.eyeLwidthNext;
        this.eyeRwidthCurrent = this.eyeRwidthNext;
        this.spaceBetweenCurrent = this.spaceBetweenNext;
        // Port: centre the eyes for the new screen size straight away, then take up the look.
        this.eyeLxNext = this.int(this.getScreenConstraint_X() / 2);
        this.eyeLyNext = this.eyeYAt(0.5);
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
        if (!this.loop) this.loop = requestAnimationFrame(tick);
    }

    stop() {
        cancelAnimationFrame(this.loop);
        this.loop = 0;
    }

    //*********************************************************************************************
    //  SETTERS METHODS
    //*********************************************************************************************

    // Calculate frame interval based on defined frameRate
    setFramerate(fps: number) {
        this.frameRate = fps;
        this.frameInterval = Math.trunc(1000 / fps);
    }

    // Set color values. Any CSS colour; 'transparent' background lets the page show through.
    setDisplayColors(background: string, main: string) {
        if (this.display instanceof CanvasDisplay) {
            this.display.background = background;
            this.display.main = main;
        }
    }

    setWidth(leftEye: number, rightEye: number) {
        this.eyeLwidthNext = leftEye;
        this.eyeRwidthNext = rightEye;
        this.eyeLwidthDefault = leftEye;
        this.eyeRwidthDefault = rightEye;
    }

    setHeight(leftEye: number, rightEye: number) {
        this.eyeLheightNext = leftEye;
        this.eyeRheightNext = rightEye;
        this.eyeLheightDefault = leftEye;
        this.eyeRheightDefault = rightEye;
    }

    // Set border radius for left and right eye
    setBorderradius(leftEye: number, rightEye: number) {
        this.eyeLborderRadiusNext = leftEye;
        this.eyeRborderRadiusNext = rightEye;
        this.eyeLborderRadiusDefault = leftEye;
        this.eyeRborderRadiusDefault = rightEye;
    }

    // Set space between the eyes, can also be negative
    setSpacebetween(space: number) {
        this.spaceBetweenNext = space;
        this.spaceBetweenDefault = space;
    }

    // Set mood expression. Port: a mood constant (SAD...) or the name of any entry in moods. The mood picks the face
    // states: its eye and mouth states (open and softSmile if it leaves them out, with its override), its toggles
    // (their defaults if it leaves them out) and its look. Whatever a mood leaves out comes from the default mood, then
    // from open, softSmile, wander and the toggle defaults, so nothing the previous mood picked carries over. { for: ms }
    // makes the mood temporary: after that long the face goes back to the last mood set without it (a temporary mood
    // set during another goes back to that same one).
    setMood(mood: Mood | string, options: { for?: number } = {}) {
        const name = typeof mood === 'number' ? MOOD_NAMES[mood] : mood;
        const next = name in this.moods ? name : 'default';
        if (options.for && options.for > 0) {
            if (!this.tempMoodEnd) this.baseMood = this.mood;
            this.tempMoodEnd = millis() + options.for;
        } else {
            this.baseMood = next;
            this.tempMoodEnd = 0;
        }
        this.mood = next;
        const m = this.moods[this.mood], base = this.moods.default;
        for (const [key, field] of Object.entries(TOGGLES) as [keyof Toggles, typeof TOGGLES[keyof Toggles]][]) {
            this[field] = m[key] ?? base[key] ?? this.toggleDefaults[key];
        }
        // The mood's override changes the state it ends up with, but the default mood's does not pass on to another mood's
        this.applyEyes(m.eyes ?? base.eyes ?? 'open', m.override?.eyes ?? undefined);
        this.applyMouth(m.mouth ?? base.mouth ?? 'softSmile', m.override?.mouth ?? undefined);
        this.setLook(m.look ?? base.look ?? 'wander');
    }

    // Port: set the eye state by name (see eyeStates), whatever the mood
    setEyes(name: string) {
        this.applyEyes(name);
    }

    // Port: set the mouth state by name (see mouthStates), whatever the mood
    setMouthState(name: string) {
        this.applyMouth(name);
    }

    // Port: set the look by name (see looks): a place for the eyes to go, or wander
    setLook(name: string) {
        const look = this.looks[name];
        if (!look) return;
        this.look = name;
        if (look.wander) {
            if (!this.idle) this.idleAnimationTimer = 0; // move on straight away
            this.idle = true;
            this.following = false;
            return;
        }
        this.idle = false;
        this.following = !!look.follow;
        if (look.follow) {
            this.followX = look.x;
            this.followY = look.y;
            return; // drawEyes() places the eyes
        }
        const fraction = (v: number) => Math.max(0, Math.min(1, v));
        this.eyeLxNext = this.int(this.getScreenConstraint_X() * fraction(look.x));
        this.eyeLyNext = this.eyeYAt(look.y);
    }

    /** Port: where a follow look points, as fractions of how far the eyes can move (x: 0 left, 1 right; y: 0 up, 1 down).
     *  Call it as often as the target moves, e.g. from a mousemove handler. */
    lookAt(x: number, y: number) {
        this.followX = Math.max(0, Math.min(1, x));
        this.followY = Math.max(0, Math.min(1, y));
    }

    /** Port: the eye state in use, with the mood's changes to it. */
    currentEyes(): EyeState {
        return eyesWith(this.eyeStates[this.eyeState] ?? OPEN_EYES, this.eyesOverride);
    }

    /** Port: the mouth state in use, with the mood's changes to it. */
    currentMouth(): MouthState {
        return { ...(this.mouthStates[this.mouthState] ?? { left: 0, right: 0 }), ...withoutNulls(this.mouthOverride) };
    }

    // The eyelids follow the eye state every frame; closing and opening happen here
    private applyEyes(name: string, override?: Patch<EyeState>) {
        this.eyeState = name;
        this.eyesOverride = override;
        const closed = this.currentEyes().closed;
        const left = closed === true || closed === 'left', right = closed === true || closed === 'right';
        // Close or open only the eyes that change, so an open eye doesn't blink on the way
        if (left !== this.eyeLheld) {
            if (left) this.close(true, false);
            else this.open(true, false);
        }
        if (right !== this.eyeRheld) {
            if (right) this.close(false, true);
            else this.open(false, true);
        }
        this.eyeLheld = left;
        this.eyeRheld = right;
        this.eyesClosed = left && right;
    }

    // The mouth is set here, so setMouthWidth() and setMouthCorners() can still change it afterwards
    private applyMouth(name: string, override?: Partial<MouthState>) {
        this.mouthState = name;
        this.mouthOverride = override;
        const shape = this.currentMouth();
        const ownWidth = (this.mouthMoodWidth || shape.ownWidth) && shape.width !== undefined;
        this.mouthWidthNext = ownWidth ? shape.width! : this.mouthWidth;
        this.mouthLeftNext = shape.left;
        this.mouthRightNext = shape.right;
        this.mouthOpenNext = Math.max(0, shape.open ?? 0);
        this.mouthLeftOpenNext = Math.max(0, shape.leftOpen ?? 0);
        this.mouthRightOpenNext = Math.max(0, shape.rightOpen ?? 0);
        this.mouthFollowLook = !!shape.followLook;
    }

    // Set predefined position. Port: each position is a look (center, N, NE ...), so this is setLook() by another name.
    setPosition(position: Position) {
        this.setLook(POSITION_LOOKS[position] ?? 'center');
    }

    // Set automated eye blinking, minimal blink interval in full seconds and blink interval variation range in full seconds
    // Port: auto blink is a toggle, so the next mood sets it again.
    setAutoblinker(active: boolean, interval?: number, variation?: number) {
        this.autoblinker = active;
        if (interval !== undefined) this.blinkInterval = interval;
        if (variation !== undefined) this.blinkIntervalVariation = variation;
    }

    // Set idle mode - automated eye repositioning, minimal time interval in full seconds and time interval variation range in full seconds
    // Port: idle mode is the wander look. Turning it off looks to the center.
    setIdleMode(active: boolean, interval?: number, variation?: number) {
        if (active) this.setLook('wander');
        else if (this.idle) this.setLook('center');
        if (interval !== undefined) this.idleInterval = interval;
        if (variation !== undefined) this.idleIntervalVariation = variation;
    }

    // Set curious mode - the respectively outer eye gets larger when looking left or right.
    // Port: a toggle, so the next mood sets it again.
    setCuriosity(curiousBit: boolean) {
        this.curious = curiousBit;
    }

    // Set cyclops mode - show only one eye
    setCyclops(cyclopsBit: boolean) {
        this.cyclops = cyclopsBit;
    }

    // Port: the shake toggle - the eyes jitter left and right every frame. The next mood sets it again.
    setShake(shakeBit: boolean, amplitude?: number) {
        this.hFlicker = shakeBit;
        if (amplitude !== undefined) this.hFlickerAmplitude = amplitude; // in pixels
    }

    // Set horizontal flickering (displacing eyes left/right). Port: the shake toggle, so this is setShake().
    setHFlicker(flickerBit: boolean, amplitude?: number) {
        this.setShake(flickerBit, amplitude);
    }

    // Set vertical flickering (displacing eyes up/down). Port: not a toggle, so no mood changes it.
    setVFlicker(flickerBit: boolean, amplitude?: number) {
        this.vFlicker = flickerBit; // turn flicker on or off
        if (amplitude !== undefined) this.vFlickerAmplitude = amplitude; // define amplitude of flickering in pixels
    }

    // Port: a toggle, so the next mood sets it again.
    setSweat(sweatBit: boolean) {
        this.sweat = sweatBit; // turn sweat on or off
    }

    // Port: the cry toggle - teardrops run down from under the eyes. The next mood sets it again.
    setCry(cryBit: boolean) {
        this.cry = cryBit;
    }

    // Port: mouth on or off. Off keeps the original's layout exactly; on reserves a strip under the eyes.
    setMouth(mouthBit: boolean) {
        this.mouth = mouthBit;
        this.setLook(this.look); // the eyes have more or less room now
    }

    // Port: length of the mouth line in pixels. 0 shrinks it away completely.
    setMouthWidth(width: number) {
        this.mouthWidthNext = Math.max(0, width);
    }

    // Port: how far the mouth corners bend, in pixels. Positive up (smile), negative down (frown).
    // With one argument, both corners.
    setMouthCorners(left: number, right = left) {
        this.mouthLeftNext = left;
        this.mouthRightNext = right;
    }

    // Port: the talk toggle - the mouth keeps opening and closing, whatever the mouth state. The next mood sets it again.
    setTalk(talkBit: boolean) {
        this.mouthTalk = talkBit;
    }

    // Port: hold the mouth in a viseme (a key of talk.visemes), or null to go back to the toggle. It talks even with the toggle off.
    setViseme(name: string | null) {
        this.visemeQueue = [];
        this.visemeEnd = 0;
        this.viseme = name !== null && this.visemes[name] ? name : null;
    }

    // Port: say some text: its spelling is turned into mouth shapes (see speech.ts) and played. Returns how long it takes in ms.
    speak(text: string, options?: SpeechOptions): number {
        const sequence = textToVisemes(text, this.visemes, options);
        this.speakVisemes(sequence);
        return sequence.reduce((total, step) => total + step.ms, 0);
    }

    // Port: play visemes one after another, each for its ms, then go back to the toggle. A viseme is a name from the table
    // (an unknown one is the rest shape) or a shape of its own.
    speakVisemes(sequence: Array<{ viseme: string | Viseme; ms: number }>) {
        this.visemeQueue = sequence.slice();
        this.visemeEnd = 0;
        if (!this.visemeQueue.length) this.viseme = null;
    }

    // Port: how high the mouth sits, as the space in pixels between the bottom of the eyes and the mouth
    setMouthGap(gap: number) {
        this.mouthGapNext = Math.max(0, gap);
    }

    //*********************************************************************************************
    //  GETTERS METHODS
    //*********************************************************************************************

    // Returns the max x position for left eye
    getScreenConstraint_X() {
        return this.screenWidth - this.eyeLwidthCurrent - this.spaceBetweenCurrent - this.eyeRwidthCurrent;
    }

    // Port: the y of the eyes (their top) for a look's y, 0 up to 1 down. The middle, 0.5, centres the eyes and the mouth
    // together on the screen (moved by faceOffsetY); 0 puts the eyes at the top of the screen, and 1 as low as the mouth
    // can go without leaving it. Heights are the default ones, because height varies when blinking and in curious mode.
    eyeYAt(fraction: number) {
        const f = Math.max(0, Math.min(1, fraction));
        const eyes = Math.max(this.eyeLheightDefault, this.cyclops ? 0 : this.eyeRheightDefault);
        const below = this.mouth ? this.mouthGapNext + this.mouthThickness + this.mouthReach() : 0; // what hangs under the eyes
        const lowest = Math.max(0, this.screenHeight - eyes - below);
        const middle = Math.max(0, Math.min(lowest, (this.screenHeight - eyes - (this.mouth ? this.mouthGapNext + this.mouthThickness : 0)) / 2 + this.faceOffsetY));
        return this.int(f < 0.5 ? middle * f * 2 : middle + (lowest - middle) * (f - 0.5) * 2);
    }

    // Port: how far the mouth in use reaches below its line: its opening, a corner's opening below that corner's own bend, or
    // a corner bent down. A talking mouth opens at least as far as talk.open.
    mouthReach() {
        const m = this.currentMouth();
        const droop = Math.min(this.mouthWidth * this.mouthCurl, Math.max(0, -(m.left ?? 0), -(m.right ?? 0)));
        const open = Math.max(m.open ?? 0, (m.leftOpen ?? 0) - (m.left ?? 0), (m.rightOpen ?? 0) - (m.right ?? 0), droop);
        return Math.max(open, this.mouthTalk || this.viseme ? this.talkOpen : 0);
    }

    // Port: whether to hold still, from modes.reducedMotion ('auto': the system's prefers-reduced-motion setting)
    motionReduced() {
        if (this.reducedMotion !== 'auto') return this.reducedMotion;
        if (typeof matchMedia !== 'function') return false;
        this.motionQuery ??= matchMedia('(prefers-reduced-motion: reduce)'); // asked once, but read every frame
        return this.motionQuery.matches;
    }
    private motionQuery?: MediaQueryList;

    //*********************************************************************************************
    //  BASIC ANIMATION METHODS
    //*********************************************************************************************

    // Close eye(s). With no arguments, both eyes.
    private close(left = true, right = true) {
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
    private open(left = true, right = true) {
        if (left) this.eyeL_open = true; // left eye opened - if true, drawEyes() will take care of opening eyes again
        if (right) this.eyeR_open = true; // right eye opened
    }

    // Trigger eyeblink(s) animation. With no arguments, both eyes.
    blink(left = true, right = true) {
        this.close(left, right);
        this.open(left, right);
    }

    //*********************************************************************************************
    //  MACRO ANIMATION METHODS
    //*********************************************************************************************

    // Port: the laugh toggle - laughs until turned off. The next mood sets it again.
    setLaugh(laughBit: boolean) {
        this.laugh = laughBit;
    }

    // The original's one-shot laugh. Port: laughing is a toggle now, so this turns it on.
    anim_laugh() {
        this.setLaugh(true);
    }

    //*********************************************************************************************
    //  PRE-CALCULATIONS AND ACTUAL DRAWINGS
    //*********************************************************************************************

    drawEyes() {
        const int = (v: number) => this.int(v);

        //// PRE-CALCULATIONS - EYE SIZES AND VALUES FOR ANIMATION TWEENINGS ////

        // Vertical size offset for larger eyes when looking left or right (curious gaze)
        if (this.curious) {
            if (this.eyeLxNext <= this.curiousEdge) { this.eyeLheightOffset = this.curiousGrowth; }
            else if (this.eyeLxNext >= (this.getScreenConstraint_X() - this.curiousEdge) && this.cyclops) { this.eyeLheightOffset = this.curiousGrowth; }
            else { this.eyeLheightOffset = 0; } // left eye
            if (this.eyeRxNext >= this.screenWidth - this.eyeRwidthCurrent - this.curiousEdge) { this.eyeRheightOffset = this.curiousGrowth; }
            else { this.eyeRheightOffset = 0; } // right eye
        } else {
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
            if (this.eyeLheightCurrent <= this.eyeClosedHeight + this.eyeLheightOffset) { this.eyeLheightNext = this.eyeLheightDefault; }
        }
        if (this.eyeR_open) {
            if (this.eyeRheightCurrent <= this.eyeClosedHeight + this.eyeRheightOffset) { this.eyeRheightNext = this.eyeRheightDefault; }
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

        // Port: a temporary mood ends, back to the one underneath
        if (this.tempMoodEnd && millis() >= this.tempMoodEnd) this.setMood(this.baseMood);
        // Port: the mood sets how big the eyes are drawn, and how often they blink
        const mood = this.moods[this.mood] ?? {}, baseMood = this.moods.default ?? {}; // what a mood leaves out is the default mood's
        // (halfway each frame, but never in whole numbers: it is a multiple, so "pixel" precision rounds the sizes instead)
        const scale = Math.max(0.1, mood.scale ?? baseMood.scale ?? 1);
        this.eyeScale = Math.abs(scale - this.eyeScale) < 0.005 ? scale : (this.eyeScale + scale) / 2;
        // Port: with reduced motion, each pose holds and nothing keeps moving
        const still = this.motionReduced();

        // Port: mouth length, height and corners ease the same way
        const now = millis();
        if (this.visemeQueue.length && now >= this.visemeEnd) {
            const next = this.visemeQueue.shift()!;
            this.viseme = typeof next.viseme === 'string' && !this.visemes[next.viseme] ? 'rest' : next.viseme;
            this.visemeEnd = now + Math.max(0, next.ms);
        } else if (!this.visemeQueue.length && this.viseme && this.visemeEnd && now >= this.visemeEnd) {
            this.viseme = null; // the last one of the list is over
            this.visemeEnd = 0;
        }
        const shape = typeof this.viseme === 'string' ? this.visemes[this.viseme] : this.viseme ?? undefined;
        const talking = this.mouthTalk || !!shape;
        this.mouthWidthCurrent = this.ease(this.mouthWidthCurrent, this.mouthWidthNext * (shape?.width ?? 1));
        this.mouthGapCurrent = this.ease(this.mouthGapCurrent, this.mouthGapNext);
        // Port: a talking mouth picks a new opening each syllable, sometimes shut for a gap between words. The upper lip
        // lifts with the opening, and each corner follows it only loosely, on its own timing, and sways a little.
        if (this.mouthTalk && !shape && still) {
            this.mouthTalkLevel = 0; // the talking mouth rests shut
            this.mouthTalkSway = [0, 0];
        } else if (this.mouthTalk && !shape) {
            if (now >= this.mouthTalkTimer) {
                this.mouthTalkLevel = Math.random() < this.talkPauseChance ? 0 : 0.35 + Math.random() * 0.65;
                this.mouthTalkTimer = now + this.talkSyllableMs + random(this.talkVariationMs);
            }
            for (const side of [0, 1]) {
                if (now < this.mouthTalkCornerTimer[side]) continue;
                this.mouthTalkCorner[side] = 0.6 + Math.random() * 0.4;
                this.mouthTalkSway[side] = (Math.random() * 2 - 1) * this.talkCornerSway;
                this.mouthTalkCornerTimer[side] = now + this.talkSyllableMs * (0.6 + Math.random() * 0.8) + random(this.talkVariationMs);
            }
        }
        // A viseme sets the whole shape; the random talk sets the opening and lets the corners follow it loosely
        const talk = shape ? shape.open : this.mouthTalk ? this.mouthTalkLevel : 1;
        const [cornerL, cornerR] = shape ? [shape.corner, shape.corner] : this.mouthTalk ? this.mouthTalkCorner : [1, 1];
        const [swayL, swayR] = shape ? [shape.lift, shape.lift] : this.mouthTalk ? this.mouthTalkSway.map(sway => sway * talk) : [0, 0];
        this.mouthLeftCurrent = this.ease(this.mouthLeftCurrent, this.mouthLeftNext + swayL);
        this.mouthRightCurrent = this.ease(this.mouthRightCurrent, this.mouthRightNext + swayR);
        this.mouthLipCurrent = this.ease(this.mouthLipCurrent, shape ? shape.lip * this.talkLipLift : this.mouthTalk ? talk * this.talkLipLift : 0);
        // A mouth state with no opening of its own opens by talkOpen in the middle and less at the corners (as wideSmile does)
        const bare = talking &&!(this.mouthOpenNext > 0 || this.mouthLeftOpenNext > 0 || this.mouthRightOpenNext > 0);
        const [open, openL, openR] = bare ? [this.talkOpen, this.talkOpen * 0.4, this.talkOpen * 0.4] : [this.mouthOpenNext, this.mouthLeftOpenNext, this.mouthRightOpenNext];
        this.mouthOpenCurrent = this.ease(this.mouthOpenCurrent, open * talk);
        this.mouthLeftOpenCurrent = this.ease(this.mouthLeftOpenCurrent, openL * talk * cornerL);
        this.mouthRightOpenCurrent = this.ease(this.mouthRightOpenCurrent, openR * talk * cornerR);
        // Port: a laugh opens the mouth at least as far as the laugh needs, and lifts its corners, over whatever it was doing
        if (this.laughLevel > 0) {
            const laughShape = this.mouthStates.laugh, wide = this.laughMouthOpen * this.laughOpenAmount;
            this.mouthOpenCurrent = Math.max(this.mouthOpenCurrent, this.int(wide));
            this.mouthLeftOpenCurrent = Math.max(this.mouthLeftOpenCurrent, this.int(wide * 0.6));
            this.mouthRightOpenCurrent = Math.max(this.mouthRightOpenCurrent, this.int(wide * 0.6));
            this.mouthLeftCurrent = Math.max(this.mouthLeftCurrent, this.int((laughShape?.left ?? 0) * this.laughLevel));
            this.mouthRightCurrent = Math.max(this.mouthRightCurrent, this.int((laughShape?.right ?? 0) * this.laughLevel));
        }

        //// APPLYING MACRO ANIMATIONS ////

        if (this.autoblinker && !this.eyesClosed && !still) {
            if (millis() >= this.blinktimer) {
                this.blink(!this.eyeLheld, !this.eyeRheld); // port: a winking eye stays closed
                const interval = mood.blink?.interval ?? baseMood.blink?.interval ?? this.blinkInterval, variation = mood.blink?.variation ?? baseMood.blink?.variation ?? this.blinkIntervalVariation; // port: the mood's timing, if it has one
                this.blinktimer = millis() + (interval * 1000) + (Math.random() * variation * 1000); // calculate next time for blinking
            }
        }

        // Port: a look that shakes the head or nods starts the swing, which keeps going until the look changes
        const shaking = !still && !!this.looks[this.look]?.shakeHead, nodding = !still && !!this.looks[this.look]?.nod;
        if (shaking !== this.shakeHead) {
            this.shakeHead = shaking;
            this.shakeXNext = shaking ? -this.shakeHeadAmplitude : 0;
        }
        if (nodding !== this.nod) {
            this.nod = nodding;
            this.shakeYNext = nodding ? this.nodAmplitude : 0;
            this.mouthShakeYNext = this.shakeYNext;
        }

        // Laughing - the toggle eases the laugh in and out; each bounce lifts the eyes and mouth and opens the mouth for a
        // "ha". Port: it keeps its time from the clock, so the pace doesn't depend on the frame rate. With reduced motion
        // the face keeps the laughing pose, squinting with the mouth open, and doesn't bounce.
        const laughNow = millis(), dt = this.laughLast ? Math.min(100, laughNow - this.laughLast) : 0;
        this.laughLast = laughNow;
        this.laughLevel = Math.max(0, Math.min(1, this.laughLevel + (this.laugh ? dt / 150 : -dt / 300)));
        if (this.laughLevel === 0) this.laughPhase = 0; // the next laugh starts from the bottom of a bounce
        else if (!still) this.laughPhase += 2 * Math.PI * this.laughFrequency * dt / 1000;
        const lift = still ? 0 : 0.5 - 0.5 * Math.cos(this.laughPhase); // 0 to 1: 0 at rest, 1 at the top of a bounce
        this.laughY = this.int(-lift * this.laughAmplitude * this.laughLevel);
        this.laughMouthY = this.int(-lift * this.laughMouthAmplitude * this.laughLevel);
        // Port: crying sobs the same way, a gentler bounce of the eyes and mouth
        this.cryLevel = Math.max(0, Math.min(1, this.cryLevel + (this.cry ? dt / 150 : -dt / 300)));
        if (this.cryLevel === 0) this.cryPhase = 0;
        else if (!still) this.cryPhase += 2 * Math.PI * this.cryFrequency * dt / 1000;
        const sob = still ? 0 : 0.5 - 0.5 * Math.cos(this.cryPhase);
        this.cryY = this.int(-sob * this.cryAmplitude * this.cryLevel);
        this.cryMouthY = this.int(-sob * this.cryMouthAmplitude * this.cryLevel);
        this.laughOpenAmount = this.laughLevel * (0.35 + 0.65 * (still ? 1 : lift)); // never quite shut, so it reads as laughing

        // Port: each swing eases like a blink, and turns back once it arrives
        this.shakeX = this.ease(this.shakeX, this.shakeXNext, this.shakeHeadSpeed);
        // Port: turning back takes the amplitude as it is now, so changing it applies to a swing already going
        if (this.shakeHead && this.shakeX === this.shakeXNext) this.shakeXNext = this.shakeXNext > 0 ? -this.shakeHeadAmplitude : this.shakeHeadAmplitude;
        this.shakeY = this.ease(this.shakeY, this.shakeYNext, this.nodSpeed);
        this.mouthShakeY = this.ease(this.mouthShakeY, this.mouthShakeYNext, this.nodSpeed);
        // The mouth turns back with the eyes, so it moves at the same pace
        if (this.nod && this.shakeY === this.shakeYNext) {
            this.shakeYNext = this.shakeYNext > 0 ? -this.nodAmplitude : this.nodAmplitude;
            this.mouthShakeYNext = this.shakeYNext;
        }

        // Idle - eyes moving to random positions on screen
        if (this.idle && !this.eyesClosed && !still) {
            if (millis() >= this.idleAnimationTimer) {
                this.eyeLxNext = random(this.getScreenConstraint_X());
                this.eyeLyNext = this.eyeYAt(random(1000) / 1000);
                // Port: a look can set its own pace (looking around is a quick wander)
                const wander = this.looks[this.look]?.wander;
                const pace = typeof wander === 'object' ? wander : {};
                const interval = pace.interval ?? this.idleInterval, variation = pace.variation ?? this.idleIntervalVariation;
                this.idleAnimationTimer = millis() + (interval * 1000) + (random(variation) * 1000); // calculate next time for eyes repositioning
            }
        }

        // Port: a follow look keeps the eyes on the point lookAt() gave (the middle, in reduced motion)
        if (this.following) {
            this.eyeLxNext = this.int(this.getScreenConstraint_X() * (still ? 0.5 : this.followX));
            this.eyeLyNext = this.eyeYAt(still ? 0.5 : this.followY);
        }

        // Adding offsets for horizontal flickering/shivering
        if (this.hFlicker && !still) {
            if (this.hFlickerAlternate) {
                this.eyeLx += this.hFlickerAmplitude;
                this.eyeRx += this.hFlickerAmplitude;
            } else {
                this.eyeLx -= this.hFlickerAmplitude;
                this.eyeRx -= this.hFlickerAmplitude;
            }
            this.hFlickerAlternate = !this.hFlickerAlternate;
        }

        // Adding offsets for vertical flickering/shivering
        if (this.vFlicker && !still) {
            if (this.vFlickerAlternate) {
                this.eyeLy += this.vFlickerAmplitude;
                this.eyeRy += this.vFlickerAmplitude;
            } else {
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
        for (const side of ['left', 'right'] as const) {
            const own = eyes[side];
            const h = (side === 'right' && !this.cyclops ? this.eyeRheightCurrent : this.eyeLheightCurrent) * this.eyeScale;
            this.lids[side] = {
                top: this.easeLid(this.lids[side].top, { ...eyes.top, ...own?.top }, h),
                bottom: this.easeLid(this.lids[side].bottom, this.laughed({ ...eyes.bottom, ...own?.bottom }), h),
            };
        }

        // The original draws each eye, then paints the eyelids over it in the background colour.
        // Here the eyelid shapes are cut out of the eye instead.
        // Port: the swings move the drawn eyes only; drawMouth() adds the mouth's own share.
        // Port: eyes of different heights share their bottom edge, so the shorter one sits lower
        const tallest = Math.max(this.eyeLheightDefault, this.cyclops ? 0 : this.eyeRheightDefault);
        // Port: and the mood's scale grows each eye from its centre
        const s = this.eyeScale;
        const grown = (x: number, y: number, w: number, h: number) => [int(x - w * (s - 1) / 2), int(y - h * (s - 1) / 2), int(w * s), int(h * s)];
        const [lx, ly, lw, lh] = grown(this.eyeLx + this.shakeX, this.eyeLy + this.shakeY + this.laughY + this.cryY + (tallest - this.eyeLheightDefault), this.eyeLwidthCurrent, this.eyeLheightCurrent);
        const [rx, ry, rw, rh] = grown(this.eyeRx + this.shakeX, this.eyeRy + this.shakeY + this.laughY + this.cryY + (tallest - this.eyeRheightDefault), this.eyeRwidthCurrent, this.eyeRheightCurrent);
        const leftCuts: Cutout[] = [];
        const rightCuts: Cutout[] = [];
        if (!this.cyclops) {
            // Each eye's outer corner faces its own side of the screen
            leftCuts.push(...this.lidCuts(lx + lw, lx, ly, lh, this.lids.left));
            rightCuts.push(...this.lidCuts(rx, rx + rw, ry, rh, this.lids.right));
        } else {
            // Cyclops: one lid per half of the eye, both with their inner corner in the middle
            const mid = lx + int(lw / 2);
            leftCuts.push(...this.lidCuts(mid, lx, ly, lh, this.lids.left), ...this.lidCuts(mid, lx + lw, ly, lh, this.lids.right));
        }

        // Draw basic eye rectangles, with their eyelids cut out
        d.fillRoundRect(lx, ly, lw, lh, int(this.eyeLborderRadiusCurrent * s), leftCuts); // left eye
        if (!this.cyclops) {
            d.fillRoundRect(rx, ry, rw, rh, int(this.eyeRborderRadiusCurrent * s), rightCuts); // right eye
        }

        // Port: the mouth
        this.drawMouth();

        // Add sweat drops
        if (this.sweat && !still) {
            // Sweat drop 1 -> left corner
            if (this.sweat1YPos <= this.sweat1YPosMax) { this.sweat1YPos += 0.5; } // vertical movement from initial to max
            else { this.sweat1XPosInitial = random(30); this.sweat1YPos = 2; this.sweat1YPosMax = (random(10) + 10); this.sweat1Width = 1; this.sweat1Height = 2; } // if max vertical position is reached: reset all values for next drop
            if (this.sweat1YPos <= this.sweat1YPosMax / 2) { this.sweat1Width += 0.5; this.sweat1Height += 0.5; } // shape grows in first half of animation ...
            else { this.sweat1Width -= 0.1; this.sweat1Height -= 0.5; } // ... and shrinks in second half of animation
            this.sweat1XPos = int(this.sweat1XPosInitial - (this.sweat1Width / 2)); // keep the growing shape centered to initial x position
            d.fillRoundRect(this.sweat1XPos, this.sweat1YPos, this.sweat1Width, this.sweat1Height, this.sweatBorderradius); // draw sweat drop

            // Sweat drop 2 -> center area
            if (this.sweat2YPos <= this.sweat2YPosMax) { this.sweat2YPos += 0.5; } // vertical movement from initial to max
            else { this.sweat2XPosInitial = random((this.screenWidth - 60)) + 30; this.sweat2YPos = 2; this.sweat2YPosMax = (random(10) + 10); this.sweat2Width = 1; this.sweat2Height = 2; } // if max vertical position is reached: reset all values for next drop
            if (this.sweat2YPos <= this.sweat2YPosMax / 2) { this.sweat2Width += 0.5; this.sweat2Height += 0.5; } // shape grows in first half of animation ...
            else { this.sweat2Width -= 0.1; this.sweat2Height -= 0.5; } // ... and shrinks in second half of animation
            this.sweat2XPos = int(this.sweat2XPosInitial - (this.sweat2Width / 2)); // keep the growing shape centered to initial x position
            d.fillRoundRect(this.sweat2XPos, this.sweat2YPos, this.sweat2Width, this.sweat2Height, this.sweatBorderradius); // draw sweat drop

            // Sweat drop 3 -> right corner
            if (this.sweat3YPos <= this.sweat3YPosMax) { this.sweat3YPos += 0.5; } // vertical movement from initial to max
            else { this.sweat3XPosInitial = (this.screenWidth - 30) + (random(30)); this.sweat3YPos = 2; this.sweat3YPosMax = (random(10) + 10); this.sweat3Width = 1; this.sweat3Height = 2; } // if max vertical position is reached: reset all values for next drop
            if (this.sweat3YPos <= this.sweat3YPosMax / 2) { this.sweat3Width += 0.5; this.sweat3Height += 0.5; } // shape grows in first half of animation ...
            else { this.sweat3Width -= 0.1; this.sweat3Height -= 0.5; } // ... and shrinks in second half of animation
            this.sweat3XPos = int(this.sweat3XPosInitial - (this.sweat3Width / 2)); // keep the growing shape centered to initial x position
            d.fillRoundRect(this.sweat3XPos, this.sweat3YPos, this.sweat3Width, this.sweat3Height, this.sweatBorderradius); // draw sweat drop
        }

        // Port: tears run down from the outer corner of each eye, staggered so they trickle one after another
        if (this.cry && !still && !this.eyesClosed) {
            // [left edge, width, bottom, outer side]: each eye's outer corner faces its own side of the screen
            const corners: [number, number, number, number][] = this.cyclops
                ? [[lx, lw, ly + lh, -1], [lx, lw, ly + lh, 1]]
                : [[lx, lw, ly + lh, -1], [rx, rw, ry + rh, 1]];
            corners.forEach(([x, w, bottom, side], i) => {
                const drops = this.tears[i];
                while (drops.length < this.cryDrops) drops.push({ y: -this.cryFall * drops.length / this.cryDrops, dx: Math.random() });
                drops.length = this.cryDrops;
                for (const drop of drops) {
                    drop.y += this.crySpeed;
                    if (drop.y > this.cryFall) { drop.y = 0; drop.dx = Math.random(); }
                    if (drop.y < 0) continue;
                    const grow = Math.min(1, drop.y / 3), shrink = 1 - drop.y / this.cryFall; // swells as it leaves the eye, thins as it runs out
                    const size = Math.max(1, Math.round(this.crySize * (0.5 + 0.5 * shrink)));
                    const edge = side < 0 ? x : x + w - size; // flush with the corner, with a pixel of play so the drops don't line up
                    d.fillRoundRect(int(edge - side * drop.dx), int(bottom - this.cryRise + drop.y), size, Math.max(size, Math.round(size * (1 + grow))), int(size / 2));
                }
            });
        }

        d.display(); // show drawings on display
    } // end of drawEyes method

    //*********************************************************************************************
    //  MOUTH (port addition)
    //*********************************************************************************************

    /** A lid in pixels for an eye h tall, eased like the original's eyelids. */
    // Port: a laugh squints the eyes, raising the bottom lids to the happy eyes' arch
    private laughed(lid: LidShape): LidShape {
        const level = this.laughLevel;
        if (level <= 0 || this.laughSquint <= 0) return lid;
        return { ...lid, height: Math.max(lid.height, this.laughSquint * level), curve: Math.max(lid.curve, 0.2 * level) };
    }

    private easeLid(current: LidPixels, shape: LidShape, h: number): LidPixels {
        const int = (v: number) => this.int(v);
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
    private lidCuts(innerX: number, outerX: number, y: number, h: number, lids: { top: LidPixels; bottom: LidPixels }): Cutout[] {
        const cuts: Cutout[] = [];
        const midX = (innerX + outerX) / 2;
        // Each lid: its edge runs from the inner to the outer corner and bows by twice the curve at its
        // control point, so its middle comes in by the curve. The rest of the shape lies outside the eye.
        const lid = (lid: LidPixels, edgeY: number, dir: number, farY: number) => {
            if (Math.max(lid.inner, lid.outer, (lid.inner + lid.outer) / 2 + lid.bow) <= 0) return;
            const inner: Point = [innerX, edgeY + dir * lid.inner];
            const outer: Point = [outerX, edgeY + dir * lid.outer];
            const control: Point = [midX, edgeY + dir * ((lid.inner + lid.outer) / 2 + lid.bow * 2)];
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
    private blinkEase(current: number, target: number) {
        const value = current + (target - current) * this.blinkSpeed;
        // Snap the last half pixel in "smooth", or a closing eye would linger before it counts as closed and reopens
        if (this.precision === 'smooth') return Math.abs(target - value) < 0.5 ? target : value;
        const whole = Math.trunc(value);
        // Below half speed, a whole-pixel step can round to nothing: keep opening a pixel a frame, up to the
        // original's one-pixel-short stop
        if (whole === current && target - current > 1) return current + 1;
        return whole;
    }

    /** Halfway to the target each frame, like every value in the original. Always arrives, in both precisions. */
    private ease(current: number, next: number, speed = 0.5) {
        const value = current + (next - current) * speed;
        if (this.precision === 'smooth') return Math.abs(next - value) < 0.05 ? next : value;
        // Round away from the current value so whole-number steps never stall one short of the target.
        const step = next > current ? Math.ceil(value) : Math.floor(value);
        return step;
    }

    /**
     * The mouth is one line, centred under the eyes, that moves with them (blinks leave it alone,
     * since the eyes close around their centre; it follows a head shake and a nod, and lifts and opens
     * with each bounce when laughing). Its middle
     * stays straight; only the two corners bend, each by its own amount, over the outer quarter of
     * the line on each side.
     */
    drawMouth() {
        if (!this.mouth) return;
        const width = this.mouthWidthCurrent;
        // As the mouth shrinks below its own thickness it also thins, so it vanishes instead of leaving a dot.
        const thickness = Math.min(this.mouthThickness, width);
        if (thickness <= 0.2) return;

        const leftEdge = this.eyeLx;
        const rightEdge = this.cyclops ? this.eyeLx + this.eyeLwidthCurrent : this.eyeRx + this.eyeRwidthCurrent;
        const cx = (leftEdge + rightEdge) / 2 + this.shakeX;
        const eyeCentre = this.eyeLy + this.eyeLheightCurrent / 2;
        const tallest = Math.max(this.eyeLheightDefault, this.cyclops ? 0 : this.eyeRheightDefault); // the eyes' shared bottom edge
        const y = eyeCentre + this.eyeLheightDefault / 2 + (tallest - this.eyeLheightDefault) + this.mouthGapCurrent + this.mouthThickness / 2 + this.mouthShakeY + this.laughMouthY + this.cryMouthY;

        const x0 = cx - width / 2, x1 = cx + width / 2;
        const curl = width * this.mouthCurl; // how much of each end bends
        const clamp = (lift: number) => Math.max(-curl, Math.min(curl, lift)); // corners never bend further than they are long
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
        const lerp = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        const quad = (a: Point, c: Point, b: Point, t: number): Point => lerp(lerp(a, c, t), lerp(c, b, t), t);
        const endOf = (dir: number, lift: number, own: number) => {
            const xe = dir < 0 ? x0 : x1, xi = xe - dir * curl, xc = xe - dir * curl * k;
            const r = Math.max(0, Math.min(this.mouthRadius, own / 2));
            // how far along a curl its cut is, so the bend takes about r of it
            const cut = (chord: number) => (r > 0.05 && chord > 0 ? Math.min(0.8, r / (chord * 1.1)) : 0);
            const topIn: Point = [xi, yt], topCtl: Point = [xc, yt], corner: Point = [xe, yt - lift];
            const botIn: Point = [xi, y + open], botCtl: Point = [xc, y + open], bottom: Point = [xe, y - lift + own];
            const tu = cut(Math.hypot(curl, lift)), bu = cut(Math.hypot(curl, y + open - bottom[1]));
            const nodes: Point[] = [
                topIn, quad(topIn, topCtl, corner, 1 - tu), [xe, corner[1] + r], [xe, bottom[1] - r], quad(bottom, botCtl, botIn, bu), botIn,
            ];
            const controls: Array<Point | undefined> = [lerp(topIn, topCtl, 1 - tu), corner, undefined, bottom, lerp(botCtl, botIn, bu)];
            return { nodes, controls };
        };
        const endR = endOf(1, liftR, openR), endL = endOf(-1, liftL, openL);
        const segments: Array<{ control?: Point; to: Point }> = [{ to: endR.nodes[0] }];
        endR.controls.forEach((control, i) => segments.push({ control, to: endR.nodes[i + 1] }));
        segments.push({ to: endL.nodes[5] });
        // the left end is the same shape mirrored, so it is walked backwards
        for (let i = 4; i >= 0; i--) segments.push({ control: endL.controls[i], to: endL.nodes[i] });
        this.display.strokeLine({ start: endL.nodes[0], segments }, thickness, true);
    }
}

const LEVEL: LidShape = { height: 0, angle: 0, curve: 0 };
const NO_LID: LidPixels = { inner: 0, outer: 0, bow: 0 };
const OPEN_EYES: EyeState = { top: LEVEL, bottom: LEVEL, closed: false };

/** An eye state with a patch laid over it. */
function eyesWith(base: EyeState, patch?: Patch<EyeState> | null): EyeState {
    const eyes: EyeState = {
        top: { ...base.top, ...withoutNulls(patch?.top) },
        bottom: { ...base.bottom, ...withoutNulls(patch?.bottom) },
        closed: patch?.closed ?? base.closed,
    };
    // null takes it out of its folder
    const group = patch?.group === null ? undefined : patch?.group ?? base.group;
    if (group) eyes.group = group;
    for (const side of ['left', 'right'] as const) {
        // null drops that eye's own lids, so it goes back to the shared ones
        const own = patch?.[side] === null ? {} : lidsWith(base[side], patch?.[side]);
        if (own.top || own.bottom) eyes[side] = own;
    }
    return eyes;
}

/** One eye's own lids with a patch laid over them; a lid with nothing in it is left out. */
function lidsWith(base?: EyeLids, patch?: Patch<EyeLids> | null): EyeLids {
    const lids: EyeLids = {};
    for (const which of ['top', 'bottom'] as const) {
        const lid = { ...base?.[which], ...withoutNulls(patch?.[which]) };
        if (Object.keys(lid).length) lids[which] = lid;
    }
    return lids;
}

/** obj without the keys whose value is null or undefined, which mean "left out". */
function withoutNulls<T extends object>(obj: T | null | undefined): { [K in keyof T]?: NonNullable<T[K]> } {
    return Object.fromEntries(Object.entries(obj ?? {}).filter(([, value]) => value !== null && value !== undefined)) as any;
}

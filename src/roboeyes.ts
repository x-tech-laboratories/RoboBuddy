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
 *   The shapes are exactly the original triangles and rounded rectangles.
 * - precision: "pixel" (the default) keeps the original's integer maths, so the motion matches an
 *   OLED frame for frame. "smooth" uses fractional values for softer motion on large screens.
 * - begin() also re-centres the eyes for the new screen size (the original only does that on the
 *   next setPosition() call).
 * - New: a mouth. It is always a single line under the eyes; only its length, how far below the
 *   eyes it sits, and how far each of its two corners bends up or down change. It follows the eyes,
 *   eases like every other value, takes its shape from the mood, and can shrink away completely
 *   (setMouthWidth(0)).
 * - anim_laugh() and anim_confused() swing the eyes with the same halfway-per-frame easing as a
 *   blink, instead of jumping every frame, and the mouth does not follow that shake: it bounces on
 *   its own while laughing and holds still while confused.
 * ---------------------------------------------------------------------------------------------
 */

// For mood type switch
export const DEFAULT = 0;
export const TIRED = 1;
export const ANGRY = 2;
export const HAPPY = 3;

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

export type Mood = typeof DEFAULT | typeof TIRED | typeof ANGRY | typeof HAPPY;
export type Position = typeof DEFAULT | typeof N | typeof NE | typeof E | typeof SE | typeof S | typeof SW | typeof W | typeof NW;
type Point = [number, number];

/** What RoboEyes draws with: the handful of primitives the original takes from Adafruit GFX. */
export interface Display {
    setSize(width: number, height: number): void;
    clearDisplay(): void;
    /** A filled rounded rectangle in the main colour, minus any cut-outs (the eyelids). */
    fillRoundRect(x: number, y: number, w: number, h: number, r: number, cutouts?: Cutout[]): void;
    /** A line of the given thickness with round ends, through the given points, in the main colour. */
    strokeLine(points: MouthPath, thickness: number): void;
    display(): void;
}

export type Cutout =
    | { kind: 'triangle'; points: [Point, Point, Point] }
    | { kind: 'roundRect'; x: number; y: number; w: number; h: number; r: number };

/** The mouth's centre line: a start point, then quadratic curves and straight segments. */
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

    strokeLine(path: MouthPath, thickness: number) {
        if (thickness <= 0) return;
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(path.start[0], path.start[1]);
        for (const seg of path.segments) {
            if (seg.control) ctx.quadraticCurveTo(seg.control[0], seg.control[1], seg.to[0], seg.to[1]);
            else ctx.lineTo(seg.to[0], seg.to[1]);
        }
        ctx.strokeStyle = this.main;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    }

    display() { /* drawing on a canvas is immediate */ }
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

export interface MouthShape {
    /** Length of the line in screen pixels. 0 makes the mouth disappear. */
    width: number;
    /** How far the left corner bends, in screen pixels: positive up (smile), negative down (frown). */
    left: number;
    /** How far the right corner bends, the same way. */
    right: number;
}

export class RoboEyes {
    // Yes, everything is currently still accessible. Be responsible and don't mess things up :)

    display: Display;
    /** "pixel" keeps the original's whole-number maths; "smooth" allows fractions for softer motion. */
    precision: 'pixel' | 'smooth' = 'pixel';

    // For general setup - screen size and max. frame rate
    screenWidth = 128; // OLED display width, in pixels
    screenHeight = 64; // OLED display height, in pixels
    frameInterval = 20; // default value for 50 frames per second (1000/50 = 20 milliseconds)
    fpsTimer = 0; // for timing the frames per second

    // For controlling mood types and expressions
    tired = false;
    angry = false;
    happy = false;
    curious = false; // if true, draw the outer eye larger when looking left or right
    cyclops = false; // if true, draw only one eye
    eyeL_open = false; // left eye opened or closed?
    eyeR_open = false; // right eye opened or closed?

    //*********************************************************************************************
    //  Eyes Geometry
    //*********************************************************************************************

    // EYE LEFT - size and border radius
    eyeLwidthDefault = 36;
    eyeLheightDefault = 36;
    eyeLwidthCurrent = this.eyeLwidthDefault;
    eyeLheightCurrent = 1; // start with closed eye, otherwise set to eyeLheightDefault
    eyeLwidthNext = this.eyeLwidthDefault;
    eyeLheightNext = this.eyeLheightDefault;
    eyeLheightOffset = 0;
    // Border Radius
    eyeLborderRadiusDefault = 8;
    eyeLborderRadiusCurrent = this.eyeLborderRadiusDefault;
    eyeLborderRadiusNext = this.eyeLborderRadiusDefault;

    // EYE RIGHT - size and border radius
    eyeRwidthDefault = this.eyeLwidthDefault;
    eyeRheightDefault = this.eyeLheightDefault;
    eyeRwidthCurrent = this.eyeRwidthDefault;
    eyeRheightCurrent = 1; // start with closed eye, otherwise set to eyeRheightDefault
    eyeRwidthNext = this.eyeRwidthDefault;
    eyeRheightNext = this.eyeRheightDefault;
    eyeRheightOffset = 0;
    // Border Radius
    eyeRborderRadiusDefault = 8;
    eyeRborderRadiusCurrent = this.eyeRborderRadiusDefault;
    eyeRborderRadiusNext = this.eyeRborderRadiusDefault;

    // Space between eyes
    spaceBetweenDefault = 10;
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
    // Eyelid top size
    eyelidsHeightMax = Math.trunc(this.eyeLheightDefault / 2); // top eyelids max height
    eyelidsTiredHeight = 0;
    eyelidsTiredHeightNext = this.eyelidsTiredHeight;
    eyelidsAngryHeight = 0;
    eyelidsAngryHeightNext = this.eyelidsAngryHeight;
    // Bottom happy eyelids offset
    eyelidsHappyBottomOffsetMax = Math.trunc(this.eyeLheightDefault / 2) + 3;
    eyelidsHappyBottomOffset = 0;
    eyelidsHappyBottomOffsetNext = 0;

    //*********************************************************************************************
    //  Mouth (not in the original)
    //*********************************************************************************************

    mouth = true; // draw a mouth under the eyes
    mouthThickness = 3; // line thickness in pixels
    // Space between the bottom of the eyes and the mouth, which sets how high the mouth sits
    mouthGapCurrent = 6;
    mouthGapNext = 6;
    /** The mouth each mood asks for. Change these to retune the expressions. */
    moodMouth: Record<Mood, MouthShape> = {
        [DEFAULT]: { width: 20, left: 2, right: 2 }, // short, with a hint of a smile
        [HAPPY]: { width: 28, left: 4, right: 4 }, // wider, corners up
        [TIRED]: { width: 12, left: -1, right: -1 }, // short, corners slack
        [ANGRY]: { width: 18, left: -3, right: -3 }, // corners down
    };
    mouthWidthCurrent = 0; // starts closed and grows in with the eyes
    mouthWidthNext = this.moodMouth[DEFAULT].width;
    mouthLeftCurrent = 0;
    mouthLeftNext = this.moodMouth[DEFAULT].left;
    mouthRightCurrent = 0;
    mouthRightNext = this.moodMouth[DEFAULT].right;

    //*********************************************************************************************
    //  Macro Animations
    //*********************************************************************************************

    // Animation - horizontal flicker/shiver
    hFlicker = false;
    hFlickerAlternate = false;
    hFlickerAmplitude = 2;

    // Animation - vertical flicker/shiver
    vFlicker = false;
    vFlickerAlternate = false;
    vFlickerAmplitude = 10;

    // Animation - auto blinking
    autoblinker = false; // activate auto blink animation
    blinkInterval = 1; // basic interval between each blink in full seconds
    blinkIntervalVariation = 4; // interval variaton range in full seconds, random number inside of given range will be add to the basic blinkInterval, set to 0 for no variation
    blinktimer = 0; // for organising eyeblink timing

    // Animation - idle mode: eyes looking in random directions
    idle = false;
    idleInterval = 1; // basic interval between each eye repositioning in full seconds
    idleIntervalVariation = 3; // interval variaton range in full seconds, random number inside of given range will be add to the basic idleInterval, set to 0 for no variation
    idleAnimationTimer = 0; // for organising eyeblink timing

    // Animation - eyes confused: eyes shaking left and right
    confused = false;
    confusedAnimationTimer = 0;
    confusedAnimationDuration = 500;
    confusedToggle = true;
    confusedAmplitude = 20; // port: how far the eyes swing to each side

    // Animation - eyes laughing: eyes shaking up and down
    laugh = false;
    laughAnimationTimer = 0;
    laughAnimationDuration = 500;
    laughToggle = true;
    laughAmplitude = 5; // port: how far the eyes swing up and down
    laughMouthAmplitude = 2; // port: how far the mouth bounces, on its own, while laughing

    // Port: the laugh and confused swings, drawn on top of the eye and mouth positions
    shakeX = 0;
    shakeXNext = 0;
    shakeY = 0;
    shakeYNext = 0;
    mouthShakeY = 0;
    mouthShakeYNext = 0;

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

    /** Pass a canvas to draw on it, or any object implementing Display. */
    constructor(target: HTMLCanvasElement | Display, options: { precision?: 'pixel' | 'smooth' } = {}) {
        this.display = 'getContext' in target ? new CanvasDisplay(target) : target;
        if (options.precision) this.precision = options.precision;
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
        this.eyeLheightCurrent = 1; // start with closed eyes
        this.eyeRheightCurrent = 1; // start with closed eyes
        this.setFramerate(frameRate); // calculate frame interval based on defined frameRate
        // Port: centre the eyes for the new screen size straight away.
        this.setPosition(DEFAULT);
        this.eyeLx = this.eyeLxNext;
        this.eyeLy = this.eyeLyNext;
        this.eyeRx = this.eyeLx + this.eyeLwidthCurrent + this.spaceBetweenCurrent;
        this.eyeRy = this.eyeLy;
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

    // Set mood expression. Port: also sets the mouth that goes with it (see moodMouth).
    setMood(mood: Mood) {
        switch (mood) {
            case TIRED:
                this.tired = true;
                this.angry = false;
                this.happy = false;
                break;
            case ANGRY:
                this.tired = false;
                this.angry = true;
                this.happy = false;
                break;
            case HAPPY:
                this.tired = false;
                this.angry = false;
                this.happy = true;
                break;
            default:
                this.tired = false;
                this.angry = false;
                this.happy = false;
                break;
        }
        const shape = this.moodMouth[mood] ?? this.moodMouth[DEFAULT];
        this.mouthWidthNext = shape.width;
        this.mouthLeftNext = shape.left;
        this.mouthRightNext = shape.right;
    }

    // Set predefined position
    setPosition(position: Position) {
        switch (position) {
            case N:
                // North, top center
                this.eyeLxNext = this.int(this.getScreenConstraint_X() / 2);
                this.eyeLyNext = 0;
                break;
            case NE:
                // North-east, top right
                this.eyeLxNext = this.getScreenConstraint_X();
                this.eyeLyNext = 0;
                break;
            case E:
                // East, middle right
                this.eyeLxNext = this.getScreenConstraint_X();
                this.eyeLyNext = this.int(this.getScreenConstraint_Y() / 2);
                break;
            case SE:
                // South-east, bottom right
                this.eyeLxNext = this.getScreenConstraint_X();
                this.eyeLyNext = this.getScreenConstraint_Y();
                break;
            case S:
                // South, bottom center
                this.eyeLxNext = this.int(this.getScreenConstraint_X() / 2);
                this.eyeLyNext = this.getScreenConstraint_Y();
                break;
            case SW:
                // South-west, bottom left
                this.eyeLxNext = 0;
                this.eyeLyNext = this.getScreenConstraint_Y();
                break;
            case W:
                // West, middle left
                this.eyeLxNext = 0;
                this.eyeLyNext = this.int(this.getScreenConstraint_Y() / 2);
                break;
            case NW:
                // North-west, top left
                this.eyeLxNext = 0;
                this.eyeLyNext = 0;
                break;
            default:
                // Middle center
                this.eyeLxNext = this.int(this.getScreenConstraint_X() / 2);
                this.eyeLyNext = this.int(this.getScreenConstraint_Y() / 2);
                break;
        }
    }

    // Set automated eye blinking, minimal blink interval in full seconds and blink interval variation range in full seconds
    setAutoblinker(active: boolean, interval?: number, variation?: number) {
        this.autoblinker = active;
        if (interval !== undefined) this.blinkInterval = interval;
        if (variation !== undefined) this.blinkIntervalVariation = variation;
    }

    // Set idle mode - automated eye repositioning, minimal time interval in full seconds and time interval variation range in full seconds
    setIdleMode(active: boolean, interval?: number, variation?: number) {
        this.idle = active;
        if (interval !== undefined) this.idleInterval = interval;
        if (variation !== undefined) this.idleIntervalVariation = variation;
    }

    // Set curious mode - the respectively outer eye gets larger when looking left or right
    setCuriosity(curiousBit: boolean) {
        this.curious = curiousBit;
    }

    // Set cyclops mode - show only one eye
    setCyclops(cyclopsBit: boolean) {
        this.cyclops = cyclopsBit;
    }

    // Set horizontal flickering (displacing eyes left/right)
    setHFlicker(flickerBit: boolean, amplitude?: number) {
        this.hFlicker = flickerBit; // turn flicker on or off
        if (amplitude !== undefined) this.hFlickerAmplitude = amplitude; // define amplitude of flickering in pixels
    }

    // Set vertical flickering (displacing eyes up/down)
    setVFlicker(flickerBit: boolean, amplitude?: number) {
        this.vFlicker = flickerBit; // turn flicker on or off
        if (amplitude !== undefined) this.vFlickerAmplitude = amplitude; // define amplitude of flickering in pixels
    }

    setSweat(sweatBit: boolean) {
        this.sweat = sweatBit; // turn sweat on or off
    }

    // Port: mouth on or off. Off keeps the original's layout exactly; on reserves a strip under the eyes.
    setMouth(mouthBit: boolean) {
        this.mouth = mouthBit;
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

    // Returns the max y position for left eye
    getScreenConstraint_Y() {
        // using default height here, because height will vary when blinking and in curious mode
        // Port: minus the strip the mouth needs, so it always stays on screen.
        return this.screenHeight - this.eyeLheightDefault - this.getMouthSpace();
    }

    // Port: room reserved under the eyes for the mouth (0 when the mouth is off)
    getMouthSpace() {
        return this.mouth ? this.mouthGapNext + this.mouthThickness + 3 : 0;
    }

    //*********************************************************************************************
    //  BASIC ANIMATION METHODS
    //*********************************************************************************************

    // Close eye(s). With no arguments, both eyes.
    close(left = true, right = true) {
        if (left) {
            this.eyeLheightNext = 1; // closing left eye
            this.eyeL_open = false; // left eye not opened (=closed)
        }
        if (right) {
            this.eyeRheightNext = 1; // closing right eye
            this.eyeR_open = false; // right eye not opened (=closed)
        }
    }

    // Open eye(s). With no arguments, both eyes.
    open(left = true, right = true) {
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

    // Play confused animation - one shot animation of eyes shaking left and right
    anim_confused() {
        this.confused = true;
    }

    // Play laugh animation - one shot animation of eyes shaking up and down
    anim_laugh() {
        this.laugh = true;
    }

    //*********************************************************************************************
    //  PRE-CALCULATIONS AND ACTUAL DRAWINGS
    //*********************************************************************************************

    drawEyes() {
        const int = (v: number) => this.int(v);

        //// PRE-CALCULATIONS - EYE SIZES AND VALUES FOR ANIMATION TWEENINGS ////

        // Vertical size offset for larger eyes when looking left or right (curious gaze)
        if (this.curious) {
            if (this.eyeLxNext <= 10) { this.eyeLheightOffset = 8; }
            else if (this.eyeLxNext >= (this.getScreenConstraint_X() - 10) && this.cyclops) { this.eyeLheightOffset = 8; }
            else { this.eyeLheightOffset = 0; } // left eye
            if (this.eyeRxNext >= this.screenWidth - this.eyeRwidthCurrent - 10) { this.eyeRheightOffset = 8; }
            else { this.eyeRheightOffset = 0; } // right eye
        } else {
            this.eyeLheightOffset = 0; // reset height offset for left eye
            this.eyeRheightOffset = 0; // reset height offset for right eye
        }

        // Left eye height
        this.eyeLheightCurrent = int((this.eyeLheightCurrent + this.eyeLheightNext + this.eyeLheightOffset) / 2);
        this.eyeLy += int((this.eyeLheightDefault - this.eyeLheightCurrent) / 2); // vertical centering of eye when closing
        this.eyeLy -= int(this.eyeLheightOffset / 2);
        // Right eye height
        this.eyeRheightCurrent = int((this.eyeRheightCurrent + this.eyeRheightNext + this.eyeRheightOffset) / 2);
        this.eyeRy += int((this.eyeRheightDefault - this.eyeRheightCurrent) / 2); // vertical centering of eye when closing
        this.eyeRy -= int(this.eyeRheightOffset / 2);

        // Open eyes again after closing them
        if (this.eyeL_open) {
            if (this.eyeLheightCurrent <= 1 + this.eyeLheightOffset) { this.eyeLheightNext = this.eyeLheightDefault; }
        }
        if (this.eyeR_open) {
            if (this.eyeRheightCurrent <= 1 + this.eyeRheightOffset) { this.eyeRheightNext = this.eyeRheightDefault; }
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
        this.mouthLeftCurrent = this.ease(this.mouthLeftCurrent, this.mouthLeftNext);
        this.mouthRightCurrent = this.ease(this.mouthRightCurrent, this.mouthRightNext);

        //// APPLYING MACRO ANIMATIONS ////

        if (this.autoblinker) {
            if (millis() >= this.blinktimer) {
                this.blink();
                this.blinktimer = millis() + (this.blinkInterval * 1000) + (random(this.blinkIntervalVariation) * 1000); // calculate next time for blinking
            }
        }

        // Laughing - eyes shaking up and down for the duration defined by laughAnimationDuration (default = 500ms)
        // Port: instead of the original's per-frame vertical flicker, the eyes swing at the pace of a blink,
        // and the mouth bounces the other way on its own.
        if (this.laugh) {
            if (this.laughToggle) {
                this.shakeYNext = -this.laughAmplitude;
                this.mouthShakeYNext = this.laughMouthAmplitude;
                this.laughAnimationTimer = millis();
                this.laughToggle = false;
            } else if (millis() >= this.laughAnimationTimer + this.laughAnimationDuration) {
                this.shakeYNext = 0;
                this.mouthShakeYNext = 0;
                this.laughToggle = true;
                this.laugh = false;
            }
        }

        // Confused - eyes shaking left and right for the duration defined by confusedAnimationDuration (default = 500ms)
        // Port: instead of the original's per-frame horizontal flicker, the eyes swing at the pace of a blink,
        // and the mouth stays where it is.
        if (this.confused) {
            if (this.confusedToggle) {
                this.shakeXNext = -this.confusedAmplitude;
                this.confusedAnimationTimer = millis();
                this.confusedToggle = false;
            } else if (millis() >= this.confusedAnimationTimer + this.confusedAnimationDuration) {
                this.shakeXNext = 0;
                this.confusedToggle = true;
                this.confused = false;
            }
        }

        // Port: each swing eases like a blink, and turns back once it arrives
        this.shakeX = this.ease(this.shakeX, this.shakeXNext);
        if (this.confused && this.shakeX === this.shakeXNext) this.shakeXNext = -this.shakeXNext;
        this.shakeY = this.ease(this.shakeY, this.shakeYNext);
        // The mouth turns back with the eyes, so it bounces at the same pace, but the other way and by its own amount
        if (this.laugh && this.shakeY === this.shakeYNext) {
            this.shakeYNext = -this.shakeYNext;
            this.mouthShakeYNext = -this.mouthShakeYNext;
        }
        this.mouthShakeY = this.ease(this.mouthShakeY, this.mouthShakeYNext);

        // Idle - eyes moving to random positions on screen
        if (this.idle) {
            if (millis() >= this.idleAnimationTimer) {
                this.eyeLxNext = random(this.getScreenConstraint_X());
                this.eyeLyNext = random(this.getScreenConstraint_Y());
                this.idleAnimationTimer = millis() + (this.idleInterval * 1000) + (random(this.idleIntervalVariation) * 1000); // calculate next time for eyes repositioning
            }
        }

        // Adding offsets for horizontal flickering/shivering
        if (this.hFlicker) {
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
        if (this.vFlicker) {
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

        // Prepare mood type transitions
        if (this.tired) { this.eyelidsTiredHeightNext = int(this.eyeLheightCurrent / 2); this.eyelidsAngryHeightNext = 0; } else { this.eyelidsTiredHeightNext = 0; }
        if (this.angry) { this.eyelidsAngryHeightNext = int(this.eyeLheightCurrent / 2); this.eyelidsTiredHeightNext = 0; } else { this.eyelidsAngryHeightNext = 0; }
        if (this.happy) { this.eyelidsHappyBottomOffsetNext = int(this.eyeLheightCurrent / 2); } else { this.eyelidsHappyBottomOffsetNext = 0; }

        // Eyelid sizes ease towards their targets
        this.eyelidsTiredHeight = int((this.eyelidsTiredHeight + this.eyelidsTiredHeightNext) / 2);
        this.eyelidsAngryHeight = int((this.eyelidsAngryHeight + this.eyelidsAngryHeightNext) / 2);
        this.eyelidsHappyBottomOffset = int((this.eyelidsHappyBottomOffset + this.eyelidsHappyBottomOffsetNext) / 2);

        // The original draws each eye, then paints the eyelids over it in the background colour.
        // Here the same eyelid shapes are cut out of the eye instead.
        // Port: the laugh and confused swings move the drawn eyes only, so the mouth keeps its own place.
        const lx = this.eyeLx + this.shakeX, ly = this.eyeLy + this.shakeY, lw = this.eyeLwidthCurrent, lh = this.eyeLheightCurrent;
        const rx = this.eyeRx + this.shakeX, ry = this.eyeRy + this.shakeY, rw = this.eyeRwidthCurrent, rh = this.eyeRheightCurrent;
        const tiredH = this.eyelidsTiredHeight, angryH = this.eyelidsAngryHeight, happyH = this.eyelidsHappyBottomOffset;
        const leftCuts: Cutout[] = [];
        const rightCuts: Cutout[] = [];
        const tri = (a: Point, b: Point, c: Point): Cutout => ({ kind: 'triangle', points: [a, b, c] });

        // Tired top eyelids
        if (tiredH > 0) {
            if (!this.cyclops) {
                leftCuts.push(tri([lx, ly - 1], [lx + lw, ly - 1], [lx, ly + tiredH - 1])); // left eye
                rightCuts.push(tri([rx, ry - 1], [rx + rw, ry - 1], [rx + rw, ry + tiredH - 1])); // right eye
            } else {
                // Cyclops tired eyelids
                leftCuts.push(tri([lx, ly - 1], [lx + int(lw / 2), ly - 1], [lx, ly + tiredH - 1])); // left eyelid half
                leftCuts.push(tri([lx + int(lw / 2), ly - 1], [lx + lw, ly - 1], [lx + lw, ly + tiredH - 1])); // right eyelid half
            }
        }

        // Angry top eyelids
        if (angryH > 0) {
            if (!this.cyclops) {
                leftCuts.push(tri([lx, ly - 1], [lx + lw, ly - 1], [lx + lw, ly + angryH - 1])); // left eye
                rightCuts.push(tri([rx, ry - 1], [rx + rw, ry - 1], [rx, ry + angryH - 1])); // right eye
            } else {
                // Cyclops angry eyelids
                leftCuts.push(tri([lx, ly - 1], [lx + int(lw / 2), ly - 1], [lx + int(lw / 2), ly + angryH - 1])); // left eyelid half
                leftCuts.push(tri([lx + int(lw / 2), ly - 1], [lx + lw, ly - 1], [lx + int(lw / 2), ly + angryH - 1])); // right eyelid half
            }
        }

        // Happy bottom eyelids
        if (happyH > 0) {
            leftCuts.push({ kind: 'roundRect', x: lx - 1, y: (ly + lh) - happyH + 1, w: lw + 2, h: this.eyeLheightDefault, r: this.eyeLborderRadiusCurrent }); // left eye
            if (!this.cyclops) {
                rightCuts.push({ kind: 'roundRect', x: rx - 1, y: (ry + rh) - happyH + 1, w: rw + 2, h: this.eyeRheightDefault, r: this.eyeRborderRadiusCurrent }); // right eye
            }
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

        d.display(); // show drawings on display
    } // end of drawEyes method

    //*********************************************************************************************
    //  MOUTH (port addition)
    //*********************************************************************************************

    /** Halfway to the target each frame, like every value in the original. Always arrives, in both precisions. */
    private ease(current: number, next: number) {
        const value = (current + next) / 2;
        if (this.precision === 'smooth') return Math.abs(next - value) < 0.05 ? next : value;
        // Round away from the current value so whole-number steps never stall one short of the target.
        const step = next > current ? Math.ceil(value) : Math.floor(value);
        return step;
    }

    /**
     * The mouth is one line, centred under the eyes, that moves with them (blinks leave it alone,
     * since the eyes close around their centre, and so do the laugh and confused swings). Its middle
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
        const cx = (leftEdge + rightEdge) / 2;
        const eyeCentre = this.eyeLy + this.eyeLheightCurrent / 2;
        const y = eyeCentre + this.eyeLheightDefault / 2 + this.mouthGapCurrent + this.mouthThickness / 2 + this.mouthShakeY;

        const x0 = cx - width / 2, x1 = cx + width / 2;
        const curl = width * 0.25; // how much of each end bends
        const clamp = (lift: number) => Math.max(-curl, Math.min(curl, lift)); // corners never bend further than they are long
        const liftL = clamp(this.mouthLeftCurrent), liftR = clamp(this.mouthRightCurrent);
        this.display.strokeLine({
            start: [x0, y - liftL],
            segments: [
                { control: [x0 + curl * 0.4, y], to: [x0 + curl, y] },
                { to: [x1 - curl, y] },
                { control: [x1 - curl * 0.4, y], to: [x1, y - liftR] },
            ],
        }, thickness);
    }
}

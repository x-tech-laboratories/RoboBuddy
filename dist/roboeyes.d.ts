export declare const DEFAULT = 0;
export declare const TIRED = 1;
export declare const ANGRY = 2;
export declare const HAPPY = 3;
export declare const ON = true;
export declare const OFF = false;
export declare const N = 1;
export declare const NE = 2;
export declare const E = 3;
export declare const SE = 4;
export declare const S = 5;
export declare const SW = 6;
export declare const W = 7;
export declare const NW = 8;
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
export type Cutout = {
    kind: 'triangle';
    points: [Point, Point, Point];
} | {
    kind: 'roundRect';
    x: number;
    y: number;
    w: number;
    h: number;
    r: number;
};
/** The mouth's centre line: a start point, then quadratic curves and straight segments. */
export type MouthPath = {
    start: Point;
    segments: Array<{
        control?: Point;
        to: Point;
    }>;
};
/** Draws onto a <canvas>. Sharp at any size and device pixel ratio. */
export declare class CanvasDisplay implements Display {
    private canvas;
    private ctx;
    private width;
    private height;
    background: string;
    main: string;
    constructor(canvas: HTMLCanvasElement, options?: {
        background?: string;
        main?: string;
    });
    setSize(width: number, height: number): void;
    /** Matches the canvas's pixel size to how big it is on screen. Called on every frame, so CSS sizing just works. */
    private resize;
    clearDisplay(): void;
    fillRoundRect(x: number, y: number, w: number, h: number, r: number, cutouts?: Cutout[]): void;
    strokeLine(path: MouthPath, thickness: number): void;
    display(): void;
}
export interface MouthShape {
    /** Length of the line in screen pixels. 0 makes the mouth disappear. */
    width: number;
    /** How far the left corner bends, in screen pixels: positive up (smile), negative down (frown). */
    left: number;
    /** How far the right corner bends, the same way. */
    right: number;
}
export declare class RoboEyes {
    display: Display;
    /** "pixel" keeps the original's whole-number maths; "smooth" allows fractions for softer motion. */
    precision: 'pixel' | 'smooth';
    screenWidth: number;
    screenHeight: number;
    frameInterval: number;
    fpsTimer: number;
    tired: boolean;
    angry: boolean;
    happy: boolean;
    curious: boolean;
    cyclops: boolean;
    eyeL_open: boolean;
    eyeR_open: boolean;
    eyeLwidthDefault: number;
    eyeLheightDefault: number;
    eyeLwidthCurrent: number;
    eyeLheightCurrent: number;
    eyeLwidthNext: number;
    eyeLheightNext: number;
    eyeLheightOffset: number;
    eyeLborderRadiusDefault: number;
    eyeLborderRadiusCurrent: number;
    eyeLborderRadiusNext: number;
    eyeRwidthDefault: number;
    eyeRheightDefault: number;
    eyeRwidthCurrent: number;
    eyeRheightCurrent: number;
    eyeRwidthNext: number;
    eyeRheightNext: number;
    eyeRheightOffset: number;
    eyeRborderRadiusDefault: number;
    eyeRborderRadiusCurrent: number;
    eyeRborderRadiusNext: number;
    spaceBetweenDefault: number;
    spaceBetweenCurrent: number;
    spaceBetweenNext: number;
    eyeLxDefault: number;
    eyeLyDefault: number;
    eyeLx: number;
    eyeLy: number;
    eyeLxNext: number;
    eyeLyNext: number;
    eyeRxDefault: number;
    eyeRyDefault: number;
    eyeRx: number;
    eyeRy: number;
    eyeRxNext: number;
    eyeRyNext: number;
    eyelidsHeightMax: number;
    eyelidsTiredHeight: number;
    eyelidsTiredHeightNext: number;
    eyelidsAngryHeight: number;
    eyelidsAngryHeightNext: number;
    eyelidsHappyBottomOffsetMax: number;
    eyelidsHappyBottomOffset: number;
    eyelidsHappyBottomOffsetNext: number;
    mouth: boolean;
    mouthThickness: number;
    mouthGapCurrent: number;
    mouthGapNext: number;
    /** The mouth each mood asks for. Change these to retune the expressions. */
    moodMouth: Record<Mood, MouthShape>;
    mouthWidthCurrent: number;
    mouthWidthNext: number;
    mouthLeftCurrent: number;
    mouthLeftNext: number;
    mouthRightCurrent: number;
    mouthRightNext: number;
    hFlicker: boolean;
    hFlickerAlternate: boolean;
    hFlickerAmplitude: number;
    vFlicker: boolean;
    vFlickerAlternate: boolean;
    vFlickerAmplitude: number;
    autoblinker: boolean;
    blinkInterval: number;
    blinkIntervalVariation: number;
    blinktimer: number;
    idle: boolean;
    idleInterval: number;
    idleIntervalVariation: number;
    idleAnimationTimer: number;
    confused: boolean;
    confusedAnimationTimer: number;
    confusedAnimationDuration: number;
    confusedToggle: boolean;
    confusedAmplitude: number;
    laugh: boolean;
    laughAnimationTimer: number;
    laughAnimationDuration: number;
    laughToggle: boolean;
    laughAmplitude: number;
    laughMouthAmplitude: number;
    shakeX: number;
    shakeXNext: number;
    shakeY: number;
    shakeYNext: number;
    mouthShakeY: number;
    mouthShakeYNext: number;
    sweat: boolean;
    sweatBorderradius: number;
    sweat1XPosInitial: number;
    sweat1XPos: number;
    sweat1YPos: number;
    sweat1YPosMax: number;
    sweat1Height: number;
    sweat1Width: number;
    sweat2XPosInitial: number;
    sweat2XPos: number;
    sweat2YPos: number;
    sweat2YPosMax: number;
    sweat2Height: number;
    sweat2Width: number;
    sweat3XPosInitial: number;
    sweat3XPos: number;
    sweat3YPos: number;
    sweat3YPosMax: number;
    sweat3Height: number;
    sweat3Width: number;
    private loop;
    /** Pass a canvas to draw on it, or any object implementing Display. */
    constructor(target: HTMLCanvasElement | Display, options?: {
        precision?: 'pixel' | 'smooth';
    });
    /** Whole numbers in "pixel" precision, like the original's int and byte maths; unchanged in "smooth". */
    private int;
    begin(width: number, height: number, frameRate: number): void;
    update(): void;
    /** Port: calls update() on every animation frame until stop(). */
    start(): void;
    stop(): void;
    setFramerate(fps: number): void;
    setDisplayColors(background: string, main: string): void;
    setWidth(leftEye: number, rightEye: number): void;
    setHeight(leftEye: number, rightEye: number): void;
    setBorderradius(leftEye: number, rightEye: number): void;
    setSpacebetween(space: number): void;
    setMood(mood: Mood): void;
    setPosition(position: Position): void;
    setAutoblinker(active: boolean, interval?: number, variation?: number): void;
    setIdleMode(active: boolean, interval?: number, variation?: number): void;
    setCuriosity(curiousBit: boolean): void;
    setCyclops(cyclopsBit: boolean): void;
    setHFlicker(flickerBit: boolean, amplitude?: number): void;
    setVFlicker(flickerBit: boolean, amplitude?: number): void;
    setSweat(sweatBit: boolean): void;
    setMouth(mouthBit: boolean): void;
    setMouthWidth(width: number): void;
    setMouthCorners(left: number, right?: number): void;
    setMouthGap(gap: number): void;
    getScreenConstraint_X(): number;
    getScreenConstraint_Y(): number;
    getMouthSpace(): number;
    close(left?: boolean, right?: boolean): void;
    open(left?: boolean, right?: boolean): void;
    blink(left?: boolean, right?: boolean): void;
    anim_confused(): void;
    anim_laugh(): void;
    drawEyes(): void;
    /** Halfway to the target each frame, like every value in the original. Always arrives, in both precisions. */
    private ease;
    /**
     * The mouth is one line, centred under the eyes, that moves with them (blinks leave it alone,
     * since the eyes close around their centre, and so do the laugh and confused swings). Its middle
     * stays straight; only the two corners bend, each by its own amount, over the outer quarter of
     * the line on each side.
     */
    drawMouth(): void;
}
export {};

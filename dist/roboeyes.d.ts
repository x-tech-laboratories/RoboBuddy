import { type EyeState, type FaceConfig, type FaceConfigPatch, type IntroStep, type LookState, type MoodConfig, type MouthState, type Patch, type Toggles, type Viseme } from './config.js';
import { type SpeechOptions } from './speech.js';
export * from './config.js';
export { textToVisemes, type SpeechOptions } from './speech.js';
export declare const DEFAULT = 0;
export declare const SAD = 1;
export declare const TIRED = 1;
export declare const ANGRY = 2;
export declare const HAPPY = 3;
export declare const SMIRK = 4;
export declare const ASLEEP = 5;
export declare const PEACEFUL = 6;
export declare const WORRIED = 7;
export declare const FURIOUS = 8;
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
export type Mood = typeof DEFAULT | typeof SAD | typeof ANGRY | typeof HAPPY | typeof SMIRK | typeof ASLEEP | typeof PEACEFUL | typeof WORRIED | typeof FURIOUS;
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
} | {
    kind: 'path';
    path: MouthPath;
};
/** A line or outline: a start point, then quadratic curves and straight segments. */
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
    private transform;
    private measuredRatio;
    private measured;
    private observed;
    background: string;
    main: string;
    constructor(canvas: HTMLCanvasElement, options?: {
        background?: string;
        main?: string;
    });
    setSize(width: number, height: number): void;
    /** Matches the canvas's pixel size to how big it is on screen, so CSS sizing just works. The screen keeps its
     *  shape, centred, when the canvas has another. */
    private resize;
    clearDisplay(): void;
    fillRoundRect(x: number, y: number, w: number, h: number, r: number, cutouts?: Cutout[]): void;
    strokeLine(path: MouthPath, thickness: number, closed?: boolean): void;
    display(): void;
}
/** An eyelid in pixels: how far it comes in at the inner and outer corner, and how much further in the middle. */
interface LidPixels {
    inner: number;
    outer: number;
    bow: number;
}
export declare class RoboEyes {
    display: Display;
    /** "pixel" keeps the original's whole-number maths; "smooth" allows fractions for softer motion. */
    precision: 'pixel' | 'smooth';
    screenWidth: number;
    screenHeight: number;
    frameRate: number;
    frameInterval: number;
    fpsTimer: number;
    eyeStates: Record<string, EyeState>;
    mouthStates: Record<string, MouthState>;
    looks: Record<string, LookState>;
    moods: Record<string, MoodConfig>;
    mood: string;
    baseMood: string;
    tempMoodEnd: number;
    transitionMs: number;
    transitionSpeed: number;
    transitionBlink: boolean;
    transitionEnd: number;
    introQueue: IntroStep[];
    introStep: IntroStep | undefined;
    introEnd: number;
    eyeState: string;
    mouthState: string;
    look: string;
    eyesOverride: Patch<EyeState> | undefined;
    mouthOverride: Partial<MouthState> | undefined;
    toggleDefaults: Toggles;
    curious: boolean;
    curiousGrowth: number;
    curiousEdge: number;
    cyclops: boolean;
    reducedMotion: boolean | 'auto';
    eyeScale: number;
    eyesClosed: boolean;
    eyeLheld: boolean;
    eyeRheld: boolean;
    eyeL_open: boolean;
    eyeR_open: boolean;
    eyeLwidthDefault: number;
    eyeLheightDefault: number;
    eyeLwidthCurrent: number;
    faceOffsetY: number;
    eyeClosedHeight: number;
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
    lids: {
        left: {
            top: LidPixels;
            bottom: LidPixels;
        };
        right: {
            top: LidPixels;
            bottom: LidPixels;
        };
    };
    mouth: boolean;
    mouthThickness: number;
    mouthRadius: number;
    mouthCurl: number;
    mouthWidth: number;
    mouthMoodWidth: boolean;
    mouthGapCurrent: number;
    mouthGapNext: number;
    mouthWidthCurrent: number;
    mouthWidthNext: number;
    mouthLeftCurrent: number;
    mouthFollowLook: boolean;
    mouthLeftNext: number;
    mouthRightCurrent: number;
    mouthRightNext: number;
    mouthOpenCurrent: number;
    mouthOpenNext: number;
    mouthLeftOpenCurrent: number;
    mouthLeftOpenNext: number;
    mouthRightOpenCurrent: number;
    mouthRightOpenNext: number;
    hFlicker: boolean;
    hFlickerAlternate: boolean;
    hFlickerAmplitude: number;
    vFlicker: boolean;
    vFlickerAlternate: boolean;
    vFlickerAmplitude: number;
    autoblinker: boolean;
    blinkInterval: number;
    blinkSpeed: number;
    blinkIntervalVariation: number;
    blinktimer: number;
    idle: boolean;
    idleInterval: number;
    idleIntervalVariation: number;
    idleAnimationTimer: number;
    following: boolean;
    followFullX: number;
    followFullY: number;
    followX: number;
    followY: number;
    pathing: boolean;
    pathIndex: number;
    pathTimer: number;
    shakeHead: boolean;
    shakeHeadAmplitude: number;
    shakeHeadSpeed: number;
    mouthTalk: boolean;
    mouthTalkLevel: number;
    mouthTalkTimer: number;
    talkSyllableMs: number;
    talkVariationMs: number;
    talkPauseChance: number;
    talkOpen: number;
    talkLipLift: number;
    talkCornerSway: number;
    mouthTalkCorner: number[];
    mouthTalkSway: number[];
    mouthTalkCornerTimer: number[];
    mouthLipCurrent: number;
    visemes: Record<string, Viseme>;
    viseme: string | Viseme | null;
    visemeQueue: Array<{
        viseme: string | Viseme;
        ms: number;
    }>;
    visemeEnd: number;
    nod: boolean;
    nodAmplitude: number;
    nodSpeed: number;
    laugh: boolean;
    laughLevel: number;
    laughPhase: number;
    laughLast: number;
    laughFrequency: number;
    laughAmplitude: number;
    laughMouthAmplitude: number;
    laughSquint: number;
    laughMouthOpen: number;
    laughY: number;
    laughMouthY: number;
    laughOpenAmount: number;
    shakeX: number;
    shakeXNext: number;
    shakeY: number;
    shakeYNext: number;
    mouthShakeY: number;
    mouthShakeYNext: number;
    cry: boolean;
    cryDrops: number;
    crySpeed: number;
    cryFall: number;
    crySize: number;
    cryRise: number;
    cryFrequency: number;
    cryAmplitude: number;
    cryMouthAmplitude: number;
    cryLevel: number;
    cryPhase: number;
    cryLast: number;
    cryY: number;
    cryMouthY: number;
    sigh: boolean;
    sighFrequency: number;
    sighAmplitude: number;
    sighMouthAmplitude: number;
    sighMouthOpen: number;
    sighMouthNarrow: number;
    sighLevel: number;
    sighPhase: number;
    sighY: number;
    sighMouthY: number;
    sighOpenAmount: number;
    tears: {
        y: number;
        dx: number;
    }[][];
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
    /** Pass a canvas to draw on it, or any object implementing Display. config changes any default setting. */
    constructor(target: HTMLCanvasElement | Display, options?: {
        precision?: 'pixel' | 'smooth';
        config?: FaceConfigPatch;
    });
    /** Port: every setting as one object, the shape configure() takes. */
    getConfig(): FaceConfig;
    /** Port: change any settings at once. What the patch leaves out keeps its current value. */
    configure(patch: FaceConfigPatch): void;
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
    setMood(mood: Mood | string, options?: {
        for?: number;
    }): void;
    private applyMoodStates;
    setEyes(name: string): void;
    setMouthState(name: string): void;
    setLook(name: string): void;
    /** Port: where a follow look points, as fractions of how far the eyes can move (x: 0 left, 1 right; y: 0 up, 1 down).
     *  Call it as often as the target moves, e.g. from a mousemove handler. */
    lookAt(x: number, y: number): void;
    /** Port: the eye state in use, with the mood's changes to it. */
    currentEyes(): EyeState;
    /** Port: the mouth state in use, with the mood's changes to it. */
    currentMouth(): MouthState;
    private applyEyes;
    private applyMouth;
    setPosition(position: Position): void;
    setAutoblinker(active: boolean, interval?: number, variation?: number): void;
    setIdleMode(active: boolean, interval?: number, variation?: number): void;
    setCuriosity(curiousBit: boolean): void;
    setCyclops(cyclopsBit: boolean): void;
    setShake(shakeBit: boolean, amplitude?: number): void;
    setHFlicker(flickerBit: boolean, amplitude?: number): void;
    setVFlicker(flickerBit: boolean, amplitude?: number): void;
    setSweat(sweatBit: boolean): void;
    setSigh(sighBit: boolean): void;
    setCry(cryBit: boolean): void;
    setMouth(mouthBit: boolean): void;
    setMouthWidth(width: number): void;
    setMouthCorners(left: number, right?: number): void;
    setTalk(talkBit: boolean): void;
    setViseme(name: string | null): void;
    speak(text: string, options?: SpeechOptions): number;
    speakVisemes(sequence: Array<{
        viseme: string | Viseme;
        ms: number;
    }>): void;
    setMouthGap(gap: number): void;
    getScreenConstraint_X(): number;
    eyeYAt(fraction: number): number;
    mouthReach(): number;
    motionReduced(): boolean;
    private motionQuery?;
    private close;
    private open;
    blink(left?: boolean, right?: boolean): void;
    setLaugh(laughBit: boolean): void;
    anim_laugh(): void;
    drawEyes(): void;
    /** A lid in pixels for an eye h tall, eased like the original's eyelids. */
    private laughed;
    private easeLid;
    /**
     * The cut-outs for an eye's top and bottom lids, between its inner and outer edge (x positions,
     * either way round). A fully tilted lid with no curve is exactly the original's tired or angry
     * triangle.
     */
    private lidCuts;
    /**
     * An eye's height while it blinks: blinkSpeed of the remaining way each frame. At 0.5 in "pixel" precision
     * this is exactly the original's int((current + next) / 2), including stopping a pixel short when opening.
     */
    private blinkEase;
    /** Halfway to the target each frame, like every value in the original. Always arrives, in both precisions. */
    private ease;
    /**
     * The mouth is one line, centred under the eyes, that moves with them (blinks leave it alone,
     * since the eyes close around their centre; it follows a head shake and a nod, and lifts and opens
     * with each bounce when laughing). Its middle
     * stays straight; only the two corners bend, each by its own amount, over the outer quarter of
     * the line on each side.
     */
    drawMouth(): void;
}

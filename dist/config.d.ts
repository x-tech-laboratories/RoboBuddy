/** One eyelid. Sizes are fractions of the eye's height, so a state fits any eye. */
export interface LidShape {
    /** How far the lid comes over the eye at its corners: 0 leaves the eye open, 1 covers it. */
    height: number;
    /** Tilts the lid: 1 lowers only the outer corner (sad), -1 only the inner corner (angry), 0 keeps it level. */
    angle: number;
    /** Positive: how much further the middle of the lid comes in than its corners (an arch). Negative: how much
     *  further the corners come in than the middle (a bowl). Either way, height is the depth at the shallower part. */
    curve: number;
}
/** One eye's own lids, laid over the eye state's shared ones: only what differs for that eye. */
export interface EyeLids {
    top?: Partial<LidShape>;
    bottom?: Partial<LidShape>;
}
/** An eye state: the two eyelids, and whether the eyes stay closed. */
export interface EyeState {
    /** The lids both eyes share. */
    top: LidShape;
    bottom: LidShape;
    /** Changes for the left or right eye only (as seen on screen). */
    left?: EyeLids;
    right?: EyeLids;
    /** For organising only: the folder it is filed in, as a path such as 'Upset/Angry'. */
    group?: string;
    /** true: both eyes stay closed, and auto blink and wander wait. 'left' or 'right' (as seen on screen): that eye
     *  stays closed, a wink, and auto blink blinks only the other. */
    closed: boolean | 'left' | 'right';
}
/** A mouth state, in screen pixels. */
export interface MouthState {
    /** How far the left corner bends: positive up (smile), negative down (frown). */
    left: number;
    /** How far the right corner bends, the same way. */
    right: number;
    /** The mouth's length in this state. Only used when FaceConfig.mouth.moodWidth is on, or ownWidth is. */
    width?: number;
    /** Always use this state's width, even with FaceConfig.mouth.moodWidth off: for a mouth whose length is the
     *  point of it, like closedGasp. */
    ownWidth?: boolean;
    /** Prototype: how far the middle of the mouth opens downwards, making its line a rectangle that many pixels taller. */
    open?: number;
    /** How far the left corner opens downwards on its own, the same way. 0 keeps that corner a plain line end. */
    leftOpen?: number;
    /** How far the right corner opens downwards on its own. */
    rightOpen?: number;
    /** Mirror the corners when the eyes look left, so a lopsided mouth (smirk) curls up on the side away from where
     *  they look. Looking right or ahead leaves it as set. */
    followLook?: boolean;
    /** For organising only: the folder it is filed in, as a path such as 'Upset/Angry'. */
    group?: string;
}
/** A look: where the eyes point, as a fraction of how far they can move (x: 0 left, 1 right; y: 0 up, 1 down). */
export interface LookState {
    x: number;
    y: number;
    /** Instead of holding still, look somewhere random every so often (the original's idle mode). */
    wander?: boolean;
    /** Instead of holding still, glance from side to side: to x - reach, then x + reach, holding each glance
     *  for holdMs. Slow for suspicious, quick for shifty. */
    dart?: {
        reach: number;
        holdMs: number;
    };
    /** Keep shaking the head while looking here (at the shakeHead settings), until another look is set. */
    shakeHead?: boolean;
    /** Keep nodding while looking here (at the nod settings), until another look is set. */
    nod?: boolean;
    /** For organising only: the folder it is filed in, as a path such as 'Upset/Angry'. */
    group?: string;
}
/** Face states that are simply on or off. */
export interface Toggles {
    /** Blink every so often (at the blink settings). */
    autoblink: boolean;
    /** The outer eye grows when looking to the side. */
    curious: boolean;
    sweat: boolean;
    /** The eyes jitter left and right every frame (the original's horizontal flicker). */
    shake: boolean;
    /** Whatever the mouth state, the mouth keeps opening and closing at random, like syllables (at the talk settings). */
    talk: boolean;
}
/** Parts of the face itself, which stay the same whatever the mood. */
export interface Modes {
    cyclops: boolean;
    mouth: boolean;
    /** Fractional maths for softer motion, instead of the original's whole pixels. */
    smooth: boolean;
}
/**
 * A mood: face states by name, and toggles. An eye or mouth state it leaves out is "open" or "softSmile"; a toggle
 * it leaves out is its default from FaceConfig.toggles; a look it leaves out stays where it is.
 */
export interface MoodConfig extends Partial<Toggles> {
    eyes?: string;
    mouth?: string;
    look?: string;
    /** Changes to the chosen eye and mouth states, for this mood only. */
    override?: {
        eyes?: Patch<EyeState>;
        mouth?: Partial<MouthState>;
    };
    /** For organising only: the folder it is filed in, as a path such as 'Upset/Angry'. */
    group?: string;
}
export interface EyeShape {
    width: number;
    height: number;
    radius: number;
}
/** Every setting of a face. Pixel values are in screen pixels. Times are in seconds unless named ms. */
export interface FaceConfig {
    frameRate: number;
    /** closedHeight: how tall a closed eye stays. The default matches the mouth's thickness. */
    eyes: {
        left: EyeShape;
        right: EyeShape;
        spacing: number;
        closedHeight: number;
    };
    mouth: {
        /** Space between the bottom of the eyes and the mouth. */
        gap: number;
        thickness: number;
        /** How round the corners of an open mouth are, like an eye's radius. Only the corners that open by their own
         *  amount (leftOpen, rightOpen) have a corner to round. */
        radius: number;
        /** How much of each end of the line bends at the corners, as a fraction of its length. */
        curl: number;
        /** The face's own mouth length, used whatever the mouth state when moodWidth is off. */
        width: number;
        /** On: the mouth state's width (if it has one) sets the length. Off (the default): it stays at width. */
        moodWidth: boolean;
    };
    /** speed: how much of the remaining way a blinking eye goes each frame (0.5, as the original). The laugh
     *  swings move at the same speed; shake head and nod have their own. */
    blink: {
        interval: number;
        variation: number;
        speed: number;
    };
    /** How often a wandering look moves on. */
    wander: {
        interval: number;
        variation: number;
    };
    /** Curious: an eye this close to the screen edge grows by this much. */
    curious: {
        growth: number;
        edge: number;
    };
    laugh: {
        amplitude: number;
        mouthAmplitude: number;
        durationMs: number;
    };
    shakeHead: {
        amplitude: number;
        speed: number;
    };
    /** A talking mouth: it picks a new opening every syllableMs plus up to variationMs more; pauseChance (0 to 1) is how
     *  often that opening is shut, like a gap between words. open is how far a mouth state with no
     *  opening of its own opens, in pixels, and lipLift how far, the upper lip rises
     *  with a full opening, and cornerSway how far each corner wanders, on its own timing, as the mouth talks. */
    talk: {
        syllableMs: number;
        variationMs: number;
        pauseChance: number;
        open: number;
        lipLift: number;
        cornerSway: number;
    };
    nod: {
        amplitude: number;
        speed: number;
    };
    /** How far the shake toggle jitters the eyes, in pixels. */
    shake: {
        amplitude: number;
    };
    modes: Modes;
    /** The look the face has now (or starts with). */
    look: string;
    /** What each toggle is when a mood says nothing about it. */
    toggles: Toggles;
    eyeStates: Record<string, EyeState>;
    mouthStates: Record<string, MouthState>;
    looks: Record<string, LookState>;
    /** The moods setMood() can pick from, by name. Add a key to add a mood. */
    moods: Record<string, MoodConfig>;
}
/** Any part of T. What is left out keeps its current value. */
export type Patch<T> = T extends object ? {
    [K in keyof T]?: Patch<T[K]> | null;
} : T;
/** Any part of a FaceConfig. null in a mood removes that choice, as if the mood had left it out. */
export type FaceConfigPatch = Patch<FaceConfig>;
/** The face's settings and states as they come, kept in defaultConfig.json. */
export declare const defaultConfig: FaceConfig;
/** A deep copy of config with patch laid over it. */
export declare function mergeConfig(config: FaceConfig, patch: FaceConfigPatch): FaceConfig;

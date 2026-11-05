/*
 * RoboEyes for the web: the face's settings and their defaults.
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
 */

/*
 * A face is built in layers:
 * - face states, the building blocks: a face state for the whole face (still, or shaking its head or
 *   nodding), an eye state (the eyelids, or one or both eyes closed), a mouth state (how the corners
 *   bend), a look (where the eyes point, or wander) and four toggles (auto blink, curious, sweat and shake).
 *   Each can be set on its own.
 * - moods: named combinations of face states, with tweaks to the eyelids and mouth for that mood only.
 * - face settings: the eyes' and mouth's size and place, timings, and the modes, which no mood changes.
 *
 * Moods and face states can be filed in folders with group: 'Upset/Angry'. That only organises them (the demo shows
 * the folders); every name must still be unique within its kind.
 */

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

/** What the whole face does: hold still, or keep shaking its head or nodding (at the shakeHead and nod settings). */
export const FACE_STATES = ['still', 'shakeHead', 'nod'] as const;
export type FaceState = typeof FACE_STATES[number];

/** A mouth state, in screen pixels. */
export interface MouthState {
    /** How far the left corner bends: positive up (smile), negative down (frown). */
    left: number;
    /** How far the right corner bends, the same way. */
    right: number;
    /** The mouth's length in this state. Only used when FaceConfig.mouth.moodWidth is on, or ownWidth is. */
    width?: number;
    /** Always use this state's width, even with FaceConfig.mouth.moodWidth off: for a mouth whose length is the
     *  point of it, like surprised. */
    ownWidth?: boolean;
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
    dart?: { reach: number; holdMs: number };
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
}

/** Parts of the face itself, which stay the same whatever the mood. */
export interface Modes {
    cyclops: boolean;
    mouth: boolean;
    /** Fractional maths for softer motion, instead of the original's whole pixels. */
    smooth: boolean;
}

/**
 * A mood: face states by name, and toggles. An eye or mouth state it leaves out is "open" or "neutral"; a toggle
 * it leaves out is its default from FaceConfig.toggles; a look it leaves out stays where it is.
 */
export interface MoodConfig extends Partial<Toggles> {
    /** One of FACE_STATES; still if left out. */
    face?: FaceState;
    eyes?: string;
    mouth?: string;
    look?: string;
    /** Changes to the chosen eye and mouth states, for this mood only. */
    override?: { eyes?: Patch<EyeState>; mouth?: Partial<MouthState> };
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
    eyes: { left: EyeShape; right: EyeShape; spacing: number; closedHeight: number };
    mouth: {
        /** Space between the bottom of the eyes and the mouth. */
        gap: number;
        thickness: number;
        /** How much of each end of the line bends at the corners, as a fraction of its length. */
        curl: number;
        /** The face's own mouth length, used whatever the mouth state when moodWidth is off. */
        width: number;
        /** On: the mouth state's width (if it has one) sets the length. Off (the default): it stays at width. */
        moodWidth: boolean;
    };
    /** speed: how much of the remaining way a blinking eye goes each frame (0.5, as the original). The laugh, shake
     *  head and nod swings move at the same speed. */
    blink: { interval: number; variation: number; speed: number };
    /** How often a wandering look moves on. */
    wander: { interval: number; variation: number };
    /** Curious: an eye this close to the screen edge grows by this much. */
    curious: { growth: number; edge: number };
    laugh: { amplitude: number; mouthAmplitude: number; durationMs: number };
    shakeHead: { amplitude: number; durationMs: number };
    nod: { amplitude: number; durationMs: number };
    /** How far the shake toggle jitters the eyes, in pixels. */
    shake: { amplitude: number };
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
export type Patch<T> = T extends object ? { [K in keyof T]?: Patch<T[K]> | null } : T;
/** Any part of a FaceConfig. null in a mood removes that choice, as if the mood had left it out. */
export type FaceConfigPatch = Patch<FaceConfig>;

const level: LidShape = { height: 0, angle: 0, curve: 0 };

export const defaultConfig: FaceConfig = {
    frameRate: 50,
    eyes: {
        left: { width: 36, height: 36, radius: 8 },
        right: { width: 36, height: 36, radius: 8 },
        spacing: 10,
        closedHeight: 3,
    },
    mouth: { gap: 16, thickness: 3, curl: 0.25, width: 50, moodWidth: false },
    blink: { interval: 1, variation: 4, speed: 0.5 },
    wander: { interval: 1, variation: 3 },
    curious: { growth: 8, edge: 10 },
    laugh: { amplitude: 5, mouthAmplitude: 2, durationMs: 500 },
    shakeHead: { amplitude: 20, durationMs: 500 },
    nod: { amplitude: 6, durationMs: 500 },
    shake: { amplitude: 2 },
    modes: { cyclops: false, mouth: true, smooth: true },
    look: 'wander',
    toggles: { autoblink: false, curious: false, sweat: false, shake: false },
    eyeStates: {
        open: { top: level, bottom: level, closed: false },
        // the original's tired
        sad: { top: { height: 0.5, angle: 1, curve: 0 }, bottom: level, closed: false, group: 'Expressions' },
        angry: { top: { height: 0.5, angle: -1, curve: 0 }, bottom: level, closed: false, group: 'Expressions' },
        happy: { top: level, bottom: { height: 0.3, angle: 0, curve: 0.2 }, closed: false, group: 'Expressions' },
        happySad: {
            top: { height: 0.5, angle: 1, curve: 0 },
            bottom: { height: 0.4, angle: 0, curve: 0.1 },
            closed: false,
            group: 'Expressions',
        },
        // The left lid lowered, so the right eye looks raised: one eyebrow up
        confused: {
            top: level, bottom: level, closed: false, group: 'Expressions',
            left: { top: { height: 0.4, angle: -0.3 } },
        },
        // Heavy lids, nearly meeting
        sleepy: {
            top: { height: 0.5, angle: 0, curve: 0.1 },
            bottom: { height: 0.35, angle: 0, curve: -0.1 },
            closed: false,
            group: 'Expressions',
        },
        closed: { top: level, bottom: level, closed: true, group: 'Closed' },
        winkLeft: { top: level, bottom: level, closed: 'left', group: 'Closed/One eye' },
        winkRight: { top: level, bottom: level, closed: 'right', group: 'Closed/One eye' },
        // One eye shut, the other with happySad's lids but the top one tilted the other way
        peekLeft: {
            top: { height: 0.5, angle: -1, curve: 0 },
            bottom: { height: 0.4, angle: 0, curve: 0.1 },
            closed: 'right',
            group: 'Closed/One eye',
        },
        peekRight: {
            top: { height: 0.5, angle: -1, curve: 0 },
            bottom: { height: 0.4, angle: 0, curve: 0.1 },
            closed: 'left',
            group: 'Closed/One eye',
        },
    },
    mouthStates: {
        neutral: { left: 2, right: 2, width: 20 }, // a hint of a smile
        flat: { left: 0, right: 0, width: 16 },
        surprised: { left: 0, right: 0, width: 3, ownWidth: true }, // flat, but always just a dot
        wavy: { left: 3, right: -3, width: 20 },
        smile: { left: 4, right: 4, width: 28, group: 'Smiles' },
        softSmile: { left: 3, right: 3, width: 24, group: 'Smiles' },
        smirk: { left: 4, right: 0, width: 20, group: 'Smiles' },
        slack: { left: -1, right: -1, width: 12, group: 'Frowns' },
        frown: { left: -3, right: -3, width: 18, group: 'Frowns' },
    },
    looks: {
        center: { x: 0.5, y: 0.5 },
        N: { x: 0.5, y: 0 },
        NE: { x: 1, y: 0 },
        E: { x: 1, y: 0.5 },
        SE: { x: 1, y: 1 },
        S: { x: 0.5, y: 1 },
        SW: { x: 0, y: 1 },
        W: { x: 0, y: 0.5 },
        NW: { x: 0, y: 0 },
        wander: { x: 0.5, y: 0.5, wander: true, group: 'Moving' },
        dart: { x: 0.5, y: 0.5, dart: { reach: 0.5, holdMs: 600 }, group: 'Moving' },
    },
    moods: {
        default: {},
        happy: { eyes: 'happy', mouth: 'smile', group: 'Happy' },
        smirk: { mouth: 'smirk', override: { eyes: { top: { height: 0.5 } } }, group: 'Happy' },
        asleep: { eyes: 'closed', mouth: 'flat', group: 'Sleepy' },
        happyAsleep: { eyes: 'closed', mouth: 'softSmile', group: 'Sleepy' },
        sleepy: { eyes: 'sleepy', look: 'center', autoblink: false, group: 'Sleepy' },
        confused: { eyes: 'confused', mouth: 'wavy' },
        surprised: { mouth: 'surprised' },
        sad: { eyes: 'sad', mouth: 'slack', group: 'Upset' },
        worried: { eyes: 'sad', mouth: 'wavy', sweat: true, group: 'Upset' },
        scared: { eyes: 'sad', mouth: 'wavy', look: 'dart', sweat: true, shake: true, group: 'Upset' },
        angry: { eyes: 'angry', mouth: 'frown', group: 'Upset/Angry' },
        furious: { eyes: 'angry', mouth: 'frown', look: 'wander', curious: true, shake: true, group: 'Upset/Angry' },
    },
};

/** A deep copy of config with patch laid over it. */
export function mergeConfig(config: FaceConfig, patch: FaceConfigPatch): FaceConfig {
    return merge(structuredClone(config), patch) as FaceConfig;
}

function merge(target: any, patch: any): any {
    for (const [key, value] of Object.entries(patch ?? {})) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            target[key] = merge(target[key] && typeof target[key] === 'object' ? target[key] : {}, value);
        } else if (value !== undefined) {
            target[key] = value;
        }
    }
    return target;
}

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
/** What the whole face does: hold still, or keep shaking its head or nodding (at the shakeHead and nod settings). */
export const FACE_STATES = ['still', 'shakeHead', 'nod'];
const level = { height: 0, angle: 0, curve: 0 };
export const defaultConfig = {
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
        asleep: { eyes: 'sleepy', mouth: 'surprised', look: 'center', autoblink: false, group: 'Sleepy' },
        happyAsleep: { eyes: 'closed', mouth: 'softSmile', group: 'Sleepy' },
        sleepy: { eyes: 'sleepy', look: 'center', autoblink: false, group: 'Sleepy' },
        confused: { eyes: 'confused', mouth: 'wavy' },
        surprised: { mouth: 'surprised' },
        sad: { eyes: 'sad', mouth: 'slack', group: 'Upset' },
        worried: { eyes: 'sad', mouth: 'wavy', group: 'Upset' },
        scared: { eyes: 'sad', mouth: 'wavy', look: 'dart', sweat: true, shake: true, group: 'Upset' },
        angry: { eyes: 'angry', mouth: 'frown', group: 'Upset/Angry' },
        furious: { eyes: 'angry', mouth: 'frown', look: 'wander', curious: true, shake: true, group: 'Upset/Angry' },
    },
};
/** A deep copy of config with patch laid over it. */
export function mergeConfig(config, patch) {
    return merge(structuredClone(config), patch);
}
function merge(target, patch) {
    for (const [key, value] of Object.entries(patch ?? {})) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            target[key] = merge(target[key] && typeof target[key] === 'object' ? target[key] : {}, value);
        }
        else if (value !== undefined) {
            target[key] = value;
        }
    }
    return target;
}

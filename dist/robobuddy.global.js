/* RoboBuddy, script-tag build: everything is on window.RoboBuddyLib. Licence and credits below. */
(function () {
/*
 * RoboBuddy for the web: the face's settings and their defaults.
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
const defaultConfigJson = {
    "frameRate": 50,
    "eyes": {
        "left": {
            "width": 36,
            "height": 36,
            "radius": 8
        },
        "right": {
            "width": 36,
            "height": 36,
            "radius": 8
        },
        "spacing": 10,
        "closedHeight": 3,
        "offsetY": 0
    },
    "mouth": {
        "gap": 16,
        "thickness": 3,
        "radius": 4,
        "curl": 0.25,
        "width": 50,
        "moodWidth": false
    },
    "blink": {
        "interval": 1,
        "variation": 4,
        "speed": 0.5
    },
    "transition": {
        "durationMs": 500,
        "speed": 0.2,
        "blink": false
    },
    "wander": {
        "interval": 1,
        "variation": 3
    },
    "curious": {
        "growth": 8,
        "edge": 10
    },
    "follow": {
        "fullX": 0.6,
        "fullY": 0.4
    },
    "laugh": {
        "frequency": 6,
        "amplitude": 3,
        "mouthAmplitude": 2,
        "squint": 0.35,
        "mouthOpen": 8
    },
    "cry": {
        "drops": 2,
        "speed": 0.5,
        "fall": 18,
        "size": 3,
        "rise": 5,
        "frequency": 3,
        "amplitude": 2,
        "mouthAmplitude": 1
    },
    "sigh": {
        "frequency": 0.25,
        "amplitude": 3,
        "mouthAmplitude": 2,
        "mouthOpen": 5,
        "mouthNarrow": 0.3
    },
    "shakeHead": {
        "amplitude": 20,
        "speed": 0.5
    },
    "nod": {
        "amplitude": 6,
        "speed": 0.5
    },
    "talk": {
        "syllableMs": 110,
        "variationMs": 90,
        "pauseChance": 0.2,
        "open": 8,
        "lipLift": 2,
        "cornerSway": 1.5,
        "visemes": {
            "rest": { "open": 0, "corner": 1, "width": 1, "lift": 0, "lip": 0 },
            "mbp": { "open": 0, "corner": 1, "width": 0.95, "lift": 0, "lip": 0 },
            "ah": { "open": 1, "corner": 1, "width": 1, "lift": 0, "lip": 1 },
            "eh": { "open": 0.6, "corner": 1, "width": 1.05, "lift": 0.5, "lip": 0.7 },
            "ee": { "open": 0.25, "corner": 0.5, "width": 1.15, "lift": 1.5, "lip": 0.3 },
            "o": { "open": 0.7, "corner": 0.4, "width": 0.7, "lift": 0, "lip": 0.6 },
            "oo": { "open": 0.35, "corner": 0.3, "width": 0.55, "lift": 0, "lip": 0.2 },
            "fv": { "open": 0.2, "corner": 0.6, "width": 1, "lift": 0, "lip": 1 },
            "ch": { "open": 0.3, "corner": 0.4, "width": 0.75, "lift": 0, "lip": 0.4 },
            "ss": { "open": 0.2, "corner": 0.8, "width": 1.05, "lift": 0.5, "lip": 0.3 },
            "uh": { "open": 0.4, "corner": 1, "width": 1, "lift": 0, "lip": 0.3 },
            "ih": { "open": 0.3, "corner": 0.8, "width": 1.08, "lift": 0.6, "lip": 0.3 },
            "th": { "open": 0.2, "corner": 0.8, "width": 1, "lift": 0, "lip": 0.2 },
            "er": { "open": 0.35, "corner": 0.5, "width": 0.8, "lift": 0, "lip": 0.3 },
            "kg": { "open": 0.3, "corner": 1, "width": 1, "lift": 0, "lip": 0.2 }
        }
    },
    "shake": {
        "amplitude": 2
    },
    "modes": {
        "cyclops": false,
        "mouth": true,
        "smooth": true,
        "reducedMotion": "auto"
    },
    "look": "wander",
    "toggles": {
        "autoblink": false,
        "curious": false,
        "sweat": false,
        "shake": false,
        "talk": false,
        "laugh": false,
        "cry": false,
        "sigh": false
    },
    "eyeStates": {
        "open": {
            "top": {
                "height": 0,
                "angle": 0,
                "curve": 0
            },
            "bottom": {
                "height": 0,
                "angle": 0,
                "curve": 0
            },
            "closed": false
        },
        "sad": {
            "top": {
                "height": 0.5,
                "angle": 1,
                "curve": 0
            },
            "bottom": {
                "height": 0,
                "angle": 0,
                "curve": 0
            },
            "closed": false,
            "group": "Sad"
        },
        "angry": {
            "top": {
                "height": 0.5,
                "angle": -1,
                "curve": 0
            },
            "bottom": {
                "height": 0,
                "angle": 0,
                "curve": 0
            },
            "closed": false,
            "group": "Anger"
        },
        "happy": {
            "top": {
                "height": 0,
                "angle": 0,
                "curve": 0
            },
            "bottom": {
                "height": 0.3,
                "angle": 0,
                "curve": 0.2
            },
            "closed": false,
            "group": "Happy"
        },
        "happySad": {
            "top": {
                "height": 0.5,
                "angle": 1,
                "curve": 0
            },
            "bottom": {
                "height": 0.4,
                "angle": 0,
                "curve": 0.1
            },
            "closed": false,
            "group": "Sad"
        },
        "confused": {
            "top": {
                "height": 0,
                "angle": 0,
                "curve": 0
            },
            "bottom": {
                "height": 0,
                "angle": 0,
                "curve": 0
            },
            "closed": false,
            "group": "Thinking",
            "left": {
                "top": {
                    "height": 0.4,
                    "angle": -0.3
                }
            }
        },
        "sleepy": {
            "top": {
                "height": 0.5,
                "angle": 0,
                "curve": 0.1
            },
            "bottom": {
                "height": 0.35,
                "angle": 0,
                "curve": -0.1
            },
            "closed": false,
            "group": "Sleepy"
        },
        "drowsy": {
            "top": {
                "height": 0.72,
                "angle": 0,
                "curve": 0.1
            },
            "bottom": {
                "height": 0.4,
                "angle": 0,
                "curve": -0.1
            },
            "closed": false,
            "group": "Sleepy"
        },
        "closed": {
            "top": {
                "height": 0,
                "angle": 0,
                "curve": 0
            },
            "bottom": {
                "height": 0,
                "angle": 0,
                "curve": 0
            },
            "closed": true
        },
        "winkLeft": {
            "top": {
                "height": 0,
                "angle": 0,
                "curve": 0
            },
            "bottom": {
                "height": 0,
                "angle": 0,
                "curve": 0
            },
            "closed": "left",
            "group": "One eye"
        },
        "winkRight": {
            "top": {
                "height": 0,
                "angle": 0,
                "curve": 0
            },
            "bottom": {
                "height": 0,
                "angle": 0,
                "curve": 0
            },
            "closed": "right",
            "group": "One eye"
        },
        "peekLeft": {
            "top": {
                "height": 0.5,
                "angle": -1,
                "curve": 0
            },
            "bottom": {
                "height": 0.4,
                "angle": 0,
                "curve": 0.1
            },
            "closed": "right",
            "group": "One eye"
        },
        "peekRight": {
            "top": {
                "height": 0.5,
                "angle": -1,
                "curve": 0
            },
            "bottom": {
                "height": 0.4,
                "angle": 0,
                "curve": 0.1
            },
            "closed": "left",
            "group": "One eye"
        },
        "disgusted": {
            "top": {
                "height": 0.45,
                "angle": 0,
                "curve": 0
            },
            "bottom": {
                "height": 0.3,
                "angle": 0,
                "curve": -0.15
            },
            "closed": false,
            "group": "Disgust"
        }
    },
    "mouthStates": {
        "flat": {
            "left": 0,
            "right": 0,
            "width": 16
        },
        "open": {
            "left": 0,
            "right": 0,
            "width": 20,
            "open": 6,
            "leftOpen": 6,
            "rightOpen": 6
        },
        "closedGasp": {
            "left": 0,
            "right": 0,
            "width": 3,
            "ownWidth": true
        },
        "openGasp": {
            "left": 0,
            "right": 0,
            "width": 14,
            "ownWidth": true,
            "open": 10,
            "leftOpen": 10,
            "rightOpen": 10,
            "group": "Surprise"
        },
        "wry": {
            "left": 3,
            "right": -3,
            "width": 20,
            "group": "Fear"
        },
        "softSmile": {
            "left": 3,
            "right": 3,
            "width": 24,
            "group": "Happy"
        },
        "smile": {
            "left": 4,
            "right": 4,
            "width": 28,
            "group": "Happy"
        },
        "openSmile": {
            "left": 1,
            "right": 1,
            "width": 24,
            "open": 6,
            "group": "Happy"
        },
        "wideSmile": {
            "left": 4,
            "right": 4,
            "width": 32,
            "open": 8,
            "leftOpen": 3,
            "rightOpen": 3,
            "group": "Happy"
        },
        "laugh": {
            "left": 2,
            "right": 2,
            "width": 32,
            "open": 10,
            "leftOpen": 6,
            "rightOpen": 6,
            "group": "Happy"
        },
        "smirk": {
            "left": 4,
            "right": 0,
            "width": 20,
            "followLook": true,
            "group": "Happy"
        },
        "slack": {
            "left": -1,
            "right": -1,
            "width": 12,
            "group": "Sad"
        },
        "frown": {
            "left": -3,
            "right": -3,
            "width": 18,
            "group": "Sad"
        },
        "flatBottomFrown": {
            "left": -6,
            "right": -6,
            "width": 28,
            "open": 10,
            "leftOpen": 4,
            "rightOpen": 4,
            "group": "Sad"
        },
        "openFrown": {
            "left": -6,
            "right": -6,
            "width": 28,
            "open": 6,
            "leftOpen": 6,
            "rightOpen": 6,
            "group": "Sad"
        },
        "grimace": {
            "left": -4,
            "right": 1,
            "width": 20,
            "followLook": true,
            "group": "Disgust"
        }
    },
    "looks": {
        "center": {
            "x": 0.5,
            "y": 0.5
        },
        "N": {
            "x": 0.5,
            "y": 0
        },
        "NE": {
            "x": 1,
            "y": 0
        },
        "E": {
            "x": 1,
            "y": 0.5
        },
        "SE": {
            "x": 1,
            "y": 1
        },
        "S": {
            "x": 0.5,
            "y": 1
        },
        "SW": {
            "x": 0,
            "y": 1
        },
        "W": {
            "x": 0,
            "y": 0.5
        },
        "NW": {
            "x": 0,
            "y": 0
        },
        "wander": {
            "x": 0.5,
            "y": 0.5,
            "wander": true,
            "group": "Moving"
        },
        "lookAround": {
            "x": 0.5,
            "y": 0.5,
            "wander": {
                "interval": 0.3,
                "variation": 0.6
            },
            "group": "Moving"
        },
        "glanceUp": {
            "x": 0.5,
            "y": 0.2,
            "path": [
                { "x": 0.3, "y": 0.2, "holdMs": 1500 },
                { "x": 0.7, "y": 0.15, "holdMs": 1500 },
                { "x": 0.5, "y": 0.1, "holdMs": 1000 }
            ],
            "group": "Moving"
        },
        "scan": {
            "x": 0.5,
            "y": 0.5,
            "path": [
                { "x": 0.35, "y": 0.5, "holdMs": 1700 },
                { "x": 0.65, "y": 0.5, "holdMs": 1700 }
            ],
            "group": "Moving"
        },
        "shakeHeadUp": {
            "x": 0.5,
            "y": 0,
            "shakeHead": true,
            "group": "Shaking head"
        },
        "shakeHeadCenter": {
            "x": 0.5,
            "y": 0.5,
            "shakeHead": true,
            "group": "Shaking head"
        },
        "shakeHeadCenterSlow": {
            "x": 0.5,
            "y": 0.5,
            "shakeHead": {
                "speed": 0.3
            },
            "group": "Shaking head"
        },
        "shakeHeadDown": {
            "x": 0.5,
            "y": 1,
            "shakeHead": true,
            "group": "Shaking head"
        },
        "nodLeft": {
            "x": 0,
            "y": 0.5,
            "nod": true,
            "group": "Nodding"
        },
        "nodCenter": {
            "x": 0.5,
            "y": 0.5,
            "nod": true,
            "group": "Nodding"
        },
        "nodRight": {
            "x": 1,
            "y": 0.5,
            "nod": true,
            "group": "Nodding"
        },
        "follow": {
            "x": 0.5,
            "y": 0.5,
            "follow": true,
            "group": "Moving"
        }
    },
    "moods": {
        "default": {
            "look": "wander",
            "autoblink": true
        },
        "happy": {
            "eyes": "happy",
            "mouth": "openSmile",
            "group": "Happy"
        },
        "laughing": {
            "eyes": "happy",
            "mouth": "laugh",
            "laugh": true,
            "group": "Happy"
        },
        "proud": {
            "eyes": "happySad",
            "mouth": "smile",
            "group": "Happy"
        },
        "happyYes": {
            "eyes": "happy",
            "mouth": "openSmile",
            "look": "nodCenter",
            "group": "Happy"
        },
        "happyNo": {
            "eyes": "happy",
            "mouth": "openSmile",
            "look": "shakeHeadCenter",
            "group": "Happy"
        },
        "smirk": {
            "mouth": "smirk",
            "override": {
                "eyes": {
                    "top": {
                        "height": 0.5
                    }
                }
            },
            "group": "Happy"
        },
        "winkingLeft": {
            "eyes": "winkLeft",
            "mouth": "wideSmile",
            "group": "Happy"
        },
        "winkingRight": {
            "eyes": "winkRight",
            "mouth": "wideSmile",
            "group": "Happy"
        },
        "yes": {
            "look": "nodCenter"
        },
        "no": {
            "look": "shakeHeadCenter"
        },
        "talking": {
            "talk": true
        },
        "bored": {
            "mouth": "flat",
            "override": {
                "eyes": {
                    "top": {
                        "height": 0.5
                    }
                }
            }
        },
        "disappointed": {
            "mouth": "flat",
            "look": "center",
            "override": {
                "eyes": {
                    "top": {
                        "height": 0.5
                    }
                }
            },
            "group": "Sad"
        },
        "disappointedNo": {
            "mouth": "flat",
            "look": "shakeHeadCenterSlow",
            "override": {
                "eyes": {
                    "top": {
                        "height": 0.5
                    }
                }
            },
            "group": "Sad"
        },
        "asleep": {
            "eyes": "closed",
            "mouth": "closedGasp",
            "look": "center",
            "autoblink": false,
            "group": "Sleepy"
        },
        "peaceful": {
            "eyes": "sleepy",
            "look": "center",
            "autoblink": false,
            "group": "Sleepy"
        },
        "yawning": {
            "eyes": "sleepy",
            "mouth": "open",
            "look": "center",
            "sigh": true,
            "autoblink": false,
            "group": "Sleepy"
        },
        "waking": {
            "look": "center",
            "intro": [
                { "eyes": "closed", "ms": 600 },
                { "eyes": "drowsy", "ms": 500 },
                { "eyes": "sleepy", "ms": 450 },
                { "eyes": "drowsy", "ms": 350 },
                { "eyes": "sleepy", "ms": 700 }
            ],
            "group": "Sleepy"
        },
        "confused": {
            "eyes": "confused",
            "mouth": "wry",
            "group": "Thinking"
        },
        "thinking": {
            "mouth": "flat",
            "look": "NW",
            "override": {
                "eyes": {
                    "top": {
                        "height": 0.4,
                        "angle": -0.3,
                        "curve": 0.15
                    },
                    "bottom": {
                        "height": 0.3,
                        "curve": 0.15
                    }
                }
            },
            "group": "Thinking"
        },
        "confusedYes": {
            "eyes": "confused",
            "mouth": "wry",
            "look": "nodCenter",
            "group": "Thinking"
        },
        "confusedNo": {
            "eyes": "confused",
            "mouth": "wry",
            "look": "shakeHeadCenter",
            "group": "Thinking"
        },
        "surprised": {
            "mouth": "openGasp",
            "group": "Surprise"
        },
        "startled": {
            "mouth": "closedGasp",
            "scale": 1.12,
            "intro": [
                {
                    "scale": 1.3,
                    "ms": 150
                }
            ],
            "group": "Surprise"
        },
        "curious": {
            "mouth": "closedGasp",
            "look": "follow",
            "curious": true,
            "group": "Surprise"
        },
        "surprisedYes": {
            "mouth": "openGasp",
            "look": "nodCenter",
            "group": "Surprise"
        },
        "surprisedNo": {
            "mouth": "openGasp",
            "look": "shakeHeadCenter",
            "group": "Surprise"
        },
        "sad": {
            "eyes": "sad",
            "mouth": "slack",
            "group": "Sad"
        },
        "sighing": {
            "eyes": "sad",
            "mouth": "flat",
            "look": "S",
            "sigh": true,
            "group": "Sad"
        },
        "worried": {
            "eyes": "sad",
            "mouth": "wry",
            "group": "Fear"
        },
        "scared": {
            "eyes": "sad",
            "mouth": "flatBottomFrown",
            "look": "lookAround",
            "sweat": true,
            "shake": true,
            "group": "Fear"
        },
        "peekingLeft": {
            "eyes": "peekLeft",
            "mouth": "wry",
            "look": "W",
            "group": "Fear"
        },
        "peekingRight": {
            "eyes": "peekRight",
            "mouth": "wry",
            "look": "E",
            "group": "Fear"
        },
        "worriedYes": {
            "eyes": "sad",
            "mouth": "wry",
            "look": "nodCenter",
            "group": "Fear"
        },
        "worriedNo": {
            "eyes": "sad",
            "mouth": "wry",
            "look": "shakeHeadCenter",
            "group": "Fear"
        },
        "sobbing": {
            "eyes": "happySad",
            "mouth": "openFrown",
            "cry": true,
            "group": "Sad"
        },
        "sadYes": {
            "eyes": "sad",
            "mouth": "slack",
            "look": "nodCenter",
            "group": "Sad"
        },
        "sadNo": {
            "eyes": "sad",
            "mouth": "slack",
            "look": "shakeHeadCenter",
            "group": "Sad"
        },
        "angry": {
            "eyes": "angry",
            "mouth": "frown",
            "group": "Anger"
        },
        "furious": {
            "eyes": "angry",
            "mouth": "openFrown",
            "curious": true,
            "shake": true,
            "group": "Anger"
        },
        "angryYes": {
            "eyes": "angry",
            "mouth": "frown",
            "look": "nodCenter",
            "group": "Anger"
        },
        "angryNo": {
            "eyes": "angry",
            "mouth": "frown",
            "look": "shakeHeadCenter",
            "group": "Anger"
        },
        "disgusted": {
            "eyes": "disgusted",
            "mouth": "grimace",
            "look": "SW",
            "group": "Disgust"
        }
    }
}
;
/** The face's settings and states as they come, kept in defaultConfig.json. */
const defaultConfig = defaultConfigJson;
/** A deep copy of config with patch laid over it. */
function mergeConfig(config, patch) {
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

/** How long each sound lasts at a normal pace, in ms. */
const SOUND_MS = {
    ah: 120, eh: 105, ee: 105, o: 120, oo: 110, ih: 80, uh: 65, er: 90,
    mbp: 70, fv: 75, th: 70, ss: 60, ch: 85, kg: 55,
};
const VOWELS = new Set(['ah', 'eh', 'ee', 'o', 'oo', 'ih', 'uh', 'er']);
/** Sounds made with the lips, which keep their own shape instead of taking the next vowel's. */
const LIPS = new Set(['mbp', 'fv']);
/** Sounds that keep their own shape. */
const OWN = new Set(['er']);
/** How long a mark of punctuation holds the mouth shut, in ms. */
const PAUSE_MS = { ',': 220, ';': 260, ':': 260, '.': 380, '!': 380, '?': 380, '-': 120, '\n': 300 };
/** Words the letter rules get wrong, as the sounds they are said with. */
const WORDS = {
    the: 'th uh', a: 'uh', an: 'eh ss', and: 'uh ss', of: 'uh fv', to: 'ss oo', too: 'ss oo', two: 'ss oo', you: 'ee oo',
    your: 'ee o', are: 'ah', is: 'ih ss', was: 'oo uh ss', were: 'oo er', one: 'oo uh ss', once: 'oo uh ss', who: 'kg oo',
    what: 'oo uh ss', where: 'oo eh', there: 'th eh', their: 'th eh', they: 'th eh ee', them: 'th eh mbp', then: 'th eh ss',
    this: 'th ih ss', that: 'th eh ss', these: 'th ee ss', those: 'th o ss', with: 'oo ih th', have: 'kg eh fv', give: 'kg ih fv',
    live: 'ss ih fv', love: 'ss uh fv', some: 'ss uh mbp', come: 'kg uh mbp', do: 'ss oo', does: 'ss uh ss', done: 'ss uh ss',
    said: 'ss eh ss', says: 'ss eh ss', many: 'mbp eh ss ee', any: 'eh ss ee', very: 'fv eh er ee', people: 'mbp ee mbp uh',
    eye: 'ah ee', i: 'ah ee', "i'm": 'ah ee mbp', "i'll": 'ah ee ss', "i've": 'ah ee fv', "i'd": 'ah ee ss', "don't": 'ss o ss',
    "won't": 'oo o ss', "can't": 'kg eh ss', now: 'ss ah oo', how: 'kg ah oo', cow: 'kg ah oo', wow: 'oo ah oo', down: 'ss ah oo ss',
    town: 'ss ah oo ss', brown: 'mbp er ah oo ss', hello: 'kg eh ss o', hi: 'kg ah ee', hey: 'kg eh ee', yes: 'ee eh ss', no: 'ss o',
    robot: 'er o mbp ah ss', beautiful: 'mbp ee oo ss ih fv uh ss', through: 'th er oo', though: 'th o', thought: 'th o ss',
    could: 'kg oo ss', would: 'oo oo ss', should: 'ch oo ss', because: 'mbp ih kg uh ss', friend: 'fv er eh ss', great: 'kg er eh ee ss',
};
/** The digits, said one at a time. */
const DIGITS = ['ss ee er o', 'oo uh ss', 'ss oo', 'th er ee', 'fv o', 'fv ah ee fv', 'ss ih kg ss', 'ss eh fv uh ss', 'eh ee ss', 'ss ah ee ss'];
const isVowel = (c) => c !== '' && 'aeiou'.includes(c);
/** record[key] if the key is the record's own, so a word like "constructor" never finds a built-in property. */
function own(record, key) {
    return Object.prototype.hasOwnProperty.call(record, key) ? record[key] : undefined;
}
/** The sounds of one word, by spelling. */
function wordSounds(word) {
    const w = word.replace(/'/g, '');
    const n = w.length;
    const out = [];
    let groups = 0; // vowel groups so far; the first one carries the stress, the later ones are said lightly
    const at = (k) => w[k] ?? '';
    const vowel = (long, short) => {
        out.push(...(long.length ? long : [groups === 0 || short === 'ih' ? short : 'uh']));
        groups++;
    };
    for (let i = 0; i < n;) {
        const c = w[i], rest = w.slice(i), prev = at(i - 1), next = at(i + 1), next2 = at(i + 2);
        const starts = (s) => rest.startsWith(s);
        // endings and groups of letters said as one
        if (starts('tch')) {
            out.push('ch');
            i += 3;
            continue;
        }
        if (starts('tion') || starts('sion') || starts('cian')) {
            out.push('ch', 'uh', 'ss');
            i += 4;
            groups++;
            continue;
        }
        if (starts('ture')) {
            out.push('ch', 'er');
            i += 4;
            groups++;
            continue;
        }
        if (starts('ing') && i + 3 === n) {
            out.push('ih', 'kg');
            i += 3;
            groups++;
            continue;
        }
        if (starts('ous') && i + 3 === n) {
            out.push('uh', 'ss');
            i += 3;
            groups++;
            continue;
        }
        if (starts('igh')) {
            out.push('ah', 'ee');
            i += 3;
            groups++;
            continue;
        }
        if (starts('ough') || starts('augh')) {
            out.push('o');
            i += 4;
            groups++;
            continue;
        }
        if (starts('eau')) {
            out.push('o');
            i += 3;
            groups++;
            continue;
        }
        if (starts('ch') || starts('sh')) {
            out.push('ch');
            i += 2;
            continue;
        }
        if (starts('ph')) {
            out.push('fv');
            i += 2;
            continue;
        }
        if (starts('th')) {
            out.push('th');
            i += 2;
            continue;
        }
        if (starts('wh')) {
            out.push('oo');
            i += 2;
            continue;
        }
        if (starts('ck') || starts('ng')) {
            out.push('kg');
            i += 2;
            continue;
        }
        if (starts('qu')) {
            out.push('kg', 'oo');
            i += 2;
            continue;
        }
        if (starts('gh')) {
            if (i === 0)
                out.push('kg');
            i += 2;
            continue;
        } // silent after a vowel: night, though
        if (i === 0 && (starts('kn') || starts('gn'))) {
            out.push('ss');
            i += 2;
            continue;
        }
        if (i === 0 && starts('wr')) {
            out.push('er');
            i += 2;
            continue;
        }
        if (starts('mb') && i + 2 === n) {
            out.push('mbp');
            i += 2;
            continue;
        }
        // vowel pairs
        const pair = rest.slice(0, 2);
        const pairs = {
            ee: ['ee'], ea: ['ee'], ie: ['ee'], ei: ['ee'], ai: ['eh', 'ee'], ay: ['eh', 'ee'], oa: ['o'], oo: ['oo'], ou: ['ah', 'oo'],
            oi: ['o', 'ee'], oy: ['o', 'ee'], au: ['o'], aw: ['o'], ew: ['oo'], ue: ['oo'], ui: ['oo'], eu: ['oo'],
            ey: i + 2 === n ? ['ee'] : ['eh', 'ee'], ow: i + 2 === n ? ['o'] : ['ah', 'oo'],
        };
        if (pairs[pair] && !starts('oing')) {
            out.push(...pairs[pair]);
            i += 2;
            groups++;
            continue;
        }
        if (isVowel(c) || (c === 'y' && i > 0)) {
            // a vowel before r takes the r's colour
            if (next === 'r' && !isVowel(next2) && c !== 'y') {
                if (c === 'a')
                    out.push('ah');
                else if (c === 'o')
                    out.push('o');
                else
                    out.push('er');
                groups++;
                i += c === 'a' || c === 'o' ? 1 : 2;
                continue;
            }
            // a silent final e, and the -ed / -es endings that lose theirs
            if (c === 'e' && groups > 0 && !isVowel(prev) && (i === n - 1 || (i === n - 2 && (next === 'd' || next === 's') && !'tdsxzc'.includes(prev)))) {
                i++;
                continue;
            }
            const magicE = !isVowel(next) && next2 === 'e' && (i + 3 === n || (i + 4 === n && (at(n - 1) === 's' || at(n - 1) === 'd')));
            const openFirst = groups === 0 && next !== '' && !isVowel(next) && isVowel(next2) && next !== next2;
            const atEnd = i === n - 1;
            if (c === 'y') {
                if (atEnd)
                    out.push(...(n <= 3 ? ['ah', 'ee'] : ['ee']));
                else
                    out.push('ih');
                groups++;
            }
            else if (c === 'a')
                vowel(magicE || openFirst ? ['eh', 'ee'] : atEnd && n > 1 ? ['uh'] : [], 'ah');
            else if (c === 'e')
                vowel(magicE || openFirst || (atEnd && n <= 3) ? ['ee'] : [], 'eh');
            else if (c === 'i')
                vowel(magicE || openFirst ? ['ah', 'ee'] : atEnd ? ['ee'] : [], 'ih');
            else if (c === 'o')
                vowel(magicE || openFirst || atEnd ? ['o'] : [], 'ah');
            else
                vowel(magicE || openFirst || atEnd ? ['oo'] : [], 'uh');
            i++;
            continue;
        }
        // consonants
        if (c === next) {
            i++;
            continue;
        } // a doubled letter is said once
        if (c === 'l' && i === n - 2 && next === 'e' && !isVowel(prev)) {
            out.push('uh', 'ss');
            i += 2;
            groups++;
            continue;
        } // table, little
        if ('bpm'.includes(c))
            out.push('mbp');
        else if (c === 'f' || c === 'v')
            out.push('fv');
        else if (c === 'w')
            out.push('oo');
        else if (c === 'y')
            out.push('ee');
        else if (c === 'r')
            out.push('er');
        else if (c === 'j')
            out.push('ch');
        else if (c === 'x')
            out.push('kg', 'ss');
        else if (c === 'c')
            out.push(next !== '' && 'eiy'.includes(next) ? 'ss' : 'kg');
        else if (c === 'g')
            out.push('eiy'.includes(next) && next !== '' ? 'ch' : 'kg');
        else if ('kqh'.includes(c))
            out.push('kg');
        else if ('sztdnl'.includes(c))
            out.push('ss');
        i++;
    }
    return out;
}
const SPELLED = (text) => text.toLowerCase().replace(/[’‘]/g, "'");
/** Mixes two shapes: 0 is a, 1 is b. */
function mix(a, b, t, fields) {
    const out = { ...a };
    for (const f of fields)
        out[f] = a[f] + (b[f] - a[f]) * t;
    return out;
}
/**
 * Turns text into a list of mouth shapes with durations, for speakVisemes(). visemes is the table of shapes
 * (talk.visemes); a sound it has no shape for is left out.
 */
function textToVisemes(text, visemes, options = {}) {
    const speed = Math.max(0.2, options.speed ?? 1);
    const queue = [];
    const push = (names) => {
        const first = queue.length;
        let stressed = false;
        names.forEach((name) => {
            if (!own(visemes, name))
                return;
            const isVowelSound = VOWELS.has(name);
            const sound = { name, ms: SOUND_MS[name] ?? 80, stressed: isVowelSound && !stressed && name !== 'uh', wordEnd: false, pause: false };
            if (sound.stressed)
                stressed = true;
            queue.push(sound);
        });
        if (queue.length > first) {
            const last = queue[queue.length - 1];
            last.wordEnd = true;
            if (VOWELS.has(last.name))
                last.ms *= 1.2; // a word's last vowel is drawn out a little
        }
    };
    for (const token of SPELLED(text).match(/[a-z]+(?:'[a-z]+)*|\d|[,.;:!?\-\n]/g) ?? []) {
        const pause = own(PAUSE_MS, token);
        if (pause)
            queue.push({ name: 'rest', ms: pause, stressed: false, wordEnd: false, pause: true });
        else if (/\d/.test(token))
            push(DIGITS[Number(token)].split(' '));
        else
            push((own(WORDS, token) ?? own(WORDS, token.replace(/'/g, '')))?.split(' ') ?? wordSounds(token));
    }
    // a stressed vowel is held longer
    for (const s of queue)
        if (s.stressed)
            s.ms *= 1.25;
    const neighbourVowel = (at) => {
        for (let k = at + 1; k <= at + 2 && k < queue.length; k++) {
            if (queue[k].pause)
                break;
            if (VOWELS.has(queue[k].name))
                return visemes[queue[k].name];
        }
        for (let k = at - 1; k >= at - 2 && k >= 0; k--) {
            if (queue[k].pause)
                break;
            if (VOWELS.has(queue[k].name))
                return visemes[queue[k].name];
        }
        return undefined;
    };
    return queue.map((s, at) => {
        const ms = s.ms / speed;
        if (s.pause)
            return { viseme: s.name, ms };
        let shape = { ...visemes[s.name] };
        const neighbour = neighbourVowel(at);
        if (neighbour && !OWN.has(s.name)) {
            if (LIPS.has(s.name))
                shape = mix(shape, neighbour, 0.35, ['width', 'corner', 'lift']);
            else if (!VOWELS.has(s.name))
                shape = mix(shape, neighbour, 0.55, ['open', 'width', 'corner', 'lift', 'lip']);
        }
        // fast speech undershoots: the mouth does not get all the way to the shape
        const rate = Math.min(1, 0.6 + 0.4 * (ms / (SOUND_MS[s.name] ?? 80)));
        if (!LIPS.has(s.name)) {
            shape.open *= rate;
            shape.lip *= rate;
        }
        shape.width = 1 + (shape.width - 1) * rate;
        return { viseme: shape, ms };
    });
}

/*
 * RoboBuddy for the web: a TypeScript port of FluxGarage RoboEyes for OLED Displays V 1.1.1,
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
 * - update() schedules each frame an interval after the last one was due, not after it was drawn,
 *   so a screen whose refresh rate does not divide the interval still gets the set frame rate.
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
// For mood type switch
const DEFAULT = 0;
const SAD = 1;
const TIRED = SAD; // the original's name for SAD
const ANGRY = 2;
const HAPPY = 3;
const SMIRK = 4; // port: default eyes, one-sided smile (not in the original)
const ASLEEP = 5; // port: closed eyes looking ahead, the closed gasp mouth's dot, no blinking (not in the original)
const PEACEFUL = 6; // port: sleepy eyes looking ahead, no blinking (not in the original)
const WORRIED = 7; // port: sad eyes, mouth up on the left and down on the right (not in the original)
const FURIOUS = 8; // port: angry eyes and frown, curious, shaking and looking around (not in the original)
// For turning things on or off
const ON = true;
const OFF = false;
// For switch "predefined positions"
const N = 1; // north, top center
const NE = 2; // north-east, top right
const E = 3; // east, middle right
const SE = 4; // south-east, bottom right
const S = 5; // south, bottom center
const SW = 6; // south-west, bottom left
const W = 7; // west, middle left
const NW = 8; // north-west, top left
// Port: the mood constants name these entries of FaceConfig.moods
const MOOD_NAMES = ['default', 'sad', 'angry', 'happy', 'smirk', 'asleep', 'peaceful', 'worried', 'furious'];
// Port: the position constants name these entries of FaceConfig.looks
const POSITION_LOOKS = ['center', 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
// Port: each toggle and the field that holds it (shake is the original's horizontal flicker)
const TOGGLES = { autoblink: 'autoblinker', curious: 'curious', sweat: 'sweat', shake: 'hFlicker', talk: 'mouthTalk', laugh: 'laugh', cry: 'cry', sigh: 'sigh' };
/** Draws onto a <canvas>. Sharp at any size and device pixel ratio. */
class CanvasDisplay {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.width = 128;
        this.height = 64;
        // The screen drawn into the canvas: its scale and offset, measured again only when the canvas changes size
        this.transform = [1, 0, 0];
        this.measuredRatio = 0;
        this.measured = false;
        this.observed = false;
        this.background = 'transparent';
        this.main = '#ffffff';
        const ctx = canvas.getContext('2d');
        if (!ctx)
            throw new Error('RoboBuddy: canvas 2D context is not available');
        this.ctx = ctx;
        if (options.background)
            this.background = options.background;
        if (options.main)
            this.main = options.main;
        if (typeof ResizeObserver === 'function') {
            new ResizeObserver(() => { this.measured = false; }).observe(canvas);
            this.observed = true;
        }
    }
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.measured = false;
        this.resize();
    }
    /** Matches the canvas's pixel size to how big it is on screen, so CSS sizing just works. The screen keeps its
     *  shape, centred, when the canvas has another. */
    resize() {
        const ratio = (typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);
        if (this.measured && this.observed && ratio === this.measuredRatio)
            return;
        const cssWidth = this.canvas.clientWidth || this.width;
        const cssHeight = this.canvas.clientHeight || this.height;
        const w = Math.max(1, Math.round(cssWidth * ratio));
        const h = Math.max(1, Math.round(cssHeight * ratio));
        if (this.canvas.width !== w || this.canvas.height !== h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
        const scale = Math.min(w / this.width, h / this.height);
        this.transform = [scale, (w - this.width * scale) / 2, (h - this.height * scale) / 2];
        this.measuredRatio = ratio;
        this.measured = true;
    }
    clearDisplay() {
        this.resize();
        const ctx = this.ctx;
        // Clear the whole canvas, margins included, then draw in screen pixels
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.background !== 'transparent') {
            ctx.fillStyle = this.background;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        const [scale, x, y] = this.transform;
        ctx.setTransform(scale, 0, 0, scale, x, y);
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
class RoboBuddy {
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
        this.baseMood = 'default'; // the last mood set to stay: what a temporary mood goes back to
        this.tempMoodEnd = 0; // when a temporary mood ends (millis()), 0 if the mood in use is not temporary
        this.transitionMs = defaultConfig.transition.durationMs; // how long a change of mood eases in slowly
        this.transitionSpeed = defaultConfig.transition.speed; // how much of the remaining way the mouth, lids and eye size go each frame meanwhile
        this.transitionBlink = defaultConfig.transition.blink; // blink as the mood changes
        this.transitionEnd = 0; // when the mood now easing in is done (millis())
        this.introQueue = []; // the steps of the mood's intro still to come
        this.introEnd = 0; // when it is over (millis())
        this.eyeState = 'open';
        this.mouthState = 'softSmile';
        this.look = defaultConfig.look;
        this.toggleDefaults = { ...defaultConfig.toggles }; // each toggle when a mood says nothing about it
        this.curious = defaultConfig.toggles.curious; // if true, draw the outer eye larger when looking left or right
        this.curiousGrowth = defaultConfig.curious.growth; // port: how much taller the outer eye gets
        this.curiousEdge = defaultConfig.curious.edge; // port: how close to the screen edge an eye must be to grow
        this.cyclops = defaultConfig.modes.cyclops; // if true, draw only one eye
        this.reducedMotion = defaultConfig.modes.reducedMotion; // port: keep each pose, stop what keeps moving
        this.eyeScale = 1; // port: how big the eyes are drawn, easing to the mood's scale
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
        this.faceOffsetY = defaultConfig.eyes.offsetY; // port: how far the centred face is moved down from the screen's middle
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
        // Port: a follow look - eyes following the point lookAt() gave
        this.following = false;
        this.followFullX = defaultConfig.follow.fullX; // how far toward the edge the point must be for the eyes to turn fully across (the demo reads it)
        this.followFullY = defaultConfig.follow.fullY; // and down
        this.followX = 0.5; // where the eyes look while following, as fractions of how far they can move
        this.followY = 0.5;
        // Port: a path look - eyes going to each of its points in turn
        this.pathing = false;
        this.pathIndex = -1; // the point the eyes are at or heading for (-1: none yet, so the first comes straight away)
        this.pathTimer = 0; // when the next point is due
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
        // Port: a viseme (a mouth shape of speech) overrides the random talk; speakVisemes() plays a list of them in turn
        this.visemes = structuredClone(defaultConfig.talk.visemes);
        this.viseme = null; // a name from the table, or a shape of its own
        this.visemeQueue = [];
        this.visemeEnd = 0; // when the current viseme of the queue is over
        // Port: animation - nod head: eyes and mouth swinging down and up
        this.nod = false;
        this.nodAmplitude = defaultConfig.nod.amplitude; // how far the face swings down and up
        this.nodSpeed = defaultConfig.nod.speed;
        // Port: the laugh toggle - the face bounces with each "ha": the eyes lift and squint, the mouth opens and bounces with them
        this.laugh = defaultConfig.toggles.laugh;
        this.laughLevel = 0; // 0 to 1: how far into the laugh the face is, easing in and out as the toggle changes
        this.laughPhase = 0; // where the bounce is, in radians
        this.laughLast = 0; // when the laugh was last stepped, in milliseconds
        this.laughFrequency = defaultConfig.laugh.frequency; // bounces ("ha"s) per second
        this.laughAmplitude = defaultConfig.laugh.amplitude; // how far the eyes lift, in pixels
        this.laughMouthAmplitude = defaultConfig.laugh.mouthAmplitude; // how far the mouth lifts, in pixels
        this.laughSquint = defaultConfig.laugh.squint; // how far the bottom lids come up (the happy eyes' fraction of the eye's height)
        this.laughMouthOpen = defaultConfig.laugh.mouthOpen; // how far the mouth opens at the top of a bounce, in pixels
        this.laughY = 0; // the bounce now, added to the eyes
        this.laughMouthY = 0; // and to the mouth
        this.laughOpenAmount = 0; // 0 to 1: how open the mouth is for the laugh right now
        // Port: the laugh, shake and nod swings, drawn on top of the eye and mouth positions
        this.shakeX = 0;
        this.shakeXNext = 0;
        this.shakeY = 0;
        this.shakeYNext = 0;
        this.mouthShakeY = 0;
        this.mouthShakeYNext = 0;
        // Port: the cry toggle - teardrops run down from the outer corner of each eye
        this.cry = defaultConfig.toggles.cry;
        this.cryDrops = defaultConfig.cry.drops; // drops running at once from each eye
        this.crySpeed = defaultConfig.cry.speed; // how far a drop falls each frame, in pixels
        this.cryFall = defaultConfig.cry.fall; // how far a drop runs before it is gone, in pixels
        this.crySize = defaultConfig.cry.size; // a drop's width, in pixels
        this.cryRise = defaultConfig.cry.rise; // how far up inside the eye a drop starts, so it runs from the corner, in pixels
        this.cryFrequency = defaultConfig.cry.frequency; // sobs (bounces) per second
        this.cryAmplitude = defaultConfig.cry.amplitude; // how far the eyes lift each sob, in pixels
        this.cryMouthAmplitude = defaultConfig.cry.mouthAmplitude; // how far the mouth lifts each sob, in pixels
        this.cryLevel = 0; // 0 to 1: how far into the sobbing the face is, easing in and out as the toggle changes
        this.cryPhase = 0; // where the sob is, in radians
        this.cryLast = 0; // when the sobbing was last stepped, in milliseconds
        this.cryY = 0; // the sob now, added to the eyes
        this.cryMouthY = 0; // and to the mouth
        // Port: the sigh toggle - a slow breath out: the eyes and mouth sink and the mouth opens a little, then they rise again
        this.sigh = defaultConfig.toggles.sigh;
        this.sighFrequency = defaultConfig.sigh.frequency; // sighs per second
        this.sighAmplitude = defaultConfig.sigh.amplitude; // how far the eyes sink, in pixels
        this.sighMouthAmplitude = defaultConfig.sigh.mouthAmplitude; // how far the mouth sinks, in pixels
        this.sighMouthOpen = defaultConfig.sigh.mouthOpen; // how far the mouth opens at the bottom of a sigh, in pixels
        this.sighMouthNarrow = defaultConfig.sigh.mouthNarrow; // how much of its length the mouth loses at the bottom of a sigh, 0 to 1
        this.sighLevel = 0; // 0 to 1: how far into sighing the face is, easing in and out as the toggle changes
        this.sighPhase = 0; // where the breath is, in radians
        this.sighY = 0; // the sink now, added to the eyes
        this.sighMouthY = 0; // and to the mouth
        this.sighOpenAmount = 0; // 0 to 1: how open the mouth is for the sigh right now
        this.tears = [[], []]; // each eye's drops: how far they have fallen and how far they wander from the corner
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
                offsetY: this.faceOffsetY,
            },
            mouth: {
                gap: this.mouthGapNext, thickness: this.mouthThickness, radius: this.mouthRadius, curl: this.mouthCurl,
                width: this.mouthWidth, moodWidth: this.mouthMoodWidth,
            },
            blink: { interval: this.blinkInterval, variation: this.blinkIntervalVariation, speed: this.blinkSpeed },
            transition: { durationMs: this.transitionMs, speed: this.transitionSpeed, blink: this.transitionBlink },
            wander: { interval: this.idleInterval, variation: this.idleIntervalVariation },
            curious: { growth: this.curiousGrowth, edge: this.curiousEdge },
            follow: { fullX: this.followFullX, fullY: this.followFullY },
            laugh: { frequency: this.laughFrequency, amplitude: this.laughAmplitude, mouthAmplitude: this.laughMouthAmplitude, squint: this.laughSquint, mouthOpen: this.laughMouthOpen },
            sigh: { frequency: this.sighFrequency, amplitude: this.sighAmplitude, mouthAmplitude: this.sighMouthAmplitude, mouthOpen: this.sighMouthOpen, mouthNarrow: this.sighMouthNarrow },
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
        this.faceOffsetY = c.eyes.offsetY;
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
        this.transitionMs = Math.max(0, c.transition.durationMs);
        this.transitionSpeed = Math.max(0.05, Math.min(0.5, c.transition.speed)); // never faster than the usual half
        this.transitionBlink = c.transition.blink;
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
        this.sighFrequency = c.sigh.frequency;
        this.sighAmplitude = c.sigh.amplitude;
        this.sighMouthAmplitude = c.sigh.mouthAmplitude;
        this.sighMouthOpen = c.sigh.mouthOpen;
        this.sighMouthNarrow = Math.max(0, Math.min(1, c.sigh.mouthNarrow));
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
                this.looks[name].wander = typeof look.wander === 'object' ? withoutNulls(look.wander) : true;
            if (look.follow)
                this.looks[name].follow = true;
            if (look.shakeHead)
                this.looks[name].shakeHead = typeof look.shakeHead === 'object' ? withoutNulls(look.shakeHead) : true;
            if (look.nod)
                this.looks[name].nod = typeof look.nod === 'object' ? withoutNulls(look.nod) : true;
            // Each point gets what it leaves out from the middle, held for 600 ms
            if (look.path?.length)
                this.looks[name].path = look.path.map((p) => ({ x: p?.x ?? 0.5, y: p?.y ?? 0.5, holdMs: Math.max(0, p?.holdMs ?? 600) }));
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
    // Startup RoboBuddy with defined screen-width, screen-height and max. frames per second
    begin(width, height, frameRate) {
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
        const now = millis();
        if (now - this.fpsTimer >= this.frameInterval) {
            this.drawEyes();
            // Port: the next frame is due an interval after this one was due, unless drawing has fallen far behind
            this.fpsTimer = now - this.fpsTimer >= this.frameInterval * 2 ? now : this.fpsTimer + this.frameInterval;
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
    // (their defaults if it leaves them out) and its look. Whatever a mood leaves out comes from the default mood, then
    // from open, softSmile, wander and the toggle defaults, so nothing the previous mood picked carries over. { for: ms }
    // makes the mood temporary: after that long the face goes back to the last mood set without it (a temporary mood
    // set during another goes back to that same one). A change of mood eases in over transition.durationMs, more slowly
    // than the usual half a frame, and can blink on the way (see FaceConfig.transition).
    setMood(mood, options = {}) {
        const name = typeof mood === 'number' ? MOOD_NAMES[mood] : mood;
        if (!entry(this.moods, name))
            warnMissing('mood', name);
        const next = entry(this.moods, name) ? name : 'default';
        const changed = next !== this.mood, eyesWereHeld = this.eyeLheld || this.eyeRheld;
        if (changed)
            this.transitionEnd = millis() + this.transitionMs;
        if (options.for && options.for > 0) {
            if (!this.tempMoodEnd)
                this.baseMood = this.mood;
            this.tempMoodEnd = millis() + options.for;
        }
        else {
            this.baseMood = next;
            this.tempMoodEnd = 0;
        }
        this.mood = next;
        const m = this.moods[this.mood], base = this.moods.default;
        for (const [key, field] of Object.entries(TOGGLES)) {
            this[field] = m[key] ?? base[key] ?? this.toggleDefaults[key];
        }
        this.applyMoodStates();
        this.setLook(m.look ?? base.look ?? 'wander');
        // Port: a mood coming in plays its intro first (drawEyes() steps through it)
        if (changed) {
            this.introQueue = this.motionReduced() ? [] : (m.intro ?? []).slice();
            this.introStep = undefined;
            this.introEnd = 0;
        }
        // Eyes that open or close with the mood do that on their own, so only open ones blink
        if (changed && this.transitionBlink && this.transitionMs > 0 && !eyesWereHeld && !this.eyeLheld && !this.eyeRheld && !this.motionReduced())
            this.blink();
    }
    // The mood's eye and mouth states, or an intro step's instead. The mood's override changes the state it ends up
    // with, but the default mood's does not pass on to another mood's.
    applyMoodStates(step) {
        const m = this.moods[this.mood], base = this.moods.default;
        if (step?.eyes)
            this.applyEyes(step.eyes);
        else
            this.applyEyes(m.eyes ?? base.eyes ?? 'open', m.override?.eyes ?? undefined);
        if (step?.mouth)
            this.applyMouth(step.mouth);
        else
            this.applyMouth(m.mouth ?? base.mouth ?? 'softSmile', m.override?.mouth ?? undefined);
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
        const look = entry(this.looks, name);
        if (!look) {
            warnMissing('look', name);
            return;
        }
        this.look = name;
        // Port: a path starts again from its first point
        this.pathing = !look.wander && !look.follow && !!look.path?.length;
        this.pathIndex = -1;
        this.pathTimer = 0;
        if (look.wander) {
            if (!this.idle)
                this.idleAnimationTimer = 0; // move on straight away
            this.idle = true;
            this.following = false;
            return;
        }
        this.idle = false;
        if (this.pathing) {
            this.following = false;
            return; // drawEyes() places the eyes
        }
        this.following = !!look.follow;
        if (look.follow) {
            this.followX = look.x;
            this.followY = look.y;
            return; // drawEyes() places the eyes
        }
        const fraction = (v) => Math.max(0, Math.min(1, v));
        this.eyeLxNext = this.int(this.getScreenConstraint_X() * fraction(look.x));
        this.eyeLyNext = this.eyeYAt(look.y);
    }
    /** Port: where a follow look points, as fractions of how far the eyes can move (x: 0 left, 1 right; y: 0 up, 1 down).
     *  Call it as often as the target moves, e.g. from a mousemove handler. */
    lookAt(x, y) {
        this.followX = Math.max(0, Math.min(1, x));
        this.followY = Math.max(0, Math.min(1, y));
    }
    /** Port: the eye state in use, with the mood's changes to it. */
    currentEyes() {
        return eyesWith(entry(this.eyeStates, this.eyeState) ?? OPEN_EYES, this.eyesOverride);
    }
    /** Port: the mouth state in use, with the mood's changes to it. */
    currentMouth() {
        return { ...(entry(this.mouthStates, this.mouthState) ?? { left: 0, right: 0 }), ...withoutNulls(this.mouthOverride) };
    }
    // The eyelids follow the eye state every frame; closing and opening happen here
    applyEyes(name, override) {
        if (!entry(this.eyeStates, name))
            warnMissing('eye state', name);
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
        if (!entry(this.mouthStates, name))
            warnMissing('mouth state', name);
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
    // Port: the sigh toggle - sighs until turned off. The next mood sets it again.
    setSigh(sighBit) {
        this.sigh = sighBit;
    }
    // Port: the cry toggle - teardrops run down from under the eyes. The next mood sets it again.
    setCry(cryBit) {
        this.cry = cryBit;
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
    // Port: hold the mouth in a viseme (a key of talk.visemes), or null to go back to the toggle. It talks even with the toggle off.
    setViseme(name) {
        this.visemeQueue = [];
        this.visemeEnd = 0;
        this.viseme = name !== null && entry(this.visemes, name) ? name : null;
    }
    // Port: say some text: its spelling is turned into mouth shapes (see speech.ts) and played. Returns how long it takes in ms.
    speak(text, options) {
        const sequence = textToVisemes(text, this.visemes, options);
        this.speakVisemes(sequence);
        return sequence.reduce((total, step) => total + step.ms, 0);
    }
    // Port: play visemes one after another, each for its ms, then go back to the toggle. A viseme is a name from the table
    // (an unknown one is the rest shape) or a shape of its own.
    speakVisemes(sequence) {
        this.visemeQueue = sequence.slice();
        this.visemeEnd = 0;
        if (!this.visemeQueue.length)
            this.viseme = null;
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
    // Port: the y of the eyes (their top) for a look's y, 0 up to 1 down. The middle, 0.5, centres the eyes and the mouth
    // together on the screen (moved by faceOffsetY); 0 puts the eyes at the top of the screen, and 1 as low as the mouth
    // can go without leaving it. Heights are the default ones, because height varies when blinking and in curious mode.
    eyeYAt(fraction) {
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
        if (this.reducedMotion !== 'auto')
            return this.reducedMotion;
        if (typeof matchMedia !== 'function')
            return false;
        this.motionQuery ?? (this.motionQuery = matchMedia('(prefers-reduced-motion: reduce)')); // asked once, but read every frame
        return this.motionQuery.matches;
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
    // Port: the laugh toggle - laughs until turned off. The next mood sets it again.
    setLaugh(laughBit) {
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
        // Port: a temporary mood ends, back to the one underneath
        if (this.tempMoodEnd && millis() >= this.tempMoodEnd) {
            this.setMood(this.baseMood);
            this.introQueue = []; // the mood underneath has already played its intro
        }
        // Port: the mood sets how big the eyes are drawn, and how often they blink
        const mood = this.moods[this.mood] ?? {}, baseMood = this.moods.default ?? {}; // what a mood leaves out is the default mood's
        // (halfway each frame, but never in whole numbers: it is a multiple, so "pixel" precision rounds the sizes instead)
        // Port: with reduced motion, each pose holds and nothing keeps moving
        const still = this.motionReduced();
        // Port: the mood's intro, a step at a time, then the mood's own states (reduced motion ends it at once)
        if ((this.introStep || this.introQueue.length) && (still || millis() >= this.introEnd)) {
            if (still)
                this.introQueue = [];
            this.introStep = this.introQueue.shift();
            this.applyMoodStates(this.introStep);
            this.introEnd = this.introStep ? millis() + Math.max(0, this.introStep.ms) : 0;
            if (!this.introStep && !still)
                this.transitionEnd = millis() + this.transitionMs; // ease from the last step into the mood's own states
        }
        const scale = Math.max(0.1, this.introStep?.scale ?? mood.scale ?? baseMood.scale ?? 1);
        // Port: a mood that has just changed eases in more slowly than the usual half of the way a frame; an intro
        // step's scale doesn't, so a pop is quick; the steps of an intro all ease at that speed, however long it runs
        const moodSpeed = !still && !this.introStep?.scale && (this.introStep || millis() < this.transitionEnd) ? this.transitionSpeed : undefined;
        this.eyeScale = Math.abs(scale - this.eyeScale) < 0.005 ? scale : this.eyeScale + (scale - this.eyeScale) * (moodSpeed ?? 0.5);
        // Port: mouth length, height and corners ease the same way
        const now = millis();
        if (this.visemeQueue.length && now >= this.visemeEnd) {
            const next = this.visemeQueue.shift();
            this.viseme = typeof next.viseme === 'string' && !entry(this.visemes, next.viseme) ? 'rest' : next.viseme;
            this.visemeEnd = now + Math.max(0, next.ms);
        }
        else if (!this.visemeQueue.length && this.viseme && this.visemeEnd && now >= this.visemeEnd) {
            this.viseme = null; // the last one of the list is over
            this.visemeEnd = 0;
        }
        const shape = typeof this.viseme === 'string' ? entry(this.visemes, this.viseme) : this.viseme ?? undefined;
        const talking = this.mouthTalk || !!shape;
        this.mouthWidthCurrent = this.ease(this.mouthWidthCurrent, this.mouthWidthNext * (shape?.width ?? 1) * (1 - this.sighMouthNarrow * this.sighOpenAmount), moodSpeed); // port: a sigh shortens the mouth as it opens
        this.mouthGapCurrent = this.ease(this.mouthGapCurrent, this.mouthGapNext);
        // Port: a talking mouth picks a new opening each syllable, sometimes shut for a gap between words. The upper lip
        // lifts with the opening, and each corner follows it only loosely, on its own timing, and sways a little.
        if (this.mouthTalk && !shape && still) {
            this.mouthTalkLevel = 0; // the talking mouth rests shut
            this.mouthTalkSway = [0, 0];
        }
        else if (this.mouthTalk && !shape) {
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
        // A viseme sets the whole shape; the random talk sets the opening and lets the corners follow it loosely
        const talk = shape ? shape.open : this.mouthTalk ? this.mouthTalkLevel : 1;
        const [cornerL, cornerR] = shape ? [shape.corner, shape.corner] : this.mouthTalk ? this.mouthTalkCorner : [1, 1];
        const [swayL, swayR] = shape ? [shape.lift, shape.lift] : this.mouthTalk ? this.mouthTalkSway.map(sway => sway * talk) : [0, 0];
        this.mouthLeftCurrent = this.ease(this.mouthLeftCurrent, this.mouthLeftNext + swayL, moodSpeed);
        this.mouthRightCurrent = this.ease(this.mouthRightCurrent, this.mouthRightNext + swayR, moodSpeed);
        this.mouthLipCurrent = this.ease(this.mouthLipCurrent, shape ? shape.lip * this.talkLipLift : this.mouthTalk ? talk * this.talkLipLift : 0);
        // A mouth state with no opening of its own opens by talkOpen in the middle and less at the corners (as wideSmile does)
        const bare = talking && !(this.mouthOpenNext > 0 || this.mouthLeftOpenNext > 0 || this.mouthRightOpenNext > 0);
        const [open, openL, openR] = bare ? [this.talkOpen, this.talkOpen * 0.4, this.talkOpen * 0.4] : [this.mouthOpenNext, this.mouthLeftOpenNext, this.mouthRightOpenNext];
        this.mouthOpenCurrent = this.ease(this.mouthOpenCurrent, open * talk, moodSpeed);
        this.mouthLeftOpenCurrent = this.ease(this.mouthLeftOpenCurrent, openL * talk * cornerL, moodSpeed);
        this.mouthRightOpenCurrent = this.ease(this.mouthRightOpenCurrent, openR * talk * cornerR, moodSpeed);
        // Port: a laugh opens the mouth at least as far as the laugh needs, and lifts its corners, over whatever it was doing
        if (this.laughLevel > 0) {
            const laughShape = this.mouthStates.laugh, wide = this.laughMouthOpen * this.laughOpenAmount;
            this.mouthOpenCurrent = Math.max(this.mouthOpenCurrent, this.int(wide));
            this.mouthLeftOpenCurrent = Math.max(this.mouthLeftOpenCurrent, this.int(wide * 0.6));
            this.mouthRightOpenCurrent = Math.max(this.mouthRightOpenCurrent, this.int(wide * 0.6));
            this.mouthLeftCurrent = Math.max(this.mouthLeftCurrent, this.int((laughShape?.left ?? 0) * this.laughLevel));
            this.mouthRightCurrent = Math.max(this.mouthRightCurrent, this.int((laughShape?.right ?? 0) * this.laughLevel));
        }
        // Port: a sigh opens the mouth a little as the breath goes out, over whatever it was doing
        if (this.sighLevel > 0) {
            const wide = this.sighMouthOpen * this.sighOpenAmount;
            this.mouthOpenCurrent = Math.max(this.mouthOpenCurrent, this.int(wide));
            this.mouthLeftOpenCurrent = Math.max(this.mouthLeftOpenCurrent, this.int(wide * 0.5));
            this.mouthRightOpenCurrent = Math.max(this.mouthRightOpenCurrent, this.int(wide * 0.5));
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
        // Port: a look can give its swing its own amplitude and speed, instead of the shakeHead and nod settings'
        const swing = (own) => (typeof own === 'object' && own ? own : {});
        const ownShake = swing(this.looks[this.look]?.shakeHead), ownNod = swing(this.looks[this.look]?.nod);
        const speed = (own, face) => own !== undefined ? Math.max(0.05, Math.min(0.8, own)) : face;
        const shakeAmplitude = ownShake.amplitude ?? this.shakeHeadAmplitude, nodAmplitude = ownNod.amplitude ?? this.nodAmplitude;
        const nodSpeed = speed(ownNod.speed, this.nodSpeed);
        if (shaking !== this.shakeHead) {
            this.shakeHead = shaking;
            this.shakeXNext = shaking ? -shakeAmplitude : 0;
        }
        if (nodding !== this.nod) {
            this.nod = nodding;
            this.shakeYNext = nodding ? nodAmplitude : 0;
            this.mouthShakeYNext = this.shakeYNext;
        }
        // Laughing - the toggle eases the laugh in and out; each bounce lifts the eyes and mouth and opens the mouth for a
        // "ha". Port: it keeps its time from the clock, so the pace doesn't depend on the frame rate. With reduced motion
        // the face keeps the laughing pose, squinting with the mouth open, and doesn't bounce.
        const laughNow = millis(), dt = this.laughLast ? Math.min(100, laughNow - this.laughLast) : 0;
        this.laughLast = laughNow;
        this.laughLevel = Math.max(0, Math.min(1, this.laughLevel + (this.laugh ? dt / 150 : -dt / 300)));
        if (this.laughLevel === 0)
            this.laughPhase = 0; // the next laugh starts from the bottom of a bounce
        else if (!still)
            this.laughPhase += 2 * Math.PI * this.laughFrequency * dt / 1000;
        const lift = still ? 0 : 0.5 - 0.5 * Math.cos(this.laughPhase); // 0 to 1: 0 at rest, 1 at the top of a bounce
        this.laughY = this.int(-lift * this.laughAmplitude * this.laughLevel);
        this.laughMouthY = this.int(-lift * this.laughMouthAmplitude * this.laughLevel);
        // Port: crying sobs the same way, a gentler bounce of the eyes and mouth
        this.cryLevel = Math.max(0, Math.min(1, this.cryLevel + (this.cry ? dt / 150 : -dt / 300)));
        if (this.cryLevel === 0)
            this.cryPhase = 0;
        else if (!still)
            this.cryPhase += 2 * Math.PI * this.cryFrequency * dt / 1000;
        const sob = still ? 0 : 0.5 - 0.5 * Math.cos(this.cryPhase);
        this.cryY = this.int(-sob * this.cryAmplitude * this.cryLevel);
        this.cryMouthY = this.int(-sob * this.cryMouthAmplitude * this.cryLevel);
        // Port: a sigh is one slow sink and rise of the eyes and mouth, with the mouth opening at the bottom
        this.sighLevel = Math.max(0, Math.min(1, this.sighLevel + (this.sigh ? dt / 300 : -dt / 300)));
        if (this.sighLevel === 0)
            this.sighPhase = 0;
        else if (!still)
            this.sighPhase += 2 * Math.PI * this.sighFrequency * dt / 1000;
        const breath = still ? 0 : 0.5 - 0.5 * Math.cos(this.sighPhase);
        this.sighY = this.int(breath * this.sighAmplitude * this.sighLevel);
        this.sighMouthY = this.int(breath * this.sighMouthAmplitude * this.sighLevel);
        this.sighOpenAmount = this.sighLevel * breath;
        this.laughOpenAmount = this.laughLevel * (0.35 + 0.65 * (still ? 1 : lift)); // never quite shut, so it reads as laughing
        // Port: each swing eases like a blink, and turns back once it arrives
        const ownShakeSpeed = ownShake.speed;
        this.shakeX = this.ease(this.shakeX, this.shakeXNext, speed(ownShakeSpeed, this.shakeHeadSpeed));
        // Port: turning back takes the amplitude as it is now, so changing it applies to a swing already going
        // A look with its own speed turns back a little short of the end, so the easing doesn't make it linger there
        const turnAt = ownShakeSpeed !== undefined ? shakeAmplitude * 0.15 : 0;
        if (this.shakeHead && Math.abs(this.shakeXNext - this.shakeX) <= turnAt)
            this.shakeXNext = this.shakeXNext > 0 ? -shakeAmplitude : shakeAmplitude;
        this.shakeY = this.ease(this.shakeY, this.shakeYNext, nodSpeed);
        this.mouthShakeY = this.ease(this.mouthShakeY, this.mouthShakeYNext, nodSpeed);
        // The mouth turns back with the eyes, so it moves at the same pace
        if (this.nod && this.shakeY === this.shakeYNext) {
            this.shakeYNext = this.shakeYNext > 0 ? -nodAmplitude : nodAmplitude;
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
        // Port: a path look goes to each point in turn once it has held the last for its time, and starts again after
        // the end; it waits while the eyes are closed, and with reduced motion rests at the look's own x and y
        const pathLook = this.pathing ? this.looks[this.look] : undefined;
        const goTo = (point) => {
            this.eyeLxNext = this.int(this.getScreenConstraint_X() * Math.max(0, Math.min(1, point.x)));
            this.eyeLyNext = this.eyeYAt(point.y);
        };
        if (pathLook?.path?.length && still) {
            goTo(pathLook);
            this.pathTimer = 0; // on to the next point as soon as motion is back
        }
        else if (pathLook?.path?.length && !this.eyesClosed && millis() >= this.pathTimer) {
            this.pathIndex = (this.pathIndex + 1) % pathLook.path.length;
            const point = pathLook.path[this.pathIndex];
            goTo(point);
            this.pathTimer = millis() + point.holdMs;
        }
        // Adding offsets for horizontal flickering/shivering
        if (this.hFlicker && !still) {
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
        if (this.vFlicker && !still) {
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
            const h = (side === 'right' && !this.cyclops ? this.eyeRheightCurrent : this.eyeLheightCurrent) * this.eyeScale;
            this.lids[side] = {
                top: this.easeLid(this.lids[side].top, { ...eyes.top, ...own?.top }, h, moodSpeed),
                bottom: this.easeLid(this.lids[side].bottom, this.laughed({ ...eyes.bottom, ...own?.bottom }), h, moodSpeed),
            };
        }
        // The original draws each eye, then paints the eyelids over it in the background colour.
        // Here the eyelid shapes are cut out of the eye instead.
        // Port: the swings move the drawn eyes only; drawMouth() adds the mouth's own share.
        // Port: eyes of different heights share their bottom edge, so the shorter one sits lower
        const tallest = Math.max(this.eyeLheightDefault, this.cyclops ? 0 : this.eyeRheightDefault);
        // Port: and the mood's scale grows each eye from its centre
        const s = this.eyeScale;
        const grown = (x, y, w, h) => [int(x - w * (s - 1) / 2), int(y - h * (s - 1) / 2), int(w * s), int(h * s)];
        const [lx, ly, lw, lh] = grown(this.eyeLx + this.shakeX, this.eyeLy + this.shakeY + this.laughY + this.cryY + this.sighY + (tallest - this.eyeLheightDefault), this.eyeLwidthCurrent, this.eyeLheightCurrent);
        const [rx, ry, rw, rh] = grown(this.eyeRx + this.shakeX, this.eyeRy + this.shakeY + this.laughY + this.cryY + this.sighY + (tallest - this.eyeRheightDefault), this.eyeRwidthCurrent, this.eyeRheightCurrent);
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
        d.fillRoundRect(lx, ly, lw, lh, int(this.eyeLborderRadiusCurrent * s), leftCuts); // left eye
        if (!this.cyclops) {
            d.fillRoundRect(rx, ry, rw, rh, int(this.eyeRborderRadiusCurrent * s), rightCuts); // right eye
        }
        // Port: the mouth
        this.drawMouth();
        // Add sweat drops
        if (this.sweat && !still) {
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
        // Port: tears run down from the outer corner of each eye, staggered so they trickle one after another
        if (this.cry && !still && !this.eyesClosed) {
            // [left edge, width, bottom, outer side]: each eye's outer corner faces its own side of the screen
            const corners = this.cyclops
                ? [[lx, lw, ly + lh, -1], [lx, lw, ly + lh, 1]]
                : [[lx, lw, ly + lh, -1], [rx, rw, ry + rh, 1]];
            corners.forEach(([x, w, bottom, side], i) => {
                const drops = this.tears[i];
                while (drops.length < this.cryDrops)
                    drops.push({ y: -this.cryFall * drops.length / this.cryDrops, dx: Math.random() });
                drops.length = this.cryDrops;
                for (const drop of drops) {
                    drop.y += this.crySpeed;
                    if (drop.y > this.cryFall) {
                        drop.y = 0;
                        drop.dx = Math.random();
                    }
                    if (drop.y < 0)
                        continue;
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
    laughed(lid) {
        const level = this.laughLevel;
        if (level <= 0 || this.laughSquint <= 0)
            return lid;
        return { ...lid, height: Math.max(lid.height, this.laughSquint * level), curve: Math.max(lid.curve, 0.2 * level) };
    }
    // speed: a slower ease while a mood is changing (the usual half-way each frame if left out)
    easeLid(current, shape, h, speed) {
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
        if (speed !== undefined) {
            return { inner: this.ease(current.inner, next.inner, speed), outer: this.ease(current.outer, next.outer, speed), bow: this.ease(current.bow, next.bow, speed) };
        }
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
     * since the eyes close around their centre; it follows a head shake and a nod, and lifts and opens
     * with each bounce when laughing). Its middle
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
        const y = eyeCentre + this.eyeLheightDefault / 2 + (tallest - this.eyeLheightDefault) + this.mouthGapCurrent + this.mouthThickness / 2 + this.mouthShakeY + this.laughMouthY + this.cryMouthY + this.sighMouthY;
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
/** record[name] if the name is the record's own, so a name like "constructor" never finds a built-in property. */
function entry(record, name) {
    return Object.prototype.hasOwnProperty.call(record, name) ? record[name] : undefined;
}
/** Tells the developer about a name that is not in the face's config, which the face otherwise skips quietly. */
function warnMissing(kind, name) {
    if (typeof console !== 'undefined')
        console.warn(`RoboBuddy: no ${kind} called "${name}"`);
}
/** obj without the keys whose value is null or undefined, which mean "left out". */
function withoutNulls(obj) {
    return Object.fromEntries(Object.entries(obj ?? {}).filter(([, value]) => value !== null && value !== undefined));
}

window.RoboBuddyLib = { defaultConfig, mergeConfig, wordSounds, textToVisemes, DEFAULT, SAD, TIRED, ANGRY, HAPPY, SMIRK, ASLEEP, PEACEFUL, WORRIED, FURIOUS, ON, OFF, N, NE, E, SE, S, SW, W, NW, CanvasDisplay, RoboBuddy };
})();

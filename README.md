# RoboEyes for the web (with a mouth)

A TypeScript port of [FluxGarage RoboEyes](https://github.com/FluxGarage/RoboEyes) v1.1.1 by Dennis Hoelscher,
drawing on a `<canvas>`, plus a mouth. GPL-3.0-or-later, like the original (see `LICENSE`).

**[Live demo](https://x-tech-laboratories.github.io/RoboEyes/demo.html)** · [Docs](https://x-tech-laboratories.github.io/RoboEyes/)

## Use

```js
import {
    RoboEyes, DEFAULT, HAPPY, SAD, ANGRY, SMIRK, ASLEEP, HAPPY_ASLEEP, WORRIED, FURIOUS, N, E, ON, OFF,
} from './dist/roboeyes.js';

const eyes = new RoboEyes(document.querySelector('canvas'));
eyes.setDisplayColors('transparent', '#8fd6ff'); // background, main colour (any CSS colour)
eyes.begin(128, 64, 50);                         // screen width, height, max frame rate
eyes.setAutoblinker(ON, 3, 2);
eyes.start();                                    // runs update() every animation frame

eyes.setMood(HAPPY);       // eyelids and mouth ease into the new mood
eyes.setEyes('angry');     // or pick face states yourself: angry eyes with the happy smile
eyes.setPosition(E);       // look right (the same as setLook('E'))
eyes.anim_laugh();         // one-shot animations: anim_laugh, anim_shakeHead, anim_nod
```

No bundler? Load `dist/roboeyes.global.js` with a script tag and use `window.RoboEyesLib`. `demo.html` does this.

Every method and setting of the original is here under the same name (`setWidth`, `setHeight`, `setBorderradius`,
`setSpacebetween`, `setMood`, `setPosition`, `setAutoblinker`, `setIdleMode`, `setCuriosity`, `setCyclops`,
`setHFlicker`, `setVFlicker`, `setSweat`, `open`, `close`, `blink`, `anim_confused`, `anim_laugh`).
`anim_confused()` is also called `anim_shakeHead()` here, and `anim_nod()` is new. The C++
overloads become optional arguments, e.g. `blink()` or `blink(false, true)` for a wink.

## Faces, moods and face states

A face is built in layers:

1. **Face states**, the building blocks. Each can be set on its own:
   - a face state for the whole face, `setFace(name)`: `still`, or `shakeHead` or `nod`, which keep shaking the head
     or nodding until another face state is set (at the `shakeHead` and `nod` settings)
   - an eye state, `setEyes(name)`: `open`, `sad`, `angry`, `happy`, `happySad` (sad top lids over happy bottom
     ones), `sleepy` (heavy lids, nearly meeting), `closed` (closed keeps the eyes
     shut, and auto blink and wander wait until it ends), `winkLeft` or `winkRight` (that eye, as seen on screen,
     stays closed and auto blink blinks only the other), `peekLeft` or `peekRight` (the other eye shut, that one
     with happy sad's lids, the top tilted the other way) or `confused` (the left lid lowered, like one eyebrow raised)
   - a mouth state, `setMouthState(name)`: `neutral`, `smile`, `softSmile`, `slack`, `frown`, `flat`, `surprised`,
     `smirk` or `wavy`
   - a look, `setLook(name)`: `center`, `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`, `wander` (the original's idle
     mode, which the face starts with) or `dart` (glancing from side to side, for suspicious or shifty).
     `setPosition()` and `setIdleMode()` set looks too
   - toggles, `setAutoblinker`, `setCuriosity`, `setSweat` and `setShake` (the eyes jitter left and right; the
     original's `setHFlicker`)
2. **Moods**, named combinations of face states. `setMood()` takes the name or a constant: `DEFAULT`, `SAD`, `ANGRY`,
   `HAPPY`, `SMIRK`, `ASLEEP`, `HAPPY_ASLEEP`, `WORRIED` and `FURIOUS`. A mood sets every face state it names. A
   face, eye or mouth state it leaves out is `still`, `open` or `neutral`, a toggle it leaves out is its default, and
   a look it leaves out stays where it is. Setting a face state yourself lasts until the next mood.
3. **Face settings**: the eyes' and mouth's size and place, timings, and the modes (cyclops, mouth and
   smooth motion), which no mood changes.

## The mouth

Always a single line under the eyes. Only three things change: its length, its height and how far each corner bends.

- `setMouthWidth(px)`: length; `0` shrinks it away completely (it thins as it goes, so no dot is left)
- `setMouthGap(px)`: height, as the space between the bottom of the eyes and the mouth
- `setMouthCorners(left, right)`: positive bends a corner up, negative down; the middle stays straight. With one
  argument, both corners bend the same
- `setMouth(ON | OFF)`: with the mouth on, a strip under the eyes is reserved so it never leaves the screen
- the mouth state sets the corners. The length stays at the face's `mouth.width` (50) unless `mouth.moodWidth` is on;
  then the mouth state's own `width` sets it
- `mouthThickness`: line weight

It moves with the eyes when they look around, shake their head or nod, and eases the same way they do. While
laughing it bounces on its own instead (`laughMouthAmplitude`).

## Configuration

Every setting of a face is in one object, `FaceConfig`. `src/config.ts` holds the defaults (`defaultConfig`).

```js
const eyes = new RoboEyes(canvas, { config: { mouth: { gap: 12 }, blink: { interval: 3 } } });
eyes.configure({ mouthStates: { smile: { left: 6, right: 6 } } }); // change anything later
const config = eyes.getConfig();                                  // everything, as plain JSON
```

Both take any part of the configuration; what is left out keeps its value. The sections are:

- `frameRate`
- `eyes`: `left` and `right` width, height and radius, `spacing`, and `closedHeight`, how tall a closed eye stays (3
  by default, the mouth's thickness, where the original uses 1)
- `mouth`: `gap`, `thickness`, `curl`, `width` (the face's mouth length, 50) and `moodWidth` (off by default, so the
  mouth stays at `width`; on, the mouth state's own `width` is used instead)
- `blink`: `interval` and `variation` (auto blink timing, in seconds) and `speed`, how much of the remaining way a
  blinking eye goes each frame (0.5, as the original). The laugh, shake head and nod swings move at the same speed
- `wander`: `interval` and `variation`, how often a wandering look moves on
- `curious`, `laugh`, `shakeHead`, `nod` and `shake`: the amounts and timings for those
- `modes`: `cyclops`, `mouth` and `smooth`
- `look`: the look the face has now (the face starts with `wander`)
- `toggles`: what each toggle is when a mood leaves it out
- `eyeStates`, `mouthStates`, `looks` and `moods`: the face states and moods, by name. Add a key to add one

An eye state is two eyelids, `top` and `bottom`, which both eyes share, and `closed` (`true`, `false`, or `'left'`
or `'right'` for a wink). `left` and `right` give one eye (as seen on screen) its own lids: only what differs, laid
over the shared ones, e.g. `left: { top: { height: 0.4 } }`. Lid sizes are fractions of the eye's height:

- `height`: how far the lid comes over the eye at its corners (0 open, 1 covered)
- `angle`: 1 lowers only the outer corner (sad), -1 only the inner corner (angry), 0 keeps the lid level
- `curve`: positive takes the middle of the lid further in than its corners (an arch); negative takes the corners
  further in than the middle (a bowl, rounding off the eye's corners). Either way, `height` is the depth at the
  shallower part

A mouth state is `left` and `right` (how far each corner bends, in pixels) and optionally `width`, which only counts
when `mouth.moodWidth` is on unless the state also has `ownWidth: true` (as `surprised`, a dot, does). With
`followLook: true` (as `smirk`) the corners swap as the eyes look left, so the smirk curls up on the side away from
where they look. A look is `x` and
`y`, fractions of how far the eyes can move (0 left or top, 1 right or bottom). `wander: true` makes it wander instead;
`dart: { reach, holdMs }` makes it glance to `x - reach` and `x + reach` in turn, holding each glance for `holdMs`
(slow for suspicious, quick for shifty).

A mood names its face states, sets toggles, and can change its eye and mouth states for itself only with `override`:

```js
eyes.configure({ moods: {
  napping: { eyes: 'closed', mouth: 'flat', look: 'S' },
  smug:   { eyes: 'angry', mouth: 'smirk', look: 'NE', override: { eyes: { top: { height: 0.25 } } } },
} });
```

`null` in a mood removes that choice, as if the mood had left it out.

Moods and face states can be filed in folders with `group`, a path such as `'Upset/Angry'`. Folders only organise
them (the demo shows them as collapsible lists); they change nothing about how a face behaves, and every name must
still be unique within its kind.

`demo.html` has a control for every setting and shows the configuration as JSON, ready to copy.

## Differences from the Arduino version

- `precision: 'smooth'` (the default, `modes.smooth`) uses fractions for softer motion on big screens. `'pixel'` keeps
  the original's whole-number maths, quirks included (open eyes stop one pixel short of full height).
- The original's idle mode is the `wander` look, and the face starts with it; the original starts with idle off.
  `setIdleMode(OFF)` looks to the center.
- Eyelids are cut out of the eyes rather than painted over them in the background colour, which gives clean edges
  and supports a transparent background.
- Moods are combinations of face states from the configuration, so the `tired`, `angry` and `happy` flags and the
  `eyelids*` fields are gone. The original's tired mood is called sad here (`TIRED` still works as another name for
  `SAD`). The sad and angry eye states are the original triangles; happy is a curve close to the original's rounded
  rectangle.
- `begin()` re-centres the eyes for the new screen size.
- `anim_laugh()` and `anim_confused()` (also called `anim_shakeHead()`) swing the eyes with the same halfway-per-frame
  easing as a blink, turning back each time a swing arrives, instead of jumping every frame. A head shake takes the
  mouth with it. `laughAmplitude` and `shakeHeadAmplitude` set how far. `setVFlicker()` and `setHFlicker()` still
  shiver every frame, as in the original.
- New: `anim_nod()` swings the eyes and mouth down and up the same way (`nodAmplitude`).
- New: the `closed` eye state keeps the eyes closed until another eye state is set. Auto blink and wander wait
  meanwhile.
- Curious, sweat and shake (the original's horizontal flicker) are toggles, so a mood can turn them on or off.
  `setVFlicker()` still works but is not a toggle, so no mood changes it. The toggles' setters set them until the
  next mood.
- New moods, beyond the original's: `SMIRK` (open eyes with the top lids half down, smirk), `ASLEEP` (sleepy eyes
  looking straight ahead, the surprised mouth's dot, auto blink off), `HAPPY_ASLEEP` (sleepy eyes looking straight ahead, auto blink off),
  `WORRIED` (sad eyes, wavy mouth) and `FURIOUS` (angry eyes, frown, wandering, curious and shaking), and, without
  constants, `confused` (confused eyes, wavy mouth),
  `surprised` (open eyes, the surprised mouth's dot) and `scared` (worried, but sweating, shaking and darting its eyes
  from side to side).
- Auto blink is a toggle, so a mood can turn it off (`autoblink: false`); `setAutoblinker()` sets it until the next
  mood.
- Closed eyes are 3 pixels tall, the mouth's thickness, instead of the original's 1 (`closedHeight`).

## Build

`node build.mjs` (needs `tsc`) writes `dist/roboeyes.js`, `dist/config.js`, their `.d.ts` files and
`dist/roboeyes.global.js`.

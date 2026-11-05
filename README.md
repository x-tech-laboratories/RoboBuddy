# RoboEyes for the web (with a mouth)

A TypeScript port of [FluxGarage RoboEyes](https://github.com/FluxGarage/RoboEyes) v1.1.1 by Dennis Hoelscher,
drawing on a `<canvas>`, plus a mouth. GPL-3.0-or-later, like the original (see `LICENSE`).

## Use

```js
import { RoboEyes, DEFAULT, HAPPY, TIRED, ANGRY, N, E, ON, OFF } from './dist/roboeyes.js';

const eyes = new RoboEyes(document.querySelector('canvas'));
eyes.setDisplayColors('transparent', '#8fd6ff'); // background, main colour (any CSS colour)
eyes.begin(128, 64, 50);                         // screen width, height, max frame rate
eyes.setAutoblinker(ON, 3, 2);
eyes.start();                                    // runs update() every animation frame

eyes.setMood(HAPPY);       // eyelids and mouth ease into the new mood
eyes.setPosition(E);       // look right
eyes.anim_laugh();         // one-shot animations, as in the original
```

No bundler? Load `dist/roboeyes.global.js` with a script tag and use `window.RoboEyesLib`. `demo.html` does this.

Every method and setting of the original is here under the same name (`setWidth`, `setHeight`, `setBorderradius`,
`setSpacebetween`, `setMood`, `setPosition`, `setAutoblinker`, `setIdleMode`, `setCuriosity`, `setCyclops`,
`setHFlicker`, `setVFlicker`, `setSweat`, `open`, `close`, `blink`, `anim_confused`, `anim_laugh`). The C++
overloads become optional arguments, e.g. `blink()` or `blink(false, true)` for a wink.

## The mouth

Always a single line under the eyes. Only three things change: its length, its height and how far each corner bends.

- `setMouthWidth(px)`: length; `0` shrinks it away completely (it thins as it goes, so no dot is left)
- `setMouthGap(px)`: height, as the space between the bottom of the eyes and the mouth
- `setMouthCorners(left, right)`: positive bends a corner up, negative down; the middle stays straight. With one
  argument, both corners bend the same
- `setMouth(ON | OFF)`: with the mouth on, a strip under the eyes is reserved so it never leaves the screen
- `setMood()` also sets the mouth, from `eyes.moodMouth` (`{ width, left, right }` per mood; change those values to
  retune each mood)
- `mouthThickness`: line weight

It moves with the eyes when they look around, and eases the same way they do. It does not follow the laugh and
confused swings: while laughing it bounces on its own (`laughMouthAmplitude`), and while confused it holds still.

## Differences from the Arduino version

- `precision: 'pixel'` (default) keeps the original's whole-number maths, quirks included (open eyes stop one pixel
  short of full height). `'smooth'` uses fractions for softer motion on big screens.
- Eyelids are cut out of the eyes rather than painted over them in the background colour: the same shapes, but with
  clean edges and support for a transparent background.
- `begin()` re-centres the eyes for the new screen size.
- `anim_laugh()` and `anim_confused()` swing the eyes with the same halfway-per-frame easing as a blink, turning back
  each time a swing arrives, instead of jumping every frame. `laughAmplitude` and `confusedAmplitude` set how far.
  `setVFlicker()` and `setHFlicker()` still shiver every frame, as in the original.

## Build

`node build.mjs` (needs `tsc`) writes `dist/roboeyes.js`, `dist/roboeyes.d.ts` and `dist/roboeyes.global.js`.

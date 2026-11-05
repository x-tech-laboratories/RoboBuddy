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

Always a single line under the eyes. Only two things change: its length and how far its corners bend.

- `setMouthWidth(px)`: length; `0` shrinks it away completely (it thins as it goes, so no dot is left)
- `setMouthCorners(px)`: positive bends the corners up, negative down; the middle stays straight
- `setMouth(ON | OFF)`: with the mouth on, a strip under the eyes is reserved so it never leaves the screen
- `setMood()` also sets the mouth, from `eyes.moodMouth` (change those values to retune each mood)
- `mouthThickness`, `mouthGap`: line weight and space below the eyes

It moves with the eyes (looking around, laughing, confused) and eases the same way they do.

## Differences from the Arduino version

- `precision: 'pixel'` (default) keeps the original's whole-number maths, quirks included (open eyes stop one pixel
  short of full height). `'smooth'` uses fractions for softer motion on big screens.
- Eyelids are cut out of the eyes rather than painted over them in the background colour: the same shapes, but with
  clean edges and support for a transparent background.
- `begin()` re-centres the eyes for the new screen size.

## Build

`node build.mjs` (needs `tsc`) writes `dist/roboeyes.js`, `dist/roboeyes.d.ts` and `dist/roboeyes.global.js`.

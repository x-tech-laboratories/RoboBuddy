# Design reasoning

Why the library is built the way it is. The README says what each setting does; this says why the pieces are shaped as
they are, so a change can be judged against the intent.

## Goals

1. **A faithful port first.** The logic, names, defaults and timings are FluxGarage RoboEyes v1.1.1's. `update()` and
   `drawEyes()` run the same steps in the same order, including the "halfway to the target every frame" tweening.
   Anyone who knows the Arduino library should find every method where they expect it.
2. **Then extend it, without breaking that.** Everything new (mouth, moods built from parts, speech, laughing, crying)
   sits beside the original's behaviour. With the mouth off and `precision: 'pixel'`, the layout and motion are the
   original's.
3. **Expression is data, not code.** A new mood, mouth or look should be a JSON entry, not a code change.
4. **Works on any screen.** The same face runs on a 128×64 OLED-style canvas and on a large display.

## A face is built in layers

The original has three mood flags (`tired`, `angry`, `happy`) and a few one-off moves. That cannot say "sad eyes with a
wry mouth" or "happy eyes, but looking away", so a face is layered instead (`src/config.ts`):

| Layer | What it is | Why it is separate |
| --- | --- | --- |
| **Face states** | An eye state, a mouth state, a look, and toggles | Each can be set alone (`setEyes`, `setMouthState`, `setLook`), so a caller can wink without changing the mood |
| **Moods** | Named combinations of face states, with tweaks for that mood only | The thing a caller usually wants: "be sad" |
| **Face settings** | Eye and mouth size and place, timings, modes | These describe the *face*, not the feeling, so no mood changes them |

Two rules keep the layers predictable:

- **Every mood starts from `default`, and nothing carries over from the mood before.** What a mood leaves out comes
  from the `default` mood, and what that leaves out comes from built-in fallbacks. So the result of `setMood('sad')` never
  depends on history. The one exception, `override`, is never passed on from `default`.
- **A face state set by hand lasts until the next mood.** A mood is a reset; a state is an adjustment.

Moods and states can be filed in folders (`group: 'Anger/Furious'`). That is only organisation for the demo's pickers; it
changes no behaviour, and names stay unique within their kind. The folders follow emotion families (Happy, Sad, Fear,
Surprise, Anger, Thinking, Sleepy) rather than how a mood is made, because that is how someone looks for one.

## Eyes: lids, not shapes

Every eye is the same rounded rectangle, and expression comes only from covering part of it with a top and a bottom lid.
This mirrors the original (its tired, angry and happy moods are lids painted over the eye) and keeps the vocabulary small.

A lid has three numbers: `height` (how far it comes down), `angle` (which corner drops: positive lowers the outer
corner, for sad; negative the inner corner, for angry) and `curve` (an arch or a bowl). That is enough to express:

- the original's tired and angry as exact triangles (sad and angry here are the original's shapes, not look-alikes);
- happy as a curved bottom lid, close to the original's rounded rectangle;
- new states (sleepy, happySad, disappointed, peeking, confused) as new numbers, not new code.

Choices that follow from this:

- **Lid sizes are fractions of the eye's height**, so a state fits any eye size and survives `scale` and curious growth.
- **Per-eye overrides (`left`, `right`) hold only what differs**, laid over the shared lids. A wink or a confused face
  is a small delta, not a copy of the whole state.
- **Lids are cut out of the eye, not painted over it in the background colour.** The shapes are identical, but the edges
  are clean at any size and the background can be transparent. This is the main drawing difference from the original.
- **`closed` can be `true`, `'left'` or `'right'`.** A closed eye holds auto blink and wander off, because a blink or
  glance would fight a face that is deliberately shut; a wink blinks only the open eye.
- **Eyes of different heights align along their bottom edge**, so the mouth has one line to sit under.

## The mouth

The mouth is a single line under the eyes. It was kept that spare on purpose: a line that changes length and bends its
two corners reads as a smile, frown, smirk or flat mouth, and it matches the eyes' own simplicity. Everything later was
added by extending that line rather than replacing it:

- **Two independent corners** (`left`, `right`) give smirks and wry mouths without a second shape. `followLook` mirrors a
  lopsided mouth when the eyes look left, so a smirk curls up on the side away from the gaze.
- **Opening** (`open`, `leftOpen`, `rightOpen`) turns the line into a rectangle by letting it grow downwards. Corners can
  open by their own amount, which is how a laugh keeps its middle straighter than its ends; `radius` rounds those corners.
- **Length is the face's, not the mood's, by default** (`moodWidth` off). Most moods are about the corners, and a mouth
  that changed length with every mood would jump. A state like `closedGasp` sets `ownWidth` because its length *is* its
  point (a dot).
- **The mouth takes space.** With it on, a strip under the eyes is reserved, so eyes never wander far enough to push the
  mouth off screen. With it off, the layout is the original's exactly.
- **It moves with the eyes** (looking, laughing, shaking, nodding) and eases the way they do, so face and mouth never
  seem to belong to different animations.
- **The eyes and mouth are centred together** as one face, not the eyes alone.

## Motion

- **Easing, not snapping.** The original moves a fraction of the remaining distance each frame. The same rule is used
  for everything new: mouth length, gap and corners, lids, eye scale. That uniformity is what makes the face read as one
  object.
- **Mood changes ease in too** (`transition`). For a short while after a mood changes, values move faster per frame than
  the usual half, so the face settles instead of snapping, and the eyes can blink to hide the change. `durationMs: 0`
  gives the original's snap.
- **Temporary moods** (`setMood(name, { for: ms })`) return to the last mood set *without* `for`, so a reaction during a
  reaction goes back to the real mood underneath, not to the reaction before. Settings and one-off actions are never
  touched.
- **Intros** let a mood have a short entrance (a pop of the eyes for startled, eyes fluttering open for waking) before its
  own states take over.
- **Looks are named and can be moving.** A look is a place (`N`, `E`…), or `wander`, `follow`, a `path`, a head shake or a
  nod. Shake and nod are looks rather than separate animations because they replace where the face points, and that
  keeps "what is the face doing" a single answer. A look can carry its own speed and amplitude.
- **Toggles are for what keeps happening** (auto blink, curious, sweat, shake, talk, laugh, cry, sigh). Laughing, crying
  and sighing are toggles rather than the original's one-shot moves because they are states a mood can include; each
  swings the eyes and mouth together, and keeps time from the clock so its pace does not depend on the frame rate.
- **Pace belongs to the mood.** A mood can set its own blink interval (slow for calm, quick for worried) and eye `scale`
  (wide for startled, small for suspicious).

## Reduced motion

`modes.reducedMotion` (`'auto'` by default) follows `prefers-reduced-motion`. The rule: **keep each pose, stop what keeps
moving.** Auto blink, wander, shake, sweat, laugh, head shake, nod and talk stop; moving *between* poses still eases, and
`speak()` still plays, because speech is something the user asked for. Intros and the blink on mood change are skipped.
The face must still be able to show a feeling, so it never goes blank.

## Speech

Speech drives the mouth, not audio. English spelling becomes sounds by a small set of letter rules plus a short list of
common words that break them, each sound is a viseme (a mouth shape), and visemes are shaped like a real mouth moves:
sounds that do not need the lips take the shape of the vowel next to them, and fast speech opens less.

It is deliberately an approximation, "which is all a robot face needs", and not a pronunciation dictionary. Visemes are
relative (open, corner, width, lift, lip), so they work on any mouth state and any mouth size. The random `talk` toggle
exists for when there is no text to say.

## Configuration

- **One object, `FaceConfig`, is the whole face.** It is plain JSON, kept in `defaultConfig.json` and imported by the
  library, so a face can be exported, edited and re-imported (the demo's builder does this). The build also writes it as
  `dist/defaultConfig.js`, which `dist/config.js` imports, so a page whose security policy blocks fetching JSON
  (`connect-src 'none'`) can still load the library.
- **Patches, not replacements.** `configure()` and the constructor take any part of the config; what is left out keeps
  its value. Adding a key to `moods`, `eyeStates`, `mouthStates` or `looks` adds one. `null` removes a choice.
- **Copies in, copies out.** `getConfig()` returns plain JSON, and merging deep-copies, so callers cannot mutate a face by
  accident.
- **Pixel values are screen pixels; times are seconds unless named `ms`.** The unit is in the name when it differs.

## Precision

- `'smooth'` (default) uses fractions, for soft motion on big screens.
- `'pixel'` keeps the original's whole-number maths, quirks included (open eyes stop one pixel short of full height), so an
  OLED frame can be matched exactly.

Both use the same code path; only the rounding differs.

## Drawing

Drawing goes through a small `Display` interface, and `CanvasDisplay` draws with vector shapes, so the face is sharp at any
size. Any colour CSS accepts works, including transparent. The interface is also what would let the face draw somewhere
other than a canvas.

## Build and delivery

- **TypeScript compiled by `tsc`, one extra step for script tags.** `build.mjs` joins the compiled modules into one
  `dist/roboeyes.global.js` (inlining the JSON, since a script tag cannot import it) so the library works with no bundler,
  as `window.RoboEyesLib`. The ES module build is the primary one.
- **`dist/` is committed.** The demo and GitHub Pages load it directly, with no build step for a visitor.
- **CI regenerates what drifts.** After each push to `main`, a workflow rebuilds `dist/` and re-renders every mood's
  screenshot in headless Firefox, then commits the result with `[skip ci]` so it does not trigger itself. Screenshots are
  regenerated only when `src` or `scripts` changed, because they are not byte-for-byte repeatable and would otherwise
  churn.
- **The demo is the test bench.** `demo.html` is a face builder: pick or import a config, preview every mood, edit
  states. The README's mood screenshots are rendered from the same library, so they cannot drift from it.

## Licence

GPL-3.0-or-later, because the original is GPL and the port is derived from it. The credit to the original author and
the licence text stay in each source file's header.

## What was deliberately left out

- **No `anim_confused()`.** Confusion is now an eye state and a mood, and shaking the head is a look.
- **No `open()`/`close()` moves.** They became the `closed` eye state, which holds, instead of a one-off.
- **No separate tired/angry/happy flags.** They are eye states among many; `TIRED` still works as another name for `SAD`.
- **No audio.** Speech is mouth shapes only; any sound is the caller's business.
- **No SVG or CSS rendering.** The library is canvas-only. A separate SVG/CSS mascot design exists outside this
  repository and is not part of the library.

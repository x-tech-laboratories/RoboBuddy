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
/** The sounds of one word, by spelling. */
export function wordSounds(word) {
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
export function textToVisemes(text, visemes, options = {}) {
    const speed = Math.max(0.2, options.speed ?? 1);
    const queue = [];
    const push = (names) => {
        const first = queue.length;
        let stressed = false;
        names.forEach((name) => {
            if (!visemes[name])
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
        if (PAUSE_MS[token])
            queue.push({ name: 'rest', ms: PAUSE_MS[token], stressed: false, wordEnd: false, pause: true });
        else if (/\d/.test(token))
            push(DIGITS[Number(token)].split(' '));
        else
            push((WORDS[token] ?? WORDS[token.replace(/'/g, '')])?.split(' ') ?? wordSounds(token));
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

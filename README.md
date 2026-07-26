# Golden Faith Academy Student Hub

The front page for a shared library of handouts, reviewers, lesson videos and references for
Senior High School at Golden Faith Academy, covering the STEM, ABM, HUMSS and ICT strands.

**Live:** https://rexsx.github.io/the-shelf/

This is the landing page. Subject pages and the material itself are not in yet.

## Disclaimer

An independent student project, published as portfolio work. It is not operated by, endorsed by
or affiliated with Golden Faith Academy, its administration or its faculty. The school and
strand names appear only to describe who the material is for. Nothing here is intended to
reflect badly on the academy or anyone who works there; if something misrepresents the school
or should not be public, open an issue and it comes down.

The hub is for study material only. It does not host answers to graded work and will not accept
them.

## Running it

Open `index.html`. There is no build step, no package manager and no dependency to install.

If you want to serve it over HTTP rather than from the filesystem, any static server works.

## Layout

```
index.html            the landing page, one scroll from cover to colophon
404.html
assets/css/main.css   every style, including the type scale and the strand colours
assets/js/site.js     nav, scroll progress, reveal on scroll, footer year
assets/img/           icon
```

## Design notes

Dark editorial on a blue ground. The page reads like a magazine spread rather than a product
site: one display serif carrying the hierarchy, hairline rules doing the structural work, a
numbered table of contents on the cover, and a folio at the foot.

- **Three typefaces, none of them downloaded.** Display and body use a serif stack that lands on
  Palatino Linotype on Windows, Iowan Old Style on Apple and Georgia as the floor. Labels and UI
  text use the platform sans. Every numeral — section numbers, the contents list, the ledger —
  is set in the system mono with `tabular-nums`, which is what makes the figures line up in a
  column. Nothing is fetched from a third party and there is no reflow while a font loads. On a
  school connection that matters more than a perfect letterform.
- **The palette is a cool ramp, not four unrelated colours.** Azure `#4d9bf5` carries the primary
  accent, and the strands run teal → sky → indigo → violet across it. Each strand colour arrives
  as a `--tone` custom property on the element, so `.strand-row` and `.feature` are one class
  each and recolour without a variant.
- **Depth lives at the edges, never behind text.** A soft vignette darkens the outer frame of the
  page and an inline SVG turbulence filter lays grain over everything at three and a half percent,
  so a flat background does not read as an empty div. An earlier version drew the twelve-column
  layout grid on the page as hairlines; it was removed because faint vertical lines behind body
  text read as a rendering fault rather than as structure.
- **Two themes, both designed.** Light is not an inverted dark; it has its own accent, rule,
  aurora and glow strengths so contrast holds on paper white. The choice follows the system
  until the reader picks one, after which their pick wins and is remembered. An inline script in
  `<head>` sets `data-theme` before first paint so the page never flashes the wrong theme.
- **Motion is layered, not decorative noise.** Three blurred colour fields drift across the
  cover on long, offset cycles; a pointer-tracked spotlight follows the cursor on devices that
  actually have one; the rule beside each section number draws itself in as the section arrives;
  cards lift and grow a coloured edge on hover. All of it is disabled under
  `prefers-reduced-motion`, the spotlight is dropped on touch, and the heaviest aurora blob is
  dropped below 720px so phones are not asked to composite three large blurs.
- **Content is visible without JavaScript**, because the reveal styles are scoped behind a `.js`
  class that only exists once the script runs.

Every colour, size and easing curve is a custom property at the top of `main.css`.

## Contact

The page carries an email, a link for reporting problems and a link for contributing. All three
live in the `#contact` section of `index.html` and in the footer. Change the address in those two
places and nowhere else.

## Deploying

GitHub Pages, source set to "Deploy from a branch", branch `main`, folder `/ (root)`.
`.nojekyll` is present, so nothing gets rewritten on the way out.

## Browser support

Current Chrome, Edge, Firefox, Safari and the Firefox-based browsers such as Zen.

`color-mix()` is deliberately not used. It was, and a browser that does not understand it drops
the whole declaration, which would have left the sticky masthead with no background at all.
Each of those is now a plain colour or a gradient with an ordinary fallback.

The rest degrades quietly. `text-wrap: balance` only affects where headings break.
`background-clip: text` sits behind an `@supports` guard, so a browser without it gets a solid
accent colour rather than invisible text. `overflow: clip`, `aspect-ratio` and `backdrop-filter`
are all several years old.

## Privacy

No accounts, no analytics, no cookies, no third party requests of any kind. Local storage holds
one key, `gfa-theme`, remembering whether you picked light or dark.

## Licence

MIT, see `LICENSE`.

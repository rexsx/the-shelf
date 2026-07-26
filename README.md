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
- **A real twelve-column grid is drawn on the page.** `.grid-lines` is a fixed, aligned overlay
  of hairlines at five percent opacity, hidden below 1000px. It is the same grid the layout uses,
  made visible.
- **Grain** is an inline SVG turbulence filter at three and a half percent, fixed over everything.
  It keeps a flat dark background from looking like an empty div.
- **Motion is small on purpose.** Sections rise eighteen pixels into place on first view through
  an IntersectionObserver; hover states grow a hairline rather than move a box. All of it is
  disabled under `prefers-reduced-motion`. Content is visible without JavaScript, because the
  reveal styles are scoped behind a `.js` class that only exists once the script runs.

Every colour, size and easing curve is a custom property at the top of `main.css`.

## Deploying

GitHub Pages, source set to "Deploy from a branch", branch `main`, folder `/ (root)`.
`.nojekyll` is present, so nothing gets rewritten on the way out.

## Browser support

Current Chrome, Edge, Firefox and Safari. `color-mix()` and `clamp()` are used throughout,
which rules out anything older than roughly 2023.

## Privacy

No accounts, no analytics, no cookies, no third party requests of any kind.

## Licence

MIT, see `LICENSE`.

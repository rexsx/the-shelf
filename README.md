# Golden Faith Academy Student Hub

The front page for a shared library of handouts, reviewers, lesson videos and references for
Senior High School at Golden Faith Academy, covering the STEM, ABM, HUMSS and ICT strands.

**Live:** https://rexsx.github.io/the-shelf/

This is the landing page. Subject pages and the material itself are not in yet.

## Notice and policy

The full version is on the site under [Notice, policy and takedown](https://rexsx.github.io/the-shelf/#notice).
In short:

**Independent.** A student-built project published as portfolio work. Not operated by, endorsed
by or affiliated with Golden Faith Academy, its administration or its faculty. The school name,
crest and strand names appear only to describe who the material is for. The official school site
is https://www.gfa.edu.ph/.

**School rules come first.** Anything the administration or a teacher asks us to change, credit
differently, restrict or remove is changed, credited, restricted or removed, without asking for
a reason. Where a school policy and anything here conflict, the school policy wins.

**Access is left where the school set it.** Some links open only with a Golden Faith Academy
account, because that is how the teacher shared the file. The hub links material where it
already lives; it does not host copies, mirror files or route around a sign-in. Circumventing
that kind of restriction breaks school rules and is an offence under the Cybercrime Prevention
Act of 2012 (RA 10175).

**Study material only.** No answers to graded work, and none will be accepted.

**Copyright.** Material stays with whoever made it. What is linked is openly licensed, published
free by its author, or shared for classroom use under the educational provisions of the
Intellectual Property Code of the Philippines (RA 8293), with credit to the source. To have
something removed, email the address in the contact section: name the item and it comes down,
discussion afterwards.

**Privacy and conduct.** No accounts, analytics, cookies, trackers or third-party requests, so
there is no personal data to mishandle under the Data Privacy Act of 2012 (RA 10173). Nothing
here may name, picture, rank or target any student, teacher or staff member, per DepEd's Child
Protection Policy (DepEd Order No. 40, s. 2012) and the Anti-Bullying Act of 2013 (RA 10627).

This is a statement of how the project is run, not legal advice. If the academy would rather any
of it were worded differently, their wording is used instead.

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

Push to `main`. The workflow in `.github/workflows/deploy.yml` publishes to GitHub Pages, so the
Pages source is set to "GitHub Actions" rather than to a branch.

### Why there is a workflow at all

Browsers cache `main.css` and `site.js` by URL. Because those URLs never changed, a returning
visitor kept the old stylesheet after every update and had to clear their cache to see the site
as it actually is. Telling people to clear their cache is not a fix.

`tools/stamp.js` reads each asset, takes a SHA-256 of its contents, and rewrites the references
in the HTML to `main.css?v=<first ten hex characters>`. Change one byte of CSS and the URL
changes with it, so the browser has no cached copy and has to fetch it. Change nothing and the
URL is identical, so the cached copy is reused and the visit costs nothing. It is exact, rather
than a guess at a sensible expiry time.

The stamping happens in the workflow, not in the repository. Source files keep plain
`assets/css/main.css` references so `index.html` still opens correctly straight from the
filesystem with no build step for anyone editing the site. Run `node tools/stamp.js` by hand to
see what it does; it is idempotent, and `git checkout -- index.html 404.html` puts the plain
references back.

One limit worth knowing: GitHub Pages serves HTML with a ten minute cache and gives you no way
to change that header. A returning visitor can therefore see the previous HTML for up to ten
minutes after a deploy, and it then corrects itself. The assets that HTML points at are exact.

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

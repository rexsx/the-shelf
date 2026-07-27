# Golden Faith Academy Student Hub

The front page for a shared library of handouts, reviewers, lesson videos and references for
Senior High School at Golden Faith Academy, covering the STEM, ABM, HUMSS and ICT strands.

**Live:** https://rexsx.github.io/the-shelf/

This is the landing page. Subject pages and the material itself are not in yet.

## Whole-subject reviewers

`tools/build-reviewers.js` merges every handout for a subject into one PDF, so a student can
download a subject once and have it offline instead of opening eighteen links.

```
cd tools && npm install
node tools/build-reviewers.js "<handouts folder>" "<output folder>"
```

It reads one folder per subject code, merges the PDFs in filename order, sets the document title,
and reports the page count and file size for each. `pdf-lib` is a build-time dependency and lives
only in `tools/`. The site itself still ships nothing.

The merged files are **not** committed here, and should not be. They are the school's material,
shared with students through school accounts, and this repository is public. Put them wherever
the school's own access control still applies, then paste the link into
`assets/js/reviewers.js`:

```js
window.REVIEWERS = {
  PRECAL: "https://drive.google.com/file/d/.../view",
  ...
};
```

A subject with an empty string simply shows no reviewer link. That file is hand-edited and is
never touched by `tools/import-resources.js`, so re-importing a semester will not wipe it.

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
assets/js/site.js     theme, nav, scroll progress, reveal on scroll, headline splitting
assets/fonts/         Instrument Serif, roman and italic, with its OFL licence
assets/img/           crest, icons, link preview
tools/stamp.js        content-hashes assets at deploy time so caches update
```

## Design notes

Dark editorial on a blue ground. The page reads like a magazine spread rather than a product
site: one display serif carrying the hierarchy, hairline rules doing the structural work, a
numbered table of contents on the cover, and a folio at the foot.

- **One downloaded face, used only where it counts.** Headlines are set in Instrument Serif, a
  high-contrast display serif under the SIL Open Font License. Two woff2 files, roman and italic,
  latin subset only, 43 KB for the pair, served from `assets/fonts/` — so there is still no
  third-party request anywhere on the page. The roman is preloaded, and `font-display: swap`
  means text is readable before it arrives.
- **Everything else is the platform's own.** Body copy is a serif stack landing on Palatino
  Linotype, Iowan Old Style or Georgia; labels and UI text use the platform sans; numerals use
  the system mono with `tabular-nums`, which is what makes figures line up in a column. Pairing a
  sharp display serif against a humanist text serif is deliberate — the contrast between them is
  what makes the headlines read as set rather than typed.
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

## Contrast

Every piece of text on the page meets WCAG AA against the surface it actually sits on, in both
themes. The worst case is 6.27:1 in dark and 4.69:1 in light, against a 4.5:1 requirement for
body text.

That is measured rather than assumed. The check walks every text node in the rendered page,
resolves the real background by climbing to the nearest opaque ancestor, and computes the
contrast ratio at the element's own font size and weight. Secondary text failed the first time
it was run — the muted grey was 4.19:1 in dark and 3.49:1 in light, which is exactly the range
where text looks fine to whoever chose it and disappears for everyone else. If you change a
colour token, re-run the check before pushing.

## Privacy

No accounts, no analytics, no cookies, no third party requests of any kind. Local storage holds
one key, `gfa-theme`, remembering whether you picked light or dark.

## Licence

The site is MIT, see `LICENSE`.

Instrument Serif, in `assets/fonts/`, is licensed separately under the SIL Open Font License 1.1
and its licence travels with it in `assets/fonts/OFL.txt`. Copyright 2022 The Instrument Serif
Project Authors. If you fork this and swap the typeface, delete those files with it.

The Golden Faith Academy crest is the school's mark, used here by a student of the school to
identify who the material is for. It is not covered by the MIT licence and comes out on request.

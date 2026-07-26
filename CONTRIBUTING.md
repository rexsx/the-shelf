# Contributing

Small repository, short rules.

## Before you open a pull request

- Keep it dependency free. No framework, no build step, no package manager. The page has to
  keep working when it is opened straight from the filesystem.
- Two space indent. Double quotes in JavaScript and HTML attributes.
- Add design tokens as custom properties at the top of `main.css` instead of hardcoding a hex
  value halfway down the file.
- Content must stay readable with JavaScript switched off. The reveal animation is scoped
  behind a `.js` class for exactly this reason, so do not move visibility into the script.

## Check before you submit

- Read the page at 390px wide and at 1440px. Most people here are on a phone.
- Turn on reduced motion in your system settings and confirm nothing animates.
- Tab through from the top. The skip link, the menu button and every link should take focus in
  a sensible order with a visible ring.
- Confirm no network requests leave the page. There should be none.

## Reporting a problem

Open an issue. A screenshot, the browser and the screen width are usually enough.

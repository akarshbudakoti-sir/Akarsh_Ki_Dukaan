# Akarsh Ki Dukaan

A dark-themed, static HTML/CSS/JS app store page. App cards, search, category filter, and a details modal with a download button. No backend, no build step, no cost.

## Files

- `index.html` — page structure
- `style.css` — all styling, including responsive rules for phone/tablet/desktop
- `script.js` — app data array, rendering, search, category filtering, modal behavior
- `README.md` — this file

## How to run it

Just open `index.html` in any browser (desktop or phone). Double-tap the file, or use "Open with browser" from a file manager app. Everything — including the app list — is in these three files, so no internet connection and no server is needed to view it.

I have not deployed or hosted this anywhere, and I have not tested it on an actual phone browser. Open it yourself and check before trusting it works exactly as expected.

## How to add your own apps

Open `script.js` and edit the `allAppsData` array near the top. Each app is one object:

```js
{
  id: "unique-id",
  name: "App Name",
  category: "Category Name",
  icon: "🔧",
  shortDesc: "short line, currently unused on the card but kept for future use",
  fullDesc: "longer description shown in the details popup",
  version: "1.0",
  size: "10 MB",
  downloadUrl: "REPLACE_WITH_REAL_LINK"
}
```

Add a comma after the previous entry and paste a new object in. Categories in the filter bar are generated automatically from whatever `category` values you use — you don't edit the category bar by hand.

## The unresolved problem: "private" + "downloadable" + "free" don't fully fit together

This was true for the first version and is still true here — organizing the files into a folder didn't change it:

- A **private** GitHub repo cannot serve files to your friends over a plain link. `raw.githubusercontent.com` only works without login on public repos, and GitHub Pages — the free way to host `index.html` as a real website — publishes the site at a public URL even when the repo behind it is private (repo privacy doesn't carry over to Pages unless you're on GitHub Enterprise).
- So you have to pick one:
  1. Make the repo public. The page and any APKs linked from it are then open to anyone with the URL — not private, just unlisted.
  2. Keep the repo private and don't rely on this page to actually deliver APKs. Send APK files to friends directly (WhatsApp, a Drive link, whatever) and use this page only as a catalog you browse locally on your own phone, with `downloadUrl` left as placeholders or pointed at links you send separately.
  3. Treat "private" loosely — public repo, but you only share the link with people you trust, and you don't advertise it.

Nothing in this version decides that for you. The `downloadUrl` values are still placeholders (`REPLACE_WITH_REAL_LINK`) because where that link should point depends on which option above you pick.

## Adding these files to your existing GitHub repo from your phone

1. Open `github.com` in your phone's browser and log in.
2. Go to your `Akarsh_Ki_Dukaan` repository.
3. Tap "Add file" → "Create new file."
4. Type the filename exactly (e.g. `index.html`) in the name field.
5. Paste that file's contents into the body box.
6. Scroll down and tap "Commit changes."
7. Repeat for `style.css`, `script.js`, and `README.md` — four files, four commits.

There is no ZIP upload option in GitHub's mobile web interface for a brand new set of files, so this one-file-at-a-time method is the actual way to do it on your phone without installing another app.

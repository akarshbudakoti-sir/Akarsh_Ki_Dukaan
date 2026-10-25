# Akarsh Ki Dukaan — redesigned prototype

A responsive, Apple App Store-inspired dark catalogue built with plain HTML, CSS and JavaScript. Electric purple is used as a restrained accent.

## Files
- `index.html` — page structure and navigation
- `style.css` — responsive visual design
- `script.js` — catalogue data, search, categories, details and download-link handling
- `README.md` — these instructions

## Deploy on GitHub Pages
Keep these files in the repository root. In repository Settings → Pages, choose **Deploy from a branch**, branch `main`, folder `/(root)`. Commit changes and wait for the deployment.

## Add or change an app
Edit `allAppsData` near the top of `script.js`. Example:

```js
{
  id: "unique-id",
  name: "App name",
  category: "Tools",
  icon: "A",
  iconUrl: "",
  iconBg: "linear-gradient(145deg,#a78bfa,#6d28d9)",
  shortDesc: "Short description",
  fullDesc: "Full description.",
  version: "1.0",
  size: "12 MB",
  downloadUrl: "https://example.com/authorized-file.apk",
  type: "APK",
  featured: false
}
```

Only use a real URL that you have verified and are allowed to distribute. Empty URLs deliberately disable the Download button and show a clear message.

## Important limitations
- This is a static catalogue, not a secure upload backend.
- There is no working admin upload panel, login system, installed-app detection, or real update detection in this prototype.
- GitHub Pages makes this website public. Do not put secrets, private files, API keys or credentials in this repository.
- An APK link works only if it points to an accessible, actual file or authorized download page. A website wrapper does not create APK files automatically.
- Distribute only files you own or are authorized to share. Third-party app names and logos belong to their respective owners.

## Test checklist
- Search by app name, category or description.
- Tap category chips and clear filters.
- Open a card and close the details sheet.
- Check that demo entries without a URL display “Not available yet” rather than a broken download.
- Test on a real Android browser before sharing.

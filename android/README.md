# ModStore Android test app (Update-2.0 branch only)

A thin Android WebView wrapper around the ModStore site files in the repo root.
At build time `app/build.gradle.kts` copies index.html, admin.html, *.js, *.css
and version.json from the repo root into the app, so the app always shows this
branch's design. The catalogue still loads live from Supabase (public anon key
in config.js, same as the website).

App look (app/src/overlay, injected at build time):
- app.css: bundled serif font (fonts/SourceSerif4.woff2) plus frosted-glass
  styling. Loaded on every page, including admin.
- wallpaper.css + wallpaper.jpg: store-page background only. It is not linked
  from admin.html, so the admin page keeps its plain background.
- Launcher icon: app/src/main/res/drawable-nodpi/ic_modstore.png.
- App label is "ModStore" (versionName 2.1.1-test, versionCode 3).

Safety: no JavaScript bridge is exposed. Only the app's own bundled origin
stays inside the app; every other link (MediaFire downloads etc.) opens in the
phone's browser.

Build (JDK 17, Android SDK 34, Gradle 8.7+):
    cd android && gradle :app:assembleRelease

The release build is signed with the standard Android debug key. This is a
test build only: it is not published and nothing here touches main.

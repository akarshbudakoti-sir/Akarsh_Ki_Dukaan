# ModStore Android test app (Update-2.0 branch only)

A thin Android WebView wrapper around the ModStore site files in the repo root.
At build time `app/build.gradle.kts` copies index.html, admin.html, *.js, *.css
and version.json from the repo root into the app, so the app always shows this
branch's design. The catalogue still loads live from Supabase (public anon key
in config.js, same as the website).

Safety: no JavaScript bridge is exposed. Only the app's own bundled origin
stays inside the app; every other link (MediaFire downloads etc.) opens in the
phone's browser.

Build (JDK 17, Android SDK 34, Gradle 8.7+):
    cd android && gradle :app:assembleRelease

The release build is signed with the standard Android debug key. This is a
test build only: it is not published and nothing here touches main.

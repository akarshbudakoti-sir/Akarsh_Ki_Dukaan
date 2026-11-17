plugins { id("com.android.application") }

// Copies the website files from the repo root into the app, so the app always
// shows whatever design is on this branch. No secrets live in these files.
val siteAssets = layout.buildDirectory.dir("generated/siteAssets")
val copySite = tasks.register<Copy>("copySiteAssets") {
    filteringCharset = "UTF-8"
    // Site files from the repo root. The app look (font, glass, wallpaper) is
    // added here from src/overlay: app.css on every page, wallpaper.css on the
    // store page only (not admin).
    from(rootDir.parentFile) {
        include("index.html")
        filter { it.replace("</head>", "<link rel=\"stylesheet\" href=\"app.css\"><link rel=\"stylesheet\" href=\"wallpaper.css\"></head>") }
    }
    from(rootDir.parentFile) {
        include("admin.html")
        filter { it.replace("</head>", "<link rel=\"stylesheet\" href=\"app.css\"></head>") }
    }
    from(rootDir.parentFile) { include("*.js", "*.css", "version.json") }
    from(file("src/overlay"))
    into(siteAssets)
}

android {
    namespace = "com.akarsh.modstore.test"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.akarsh.modstore.test"
        minSdk = 24
        targetSdk = 34
        versionCode = 2
        versionName = "2.1.0-test"
    }
    buildTypes {
        // Test build: signed with the standard Android debug key.
        release { isMinifyEnabled = false; signingConfig = signingConfigs.getByName("debug") }
    }
    sourceSets["main"].assets.srcDir(siteAssets)
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
tasks.named("preBuild") { dependsOn(copySite) }
tasks.configureEach { if (name.contains("lint", ignoreCase = true)) mustRunAfter(copySite) }

dependencies { implementation("androidx.webkit:webkit:1.11.0") }

plugins { id("com.android.application") }

// Copies the website files from the repo root into the app, so the app always
// shows whatever design is on this branch. No secrets live in these files.
val siteAssets = layout.buildDirectory.dir("generated/siteAssets")
val copySite = tasks.register<Copy>("copySiteAssets") {
    from(rootDir.parentFile) {
        include("index.html", "admin.html", "*.js", "*.css", "version.json")
    }
    into(siteAssets)
}

android {
    namespace = "com.akarsh.modstore.test"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.akarsh.modstore.test"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "2.0.0-test"
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

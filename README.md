# Akarsh Ki Dukaan — Dynamic Categories

1. Run `categories_setup.sql` in your Supabase project's SQL Editor once.
2. Replace `store.js`, `admin.html`, and `admin.js` in the repository root with the matching files here.
3. Keep `index.html`, `style.css`, and `config.js` unchanged.
4. Commit to `main`, wait for GitHub Pages to deploy, then refresh the site.

Admin can add, rename, and delete categories. The homepage category buttons and admin app-category dropdown load from `store_categories`. Renaming also updates app rows in the old category. Deleting moves apps to `Apps` first.

The SQL policy uses the admin UID supplied by the owner. Verify it is correct before running. Never put a Supabase service-role key in client-side files.

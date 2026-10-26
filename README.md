# Akarsh Ki Dukaan — Manage Wallpaper

## Replace/add these files in the GitHub repository root
- Replace `index.html`
- Replace `admin.html`
- Replace `admin.js`
- Replace `store.js`
- Add `wallpaper.jpg` (fallback wallpaper)

Keep `style.css`, `config.js`, and existing data unchanged.

## Supabase prerequisites
1. Public Storage bucket named `store-wallpapers`.
2. Run the Step 2 SQL creating `public.store_settings` and its policies.
3. Run the Step 3 Storage policies for `store-wallpapers` (public SELECT, admin-only INSERT/UPDATE/DELETE).

The Admin panel now has a third section, Manage Wallpaper. Upload JPG, PNG, or WebP up to 8 MB. The URL is saved in `store_settings` under key `wallpaper_url`. The public store and Admin page read that setting automatically.

No new SQL is required for this code update. Do not rerun `categories_setup.sql` for wallpaper management.

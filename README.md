# Akarsh Ki Dukaan — Supabase-connected starter

## Before uploading
1. Open `config.js`.
2. Replace `PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE` with your Supabase **publishable key** (or legacy `anon` key). Do not use a `service_role` or secret key.
3. Upload all files in this folder to the root of your GitHub Pages repository, replacing `index.html` and `style.css`, and adding `config.js`, `store.js`, `admin.html`, and `admin.js`.
4. In Supabase Authentication settings, ensure email/password sign-in is enabled. Use the user you registered as the admin.
5. Open `admin.html`, sign in, and add listings.

## Database
This project expects `public.apps` and `public.admin_users` tables and RLS policies created in Supabase SQL Editor. The `admin_users` table must contain the UUID of your admin auth user. RLS is the actual security boundary; the admin page alone is not security.

## Hosting notes
- GitHub Pages serves the catalogue website, not large APK files.
- `download_url` should be a stable HTTPS download URL.
- Do not add any Supabase service-role/secret key to these files.
- This starter intentionally does not upload APK binary files to Supabase; it saves metadata and links.

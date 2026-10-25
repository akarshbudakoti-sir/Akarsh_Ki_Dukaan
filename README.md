# Akarsh Ki Dukaan — Dynamic Categories + Separate Admin Sections

## Replace these files
Upload and replace these files in the root of your GitHub repository:
- `admin.html`
- `admin.js`
- `store.js`
- `README.md` (this file)

Keep `index.html`, `style.css`, and `config.js` unchanged.

## Admin panel layout
The admin panel now has two separate selectable sections:
- **Add / Edit Apps** — app form and current app listings.
- **Manage Categories** — add, rename, and delete categories.

Only the selected section is shown. Sign out remains at the top of the admin workspace.

## One-time Supabase setup
1. Open the Supabase SQL Editor for your project.
2. Paste and run `categories_setup.sql` once.
3. Commit the replacement files to GitHub.

The SQL policy uses the admin user ID already configured for this project. Confirm it is the correct Supabase admin UID before running the SQL.

## Category behavior
- Adding categories updates the admin category dropdown and store category chips.
- Renaming a category also updates apps assigned to the old category.
- Deleting a category moves its apps to `Apps` before deleting the category.

If category rename/delete reports an `apps` table permission error, verify that your existing Supabase RLS policies allow the signed-in admin to update rows in `public.apps`.

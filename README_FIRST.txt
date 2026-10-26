AKARSH MODSTORE — CATEGORY CLEANUP

Upload these 4 files to the ROOT of your GitHub repository, replacing files with the same names:
- store.js
- admin.js
- admin.html
- style.css

Do NOT replace config.js, index.html, or change any Supabase settings.

Changes:
1. Removes the built-in Games, Music, Learning, Entertainment, and Apps categories from the category selector/list.
2. Uses “Not Specified” for new apps and for apps currently assigned to those old built-in category names.
3. Keeps the existing Manage Categories section so you can add, rename, and delete your own categories.
4. Fixes home-screen More / Show less: collapsed categories are limited to two rows and the More button is kept visible; expanded mode shows all categories.
5. When a custom category is deleted, its apps are moved to “Not Specified”.

After upload, commit the changes and refresh the site. If the browser keeps old files, try an incognito/private tab.

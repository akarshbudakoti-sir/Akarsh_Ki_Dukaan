Akarsh ModStore — admin.js with safe icon cleanup

Upload admin.js to the ROOT of your GitHub repository, replacing the existing admin.js.

This keeps app/category management and adds safe image cleanup:
- When deleting an app, its icon is removed from Supabase Storage only if it belongs to this project's configured bucket and no other app still uses it.
- When replacing/removing an icon during app editing, the old uploaded icon is cleaned up under the same checks.
- External URLs are never deleted.
- If storage cleanup fails, the Admin status reports the problem.

Do not replace config.js, store.js, admin.html, or change Supabase settings.

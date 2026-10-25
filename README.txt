AKARSH KI DUKAAN WEBSITE FILES

Files included: index.html, style.css, store.js, admin.html, admin.js, config.js.

Install:
1. Back up your current GitHub repository first.
2. Replace the matching files in your repository with these files.
3. In Supabase Storage, create a bucket named app-icons and make it public so storefront images can load.
4. Configure Storage policies so only your intended admin account can upload/update/delete. Do not expose a service-role key in config.js.
5. Commit the files to the GitHub Pages branch and wait for deployment.
6. Existing app rows with categories outside Games, Music, Learning, Entertainment, Apps should be recategorized.

The included config.js contains the current public browser key from your existing site. Never publish a Supabase service-role key.
The image uploader expects a public app-icons bucket and limits images to 2 MB.
For production, restrict Storage write policies to the actual admin user/role rather than allowing all authenticated users.

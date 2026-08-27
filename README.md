# Study Hub

A learning platform: courses → chapters → resources (video lectures + notes links), opened in-app.

## Local setup

npm install
npm run dev

Visit http://localhost:3000

.env.local is already filled in with your Supabase project URL and publishable key.

## Deploy (free, ~2 minutes)

1. Push this folder to a GitHub repo
2. Go to vercel.com, sign in with GitHub, "Import Project"
3. Select the repo — Vercel auto-detects Next.js
4. Add environment variables in Vercel's project settings (copy from .env.local):
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
5. Deploy — you'll get a live URL to share with classmates

## Making yourself an admin

New signups default to role student. To promote yourself, run this in the
Supabase SQL editor (Project → SQL Editor):

update profiles set role = 'admin' where id = 'YOUR_USER_ID';

Find your user ID in Authentication → Users after you sign up once in the app.

## How it works

- Sign up / sign in — /login
- Browse courses — / shows all published courses
- Watch/read — /courses/[slug] lists chapters and resources; clicking a
  resource opens it in an in-app modal (YouTube/Vimeo/Drive embed for videos,
  iframe for notes/docs)
- Admin — /admin (visible only to admins) lets you add courses, chapters,
  and resources (paste a video link or notes link)

# Keepsake

Messages, date tickets, bouquets, a photobooth, games and private surprise links.
Next.js 14 + Postgres (Neon) + photo storage (Vercel Blob), hosted on Vercel.

## How it fits together

| Part | Where |
| --- | --- |
| The app (all tools and games) | `public/app.html`, `app.css`, `app.js` |
| Surprise link page, `/surprise/ABC123` | `app/surprise/[id]/route.js` |
| Create, read, delete surprises | `app/api/surprise/...` |
| Photo upload | `app/api/upload/route.js` |
| Nightly cleanup of expired surprises | `app/api/cron/cleanup/route.js`, `vercel.json` |
| Link preview image | `app/og/route.js` |
| Database access | `lib/db.js` (the table is created automatically) |

Without `DATABASE_URL` the app keeps data in memory, so `npm run dev` works with no setup.
In production, photos need Blob storage and surprises need Postgres.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy (about 15 minutes)

1. **Put the code on GitHub.** Create a repository and push this folder to it.
2. **Import it on Vercel.** vercel.com, Add New, Project, pick the repository. Leave the defaults (Framework: Next.js) and press Deploy.
3. **Add the database.** In the project, open Storage, Create Database, choose Neon (Postgres), and connect it to the project. This adds `DATABASE_URL` for you.
4. **Add photo storage.** Storage, Create, Blob, connect it to the project. This adds `BLOB_READ_WRITE_TOKEN`.
5. **Optional settings.** Settings, Environment Variables: add `IP_SALT` (any random string) and `CRON_SECRET` (any random string). Set `NEXT_PUBLIC_SITE_URL` to your final address once you have a domain.
6. **Redeploy** (Deployments, the three dots, Redeploy) so the new variables take effect.
7. **Add your domain.** Settings, Domains, add it and follow the DNS steps Vercel shows.

## Check it works

- Make a surprise with a photo. You should get a link like `/surprise/K7M2QX`.
- Open the link in a private window: the curtain reveal should show the message and photo.
- Press Delete on the creator's side and reload the link. It should say the surprise is not available.
- Send the link in WhatsApp or iMessage and confirm the preview card says "Someone left you a surprise".
- On a phone, open Photobooth and confirm the camera permission prompt appears.

## Before you announce it

- Replace the contact line in `app/privacy/page.js`.
- Vercel's free Hobby plan is for personal, non-commercial use. If you plan to charge or run ads, use a Pro plan.
- Add rate limiting in Vercel Firewall for `/api/upload` and `/api/surprise`. The app already limits each visitor to 15 surprises per hour.
- Add analytics (Vercel Analytics or Plausible) if you want visitor numbers. It is not included, to keep the privacy page simple.

## What is stored

Names, message, optional ticket, bouquet and up to three photos, plus a one-way hash of the creator's IP for rate limiting.
The creator gets a secret edit key (kept in their browser) that is the only way to delete a surprise. Only its hash is stored.
Surprise pages are marked `noindex`, and the link preview never shows the private message.

## Good next steps

A shared bouquet "garden" page, accounts so petals and surprises follow people across devices, reactions and replies on a surprise, scheduled delivery.

# SUNFLOWER WITH tinie — Supabase integration

The existing post-login game screen is now backed by Supabase.

## User flow

1. User is already authenticated.
2. Frontend calls `ensure_game_state()`.
3. `user_missions` controls progress/status.
4. Clicking a mission opens the submission form.
5. User can submit:
   - a post/video URL when applicable
   - multiple screenshots (stream, redeem code, digital purchase, post, other)
   - an optional note
6. `submit_mission()` creates a `pending` submission and DOES NOT complete the mission.
7. Uploaded screenshots are stored in the private `mission-evidence` Storage bucket.
8. Admin reviews the whole submission package.
9. Admin APPROVE -> mission becomes completed, progress reaches target, points are recalculated, next mission unlocks.
10. Admin REJECT -> mission stays incomplete, the admin comment is shown to the user, and the user can submit a new attempt.

## Automatic email

Keep the existing Database Webhook -> `mission-review-email` Edge Function -> Resend workflow from the previous package. The frontend does not send admin-review email directly.

## Setup

Create `.env.local` from `.env.example`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Install:

```bash
npm install
npm run dev
```

Run `supabase/schema-v3.sql` in Supabase SQL Editor, then run
`supabase/storage-mission-evidence.sql`.

### Important assets

The frontend expects these files under `public/assets/`:

- `tinie.png`
- `itunes.jpg`
- `youtube.png`
- `facebook.png`
- `tiktok.png`
- `spotify.png`
- `sunflower-stage-1-seed.png`
- `sunflower-stage-2-sprout.png`
- `sunflower-stage-3-leaves.png`
- `sunflower-stage-4-bud.png`
- `sunflower-stage-5-bloom.png`

The last five are included. Add/replace the Tinie and platform-logo files with your final artwork.

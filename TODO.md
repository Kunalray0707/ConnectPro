# TODO - Upgrade review system

## Plan steps
1. Inspect existing Supabase schema for professionals/profiles, ratings/reviews, and aggregation fields. ✅
2. Add Supabase migration: create `public.professional_reviews` table with required columns + constraints.
3. Add Supabase migration: RLS policies for select/insert.
4. Add Supabase migration: trigger/function to update `public.profiles.average_rating` and `public.profiles.total_reviews` after review insert.
5. Add Supabase migration: ensure realtime publication includes `professional_reviews`.
6. Add frontend data layer: new lib helper to fetch/submit reviews and subscribe to realtime changes.
7. Update `SubmitReviewModal` to submit rating+comment to Supabase.
8. Update `Profile`/`ProfileDetail` pages to load and render DB-backed reviews and show updated aggregates in real time.
9. Remove/retire localStorage-based verified reviews code paths.
10. Build/lint and validate RLS + realtime behavior.


-- ═══════════════════════════════════════════════════════════════
-- EWIND: restrict uploads to the space-media bucket
-- The policy "Authenticated users can upload media" let any signed-in user
-- upload into ANY folder of space-media (including another user's), and
-- since policies for the same command are OR-ed, it overrode the stricter
-- "own folder" policy. Dropping it leaves only the own-folder rule.
-- Applied in production on 2026-09-29. Idempotent.
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;

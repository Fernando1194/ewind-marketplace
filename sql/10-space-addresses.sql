-- ═══════════════════════════════════════════════════════════════
-- EWIND: exact space address in a gated table
-- The address used to be a column of spaces, so any visitor (even signed
-- out) could read the full address of every active space through
-- /rest/v1/spaces. It now lives in space_addresses, readable only by the
-- space's host and by users who requested a quote for that space.
-- Applied in production on 2026-09-29 (the production migration also moved
-- the existing addresses and dropped spaces.address / spaces.cep).
-- Idempotent.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.space_addresses (
  space_id   UUID PRIMARY KEY REFERENCES public.spaces(id) ON DELETE CASCADE,
  address    TEXT,
  cep        TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.spaces DROP COLUMN IF EXISTS address;
ALTER TABLE public.spaces DROP COLUMN IF EXISTS cep;

ALTER TABLE public.space_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "host_manages_own_address" ON public.space_addresses;
CREATE POLICY "host_manages_own_address" ON public.space_addresses
  FOR ALL
  USING (auth.uid() = (SELECT host_id FROM public.spaces WHERE id = space_id))
  WITH CHECK (auth.uid() = (SELECT host_id FROM public.spaces WHERE id = space_id));

DROP POLICY IF EXISTS "quote_requester_can_view_address" ON public.space_addresses;
CREATE POLICY "quote_requester_can_view_address" ON public.space_addresses
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.space_id = space_addresses.space_id AND q.guest_id = auth.uid()
  ));

REVOKE ALL ON public.space_addresses FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.space_addresses TO authenticated;

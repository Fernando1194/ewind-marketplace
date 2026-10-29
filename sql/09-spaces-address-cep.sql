-- ═══════════════════════════════════════════════════════════════
-- EWIND: address and postal code (CEP) for spaces
-- The space form and detail page already use these columns.
-- Idempotent: safe to run more than once.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS cep TEXT;

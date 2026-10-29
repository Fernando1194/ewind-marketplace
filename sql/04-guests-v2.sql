-- ═══════════════════════════════════════════════════════════════
-- EWIND: richer guest data (v2)
-- Adds category, pricing rule, contact and plus-ones.
-- Idempotent: safe to run more than once.
-- ═══════════════════════════════════════════════════════════════

-- Age category: adult | child | baby
ALTER TABLE public.event_guests ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'adult'
  CHECK (category IN ('adult','child','baby'));

-- Pricing rule: full | half | exempt
ALTER TABLE public.event_guests ADD COLUMN IF NOT EXISTS billing TEXT NOT NULL DEFAULT 'full'
  CHECK (billing IN ('full','half','exempt'));

-- Contact
ALTER TABLE public.event_guests ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.event_guests ADD COLUMN IF NOT EXISTS email TEXT;

-- Plus-ones (free text: "Maria (adult), João (child)")
ALTER TABLE public.event_guests ADD COLUMN IF NOT EXISTS companions TEXT;

-- Group/side (e.g. "Bride's family", "Friends"), optional, useful for organizing
ALTER TABLE public.event_guests ADD COLUMN IF NOT EXISTS guest_group TEXT;

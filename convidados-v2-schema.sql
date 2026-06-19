-- ═══════════════════════════════════════════════════════════════
-- EWIND — Convidados enriquecidos (v2)
-- Adiciona categoria, regra de cobrança, contato e acompanhantes.
-- Idempotente: seguro rodar mais de uma vez.
-- ═══════════════════════════════════════════════════════════════

-- Categoria etária: adult | child | baby
ALTER TABLE public.event_guests ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'adult'
  CHECK (category IN ('adult','child','baby'));

-- Regra de cobrança: full (inteira) | half (meia) | exempt (isento)
ALTER TABLE public.event_guests ADD COLUMN IF NOT EXISTS billing TEXT NOT NULL DEFAULT 'full'
  CHECK (billing IN ('full','half','exempt'));

-- Contato
ALTER TABLE public.event_guests ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.event_guests ADD COLUMN IF NOT EXISTS email TEXT;

-- Acompanhantes (texto livre: "Maria (adulto), João (criança)")
ALTER TABLE public.event_guests ADD COLUMN IF NOT EXISTS companions TEXT;

-- Grupo/lado (ex: "Família da noiva", "Amigos") — opcional, útil p/ organizar
ALTER TABLE public.event_guests ADD COLUMN IF NOT EXISTS guest_group TEXT;

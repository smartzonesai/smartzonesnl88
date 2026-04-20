-- Feature 1: Richer Store Input Fields
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS competitors TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS focus_areas TEXT[];
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS price_segment TEXT;

-- Feature 2: Tone of Voice Configuration
CREATE TABLE IF NOT EXISTS tone_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  system_prompt_prefix TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO tone_config (name, description, system_prompt_prefix, is_default) VALUES
  ('Formeel', 'Zakelijke, professionele communicatie', 'Je communiceert op een formele, zakelijke manier. Gebruik volledige zinnen, vermijd informeel taalgebruik, en spreek de lezer aan met "u".', false),
  ('Informeel', 'Vriendelijk en toegankelijk', 'Je communiceert op een informele, vriendelijke manier. Gebruik "je" en "jij", wees direct en toegankelijk. Schrijf alsof je tegen een vriend praat die een winkel heeft.', true),
  ('Zakelijk-warm', 'Professioneel maar menselijk', 'Je communiceert professioneel maar warm en menselijk. Gebruik "u" maar wees niet stijf. Toon begrip voor de uitdagingen van de winkelier en geef concrete, praktische adviezen.', false);

-- Remove ambiguous exercises where both Deutschland and Frankfurt appear in options (generic location ambiguity)
DELETE FROM public.opendeutsch_exercises_database
WHERE options @> '["Deutschland", "Frankfurt"]'::jsonb;

-- Remove specific ambiguous exercise found by script: "Mein Lieblingsplatz ist..." -> Options: [Beach, Park, Kino, Bücher]
DELETE FROM public.opendeutsch_exercises_database
WHERE id = '8237e036-174d-47c2-8460-98ea995d64dd';

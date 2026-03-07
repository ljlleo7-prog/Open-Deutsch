
-- Remove duplicate entries based on 'german' column, keeping the one with the smallest id (earliest creation)
DELETE FROM public.opendeutsch_sentence_database
WHERE id IN (
    SELECT id
    FROM (
        SELECT id, ROW_NUMBER() OVER (partition BY german ORDER BY id) AS row_num
        FROM public.opendeutsch_sentence_database
    ) t
    WHERE t.row_num > 1
);

-- Now add the unique constraint safely
ALTER TABLE public.opendeutsch_sentence_database 
ADD CONSTRAINT opendeutsch_sentence_database_german_key UNIQUE (german);

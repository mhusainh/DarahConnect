BEGIN;

ALTER TABLE public.blood_requests
ADD COLUMN IF NOT EXISTS event_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS slots_available BIGINT,
ADD COLUMN IF NOT EXISTS slots_booked BIGINT,
ADD COLUMN IF NOT EXISTS event_type VARCHAR(255);

COMMIT;
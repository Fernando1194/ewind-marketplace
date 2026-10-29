-- Nightly reset of the demo database (pg_cron), 03:00 Brasília time.
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('demo-nightly-reset', '0 6 * * *', 'SELECT demo.reset()');

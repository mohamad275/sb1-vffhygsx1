-- Create function to reset daily tables
CREATE OR REPLACE FUNCTION reset_daily_tables() RETURNS void AS $$
BEGIN
    -- Clear daily productions
    DELETE FROM daily_productions;
    
    -- Clear daily sales
    DELETE FROM daily_sales;
    
    -- Clear daily purchases
    DELETE FROM daily_purchases;
    
    -- Clear daily notes
    DELETE FROM daily_notes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create cron job to reset tables at midnight
SELECT cron.schedule(
    'reset-daily-tables',  -- unique job name
    '0 0 * * *',          -- midnight every day (cron expression)
    $$SELECT reset_daily_tables();$$
);
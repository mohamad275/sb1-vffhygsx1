/*
  # Add Transaction Support Functions
  
  1. New Functions
    - start_transaction: Start a new transaction
    - commit_current_transaction: Commit the current transaction
    - rollback_current_transaction: Rollback the current transaction
*/

-- Create transaction helper functions
CREATE OR REPLACE FUNCTION start_transaction()
RETURNS void AS $$
DECLARE
  _tx_id bigint;
BEGIN
  -- Get current transaction ID
  SELECT txid_current() INTO _tx_id;
  
  -- If no transaction is active, start one
  IF _tx_id IS NULL THEN
    PERFORM dblink_exec('dbname=' || current_database(), 'BEGIN');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION commit_current_transaction()
RETURNS void AS $$
DECLARE
  _tx_id bigint;
BEGIN
  -- Get current transaction ID
  SELECT txid_current() INTO _tx_id;
  
  -- If transaction is active, commit it
  IF _tx_id IS NOT NULL THEN
    PERFORM dblink_exec('dbname=' || current_database(), 'COMMIT');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rollback_current_transaction()
RETURNS void AS $$
DECLARE
  _tx_id bigint;
BEGIN
  -- Get current transaction ID
  SELECT txid_current() INTO _tx_id;
  
  -- If transaction is active, roll it back
  IF _tx_id IS NOT NULL THEN
    PERFORM dblink_exec('dbname=' || current_database(), 'ROLLBACK');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS dblink;
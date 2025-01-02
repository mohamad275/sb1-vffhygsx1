-- Create function to update inventory on sales
CREATE OR REPLACE FUNCTION update_inventory_on_sale() RETURNS trigger AS $$
BEGIN
    -- Update remaining inventory
    UPDATE remaining_inventory
    SET 
        quantity = quantity - NEW.quantity,
        updated_at = now()
    WHERE mix_id = NEW.mix_id 
    AND bag_size = NEW.bag_size;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for sales tables
CREATE TRIGGER update_inventory_on_sale_insert
    AFTER INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_on_sale();

CREATE TRIGGER update_inventory_on_daily_sale_insert
    AFTER INSERT ON daily_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_on_sale();

-- Add validation function
CREATE OR REPLACE FUNCTION validate_sale() RETURNS trigger AS $$
DECLARE
    available_quantity integer;
BEGIN
    -- Get available quantity
    SELECT quantity INTO available_quantity
    FROM remaining_inventory
    WHERE mix_id = NEW.mix_id 
    AND bag_size = NEW.bag_size;

    -- Check if enough inventory exists
    IF available_quantity IS NULL OR available_quantity < NEW.quantity THEN
        RAISE EXCEPTION 'لا توجد كمية كافية في المخزون';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add validation triggers
CREATE TRIGGER validate_sale_before_insert
    BEFORE INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION validate_sale();

CREATE TRIGGER validate_daily_sale_before_insert
    BEFORE INSERT ON daily_sales
    FOR EACH ROW
    EXECUTE FUNCTION validate_sale();
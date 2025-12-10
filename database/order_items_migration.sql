-- Make product_id nullable and relax FK to avoid failures when product is not in DB

ALTER TABLE order_items DROP FOREIGN KEY order_items_ibfk_2;
ALTER TABLE order_items MODIFY product_id INT NULL;
ALTER TABLE order_items
  ADD CONSTRAINT order_items_ibfk_2
  FOREIGN KEY (product_id) REFERENCES products(id)
  ON DELETE SET NULL;


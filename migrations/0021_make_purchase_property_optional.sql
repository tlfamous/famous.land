-- A purchase may apply across the Airbnb operation. Property assignment is
-- optional, but remains available for home-specific maintenance and assets.
create table home_purchases_next (
  id text primary key,
  home_id text references homes(id) on delete set null,
  item_name text not null,
  description text,
  sku text,
  category text not null check (
    category in ('linens', 'furnishings', 'supplies', 'appliance', 'maintenance', 'utilities', 'other')
  ),
  vendor_name text not null,
  vendor_url text,
  vendor_order_number text,
  receipt_url text,
  purchase_date text not null,
  quantity integer not null default 1 check (quantity > 0),
  total_cents integer not null check (total_cents >= 0),
  sales_tax_cents integer,
  shipping_cents integer,
  notes text,
  created_at text not null,
  updated_at text not null
);

insert into home_purchases_next (
  id, home_id, item_name, description, sku, category, vendor_name, vendor_url,
  vendor_order_number, receipt_url, purchase_date, quantity, total_cents,
  sales_tax_cents, shipping_cents, notes, created_at, updated_at
)
select
  id, home_id, item_name, description, sku, category, vendor_name, vendor_url,
  vendor_order_number, receipt_url, purchase_date, quantity, total_cents,
  sales_tax_cents, shipping_cents, notes, created_at, updated_at
from home_purchases;

drop table home_purchases;
alter table home_purchases_next rename to home_purchases;

create index home_purchases_home_date_idx
  on home_purchases (home_id, purchase_date desc, created_at desc);
create index home_purchases_tax_year_idx
  on home_purchases (purchase_date, category);

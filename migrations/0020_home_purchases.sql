-- Private purchase ledger for tax records and later reordering. Amounts are
-- stored in cents to avoid decimal rounding differences between D1 and CSV.
create table if not exists home_purchases (
  id text primary key,
  home_id text not null references homes(id) on delete cascade,
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

create index if not exists home_purchases_home_date_idx
  on home_purchases (home_id, purchase_date desc, created_at desc);
create index if not exists home_purchases_tax_year_idx
  on home_purchases (purchase_date, category);

-- Some historical order evidence identifies the item and purchase date but does
-- not include the amount paid. Preserve that distinction instead of treating an
-- unknown amount as a zero-dollar purchase.
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
  total_cents integer check (total_cents is null or total_cents >= 0),
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

insert or ignore into home_purchases (
  id, home_id, item_name, description, sku, category, vendor_name, vendor_url,
  purchase_date, quantity, total_cents, notes, created_at, updated_at
) values
  (
    'purchase_lh2_schlage_be499_2024',
    'home_lh2',
    'Schlage Encode Plus Century Smart WiFi Deadbolt',
    'Smart keyless-entry touchscreen deadbolt in aged bronze; installed at 63 Pine Eden.',
    'BE499WBCEN716',
    'other',
    'Amazon',
    'https://www.schlage.com/en/home/products/BE499WBCENFFF.html',
    '2024-02-19',
    1,
    null,
    'Purchase amount and Amazon order number were not visible in the supplied order screenshot. Manufacturer reference link recorded.',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'purchase_lh3_yale_yrm276_2025',
    'home_lh3',
    'Yale Assure Lock for Andersen Patio Doors',
    'Wi-Fi and Bluetooth smart lock in white; installed at 25 Sunny Cove.',
    'YRM276-CB1-WHT',
    'other',
    'Amazon',
    'https://shopyalehome.com/products/assure-lock-for-andersen-patio-doors-with-wi-fi-and-bluetooth',
    '2025-11-04',
    1,
    null,
    'Purchase amount and Amazon order number were not visible in the supplied order screenshot. Manufacturer reference link recorded.',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );

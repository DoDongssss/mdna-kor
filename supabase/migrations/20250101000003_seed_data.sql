-- 003_seed_data.sql

insert into members (name, nickname, contact_number, is_active) values
  ('Juan dela Cruz',   'JDC',   '09171234567', true),
  ('Maria Santos',     'Mari',  '09181234567', true),
  ('Pedro Reyes',      'Pete',  '09191234567', true),
  ('Ana Gonzales',     'Ana',   '09201234567', true),
  ('Carlos Mendoza',   'Carl',  '09211234567', true),
  ('Rosa Villanueva',  'Rose',  '09221234567', true),
  ('Miguel Torres',    'Migz',  '09231234567', true),
  ('Liza Ramos',       'Liz',   '09241234567', false);

insert into events (title, type, date, description, location) values
  ('Eyeball #1 — Koronadal', 'meetup',       current_date + 7,  'Monthly meetup.', 'Koronadal City'),
  ('Charity Ride — GenSan',  'charity_ride', current_date + 21, 'Charity ride.',   'General Santos City'),
  ('Club Anniversary Ride',  'other',        current_date + 60, '5th anniversary.','Mt. Matutum');
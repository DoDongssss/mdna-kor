drop view if exists public.fund_summary;

create view public.fund_summary
with (security_invoker = true)
as
select
  (select coalesce(sum(amount), 0) from contributions) as total_contributions,
  (select coalesce(sum(amount), 0) from expenses)       as total_expenses,
  (select coalesce(sum(amount), 0) from contributions) -
  (select coalesce(sum(amount), 0) from expenses)       as net_balance;

drop view if exists public.eyeball_summary;

create view public.eyeball_summary
with (security_invoker = true)
as
select
  e.id,
  e.title,
  e.date,
  e.location,
  count(distinct a.member_id) filter (where a.status = 'present') as present_count,
  count(distinct a.member_id) filter (where a.status = 'absent')  as absent_count,
  coalesce(sum(c.amount), 0)                                       as total_collected
from eyeballs e
left join attendance    a on a.eyeball_id = e.id
left join contributions c on c.eyeball_id = e.id
group by e.id, e.title, e.date, e.location;
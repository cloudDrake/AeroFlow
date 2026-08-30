insert into public.tenants (slug, name, region)
values ('northstar', 'Northstar Air', 'North America')
on conflict (slug) do nothing;

-- insert into public.tenant_memberships (tenant_id, user_id, role)
-- select id, auth.uid(), 'owner'
-- from public.tenants
-- where slug = 'northstar'
-- on conflict (tenant_id, user_id) do nothing;

insert into public.tenant_memberships (tenant_id, user_id, role)
select t.id, 'c386d610-d150-4a06-bad8-e9d392ca4b05', 'owner'
from public.tenants t
where t.slug in ('northstar', 'atlantic')
on conflict (tenant_id, user_id) do nothing;
-- Set all existing users to pro plan
update public.profiles set plan = 'pro' where plan = 'free';

-- Change default for future users
alter table public.profiles alter column plan set default 'pro';

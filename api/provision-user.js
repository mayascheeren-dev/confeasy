-- CONFEASY — banco inicial
-- Execute este arquivo no SQL Editor do seu projeto Supabase.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text default '',
  business_name text default 'Minha Confeitaria',
  active boolean not null default true,
  expires_at date,
  created_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  yield_units text,
  cost numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_name text not null,
  item_name text not null,
  delivery_date date,
  value numeric(12,2) not null default 0,
  status text not null default 'Pendente',
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  value numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  quantity numeric(12,3) not null default 0,
  unit text not null default 'un',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,email,full_name,business_name)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''),coalesce(new.raw_user_meta_data->>'business_name','Minha Confeitaria'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.orders enable row level security;
alter table public.expenses enable row level security;
alter table public.ingredients enable row level security;

-- Perfis: o próprio usuário pode ler/atualizar seu perfil.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Dados do usuário: cada conta só acessa suas próprias linhas.

drop policy if exists "recipes_all_own" on public.recipes;
create policy "recipes_all_own" on public.recipes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "orders_all_own" on public.orders;
create policy "orders_all_own" on public.orders for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "expenses_all_own" on public.expenses;
create policy "expenses_all_own" on public.expenses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "ingredients_all_own" on public.ingredients;
create policy "ingredients_all_own" on public.ingredients for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Criação automática de profile para novos usuários.

-- Migration: questions (Isca Perguntas)
-- Rollback: drop table public.questions;

-- ---------------------------------------------------------------------------
-- Tabela de perguntas enviadas pelo público (Isca 3 do plano de iscas)
-- Uma pessoa pode enviar VÁRIAS perguntas — email NÃO é unique.
-- ---------------------------------------------------------------------------
create table if not exists public.questions (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  email      text not null,
  cidade     text not null,
  pergunta   text not null,
  created_at timestamptz not null default now()
);

create index if not exists questions_created_at_idx
  on public.questions (created_at);

-- ---------------------------------------------------------------------------
-- RLS — acesso restrito a service_role (server-side only)
-- ---------------------------------------------------------------------------
alter table public.questions enable row level security;

create policy "service_role_all_questions"
  on public.questions
  for all
  to service_role
  using (true)
  with check (true);

create extension if not exists pgcrypto;

create schema if not exists private;

/* ============================================================
   PROFILES / ROLES
   ============================================================ */
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  role text not null default 'user' check (role in ('user','admin')),
  total_points integer not null default 0 check (total_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user','admin'));

/* ============================================================
   MISSIONS
   ============================================================ */
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  action text not null,
  description text,
  hint text,
  target integer not null check (target > 0),
  points integer not null default 0 check (points >= 0),
  logo_url text,
  sort_order integer not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.missions (slug,name,action,description,hint,target,points,logo_url,sort_order)
values
('itunes','iTUNES','GIEO MẦM','3 redeem code · 3 account khác nhau','Gieo những hạt giống đầu tiên để bắt đầu hành trình.',3,10,'/assets/itunes.jpg',1),
('youtube','YOUTUBE','TƯỚI NƯỚC','3 Like + 3 Comment · account đã subscribe','Mỗi lượt tương tác là một giọt nước giúp mầm cây lớn lên.',3,10,'/assets/youtube.png',2),
('facebook','FACEBOOK','BẮT SÂU BỌ','3 post · đủ Hashtag','Dọn sạch những chú sâu để cây khỏe mạnh.',3,10,'/assets/facebook.png',3),
('tiktok','TIKTOK','BÓN PHÂN','3 video · Sound Official + Hashtag','Thêm dinh dưỡng để cây vươn cao và nhiều lá hơn.',3,10,'/assets/tiktok.png',4),
('spotify','SPOTIFY','HOA NỞ','15 streams / ngày / account','Hoàn thành chặng cuối để đánh thức bông hướng dương.',15,10,'/assets/spotify.png',5)
on conflict (slug) do update set
  name=excluded.name,
  action=excluded.action,
  description=excluded.description,
  hint=excluded.hint,
  target=excluded.target,
  points=excluded.points,
  logo_url=excluded.logo_url,
  sort_order=excluded.sort_order;

/* ============================================================
   PER-USER MISSION STATE
   Progress changes only after ADMIN APPROVES a submission.
   ============================================================ */
create table if not exists public.user_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  progress integer not null default 0 check (progress >= 0),
  status text not null default 'locked',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, mission_id)
);

alter table public.user_missions drop constraint if exists user_missions_status_check;
alter table public.user_missions add constraint user_missions_status_check
  check (status in ('locked','in_progress','pending_review','completed'));

/* ============================================================
   SUBMISSIONS
   One submission = one reviewable attempt.
   Rejected submissions stay visible and the user can submit again.
   ============================================================ */
create table if not exists public.mission_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  attempt_no integer not null default 1 check (attempt_no > 0),

  -- Optional link to the user's post/video.
  post_url text,

  -- Optional note for admin.
  note text,

  status text not null default 'pending',
  admin_comment text,
  reviewed_by uuid references auth.users(id) on delete set null,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.mission_submissions drop constraint if exists mission_submissions_status_check;
alter table public.mission_submissions add constraint mission_submissions_status_check
  check (status in ('pending','approved','rejected'));

create unique index if not exists mission_submissions_one_pending
  on public.mission_submissions(user_id, mission_id)
  where status = 'pending';

create unique index if not exists mission_submissions_attempt_unique
  on public.mission_submissions(user_id, mission_id, attempt_no);

create index if not exists idx_mission_submissions_user
  on public.mission_submissions(user_id, submitted_at desc);

create index if not exists idx_mission_submissions_status
  on public.mission_submissions(status, submitted_at desc);

/*
  A submission can contain multiple screenshots.
  Actual files live in the private Storage bucket
  `mission-evidence`.
*/
create table if not exists public.submission_evidence (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.mission_submissions(id) on delete cascade,
  evidence_type text not null
    check (evidence_type in (
      'post_screenshot',
      'stream_screenshot',
      'redeem_screenshot',
      'digital_purchase_screenshot',
      'other_screenshot'
    )),
  storage_bucket text not null default 'mission-evidence',
  storage_path text not null,
  original_filename text,
  mime_type text,
  file_size bigint check (file_size is null or file_size >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_submission_evidence_submission
  on public.submission_evidence(submission_id, created_at);


/* Existing audit table retained for historical actions. */
create table if not exists public.mission_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  action_type text not null default 'submission_review',
  quantity integer not null default 1 check (quantity > 0),
  proof_url text,
  status text not null default 'approved' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_mission_actions_user on public.mission_actions(user_id);

/* ============================================================
   UPDATED-AT TRIGGER
   ============================================================ */
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists user_missions_updated_at on public.user_missions;
create trigger user_missions_updated_at
before update on public.user_missions
for each row execute function public.set_updated_at();

/* ============================================================
   GAME STATE INITIALIZATION
   ============================================================ */
create or replace function public.ensure_game_state()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.profiles(id, username)
  values (
    uid,
    coalesce(
      auth.jwt()->'user_metadata'->>'user_name',
      auth.jwt()->'user_metadata'->>'full_name',
      split_part(coalesce(auth.jwt()->>'email',''), '@', 1),
      'PLAYER'
    )
  )
  on conflict (id) do nothing;

  insert into public.user_missions(user_id, mission_id, progress, status)
  select
    uid,
    m.id,
    0,
    case when m.sort_order = 1 then 'in_progress' else 'locked' end
  from public.missions m
  where m.is_active = true
  on conflict (user_id, mission_id) do nothing;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'full_name',
      split_part(coalesce(new.email,''), '@', 1),
      'PLAYER'
    )
  )
  on conflict (id) do nothing;

  insert into public.user_missions(user_id, mission_id, progress, status)
  select
    new.id,
    m.id,
    0,
    case when m.sort_order = 1 then 'in_progress' else 'locked' end
  from public.missions m
  where m.is_active = true
  on conflict (user_id, mission_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

/* ============================================================
   ADMIN CHECK
   Kept in private schema; callers cannot promote themselves.
   ============================================================ */
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;
grant usage on schema private to authenticated;

/* ============================================================
   ADD EVIDENCE METADATA
   User may attach multiple screenshot files to a pending submission.
   ============================================================ */
create or replace function public.add_submission_evidence(
  p_submission_id uuid,
  p_evidence_type text,
  p_storage_path text,
  p_original_filename text default null,
  p_mime_type text default null,
  p_file_size bigint default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  result_id uuid;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_evidence_type not in (
    'post_screenshot',
    'stream_screenshot',
    'redeem_screenshot',
    'digital_purchase_screenshot',
    'other_screenshot'
  ) then
    raise exception 'Invalid evidence type';
  end if;

  if not exists (
    select 1
    from public.mission_submissions s
    where s.id = p_submission_id
      and s.user_id = uid
      and s.status = 'pending'
  ) then
    raise exception 'Submission not found or not pending';
  end if;

  insert into public.submission_evidence(
    submission_id,
    evidence_type,
    storage_bucket,
    storage_path,
    original_filename,
    mime_type,
    file_size
  )
  values (
    p_submission_id,
    p_evidence_type,
    'mission-evidence',
    p_storage_path,
    p_original_filename,
    p_mime_type,
    p_file_size
  )
  returning id into result_id;

  return result_id;
end;
$$;

revoke all on function public.add_submission_evidence(uuid,text,text,text,text,bigint) from public;
grant execute on function public.add_submission_evidence(uuid,text,text,text,text,bigint) to authenticated;

/* ============================================================
   SCORE
   ============================================================ */
create or replace function public.recalculate_my_score()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  s integer;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(sum(m.points), 0)
  into s
  from public.user_missions um
  join public.missions m on m.id = um.mission_id
  where um.user_id = uid
    and um.status = 'completed';

  update public.profiles
  set total_points = s
  where id = uid;

  return s;
end;
$$;

/* ============================================================
   USER SUBMIT
   Does NOT complete the mission or add points.
   ============================================================ */
create or replace function public.submit_mission(
  p_mission_slug text,
  p_post_url text default null,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  m public.missions%rowtype;
  um public.user_missions%rowtype;
  next_attempt integer;
  submission_id uuid;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  perform public.ensure_game_state();

  select * into m
  from public.missions
  where slug = p_mission_slug
    and is_active = true;

  if not found then
    raise exception 'Mission not found';
  end if;

  select * into um
  from public.user_missions
  where user_id = uid
    and mission_id = m.id
  for update;

  if um.id is null then
    raise exception 'Mission state not found';
  end if;

  if um.status = 'locked' then
    raise exception 'Mission is locked. Complete the previous mission first.';
  end if;

  if um.status = 'completed' then
    raise exception 'Mission already completed.';
  end if;

  if exists (
    select 1
    from public.mission_submissions s
    where s.user_id = uid
      and s.mission_id = m.id
      and s.status = 'pending'
  ) then
    raise exception 'A submission is already waiting for admin review.';
  end if;

  select coalesce(max(attempt_no), 0) + 1
  into next_attempt
  from public.mission_submissions
  where user_id = uid
    and mission_id = m.id;

  insert into public.mission_submissions(
    user_id,
    mission_id,
    attempt_no,
    post_url,
    note,
    status
  )
  values (
    uid,
    m.id,
    next_attempt,
    nullif(trim(p_post_url), ''),
    nullif(trim(p_note), ''),
    'pending'
  )
  returning id into submission_id;

  update public.user_missions
  set status = 'pending_review'
  where id = um.id;

  return jsonb_build_object(
    'submission_id', submission_id,
    'mission', m.slug,
    'status', 'pending',
    'attempt_no', next_attempt,
    'progress', um.progress,
    'target', m.target
  );
end;
$$;

/* ============================================================
   ADMIN REVIEW
   approved:
     - mission becomes completed
     - progress becomes target
     - next mission unlocks
     - points are recalculated
   rejected:
     - progress remains unchanged
     - mission becomes in_progress again
     - user can submit again
   ============================================================ */
create or replace function public.review_mission_submission(
  p_submission_id uuid,
  p_decision text,
  p_comment text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  admin_uid uuid := auth.uid();
  s public.mission_submissions%rowtype;
  m public.missions%rowtype;
  um public.user_missions%rowtype;
  new_score integer;
  next_mission_id uuid;
begin
  if admin_uid is null then
    raise exception 'Not authenticated';
  end if;

  if not private.is_admin() then
    raise exception 'Admin access required.';
  end if;

  if p_decision not in ('approved','rejected') then
    raise exception 'Decision must be approved or rejected.';
  end if;

  select * into s
  from public.mission_submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception 'Submission not found.';
  end if;

  if s.status <> 'pending' then
    raise exception 'Submission has already been reviewed.';
  end if;

  select * into m
  from public.missions
  where id = s.mission_id;

  select * into um
  from public.user_missions
  where user_id = s.user_id
    and mission_id = s.mission_id
  for update;

  update public.mission_submissions
  set status = p_decision,
      admin_comment = nullif(trim(p_comment), ''),
      reviewed_by = admin_uid,
      reviewed_at = now()
  where id = s.id;

  if p_decision = 'approved' then
    /* Approval makes the entire submitted mission complete. */
    update public.user_missions
    set progress = m.target,
        status = 'completed',
        completed_at = coalesce(completed_at, now())
    where id = um.id;

    select id into next_mission_id
    from public.missions
    where is_active = true
      and sort_order = m.sort_order + 1
    limit 1;

    if next_mission_id is not null then
      update public.user_missions
      set status = 'in_progress'
      where user_id = s.user_id
        and mission_id = next_mission_id
        and status = 'locked';
    end if;

    insert into public.mission_actions(
      user_id,
      mission_id,
      action_type,
      quantity,
      proof_url,
      status
    )
    values (
      s.user_id,
      s.mission_id,
      'submission_approved',
      m.target,
      s.post_url,
      'approved'
    );
  else
    /* Rejection does not remove history; it simply permits resubmission. */
    update public.user_missions
    set status = 'in_progress'
    where id = um.id;

    insert into public.mission_actions(
      user_id,
      mission_id,
      action_type,
      quantity,
      proof_url,
      status
    )
    values (
      s.user_id,
      s.mission_id,
      'submission_rejected',
      1,
      s.post_url,
      'rejected'
    );
  end if;

  /* Recalculate the reviewed user's score inside the same transaction. */
  select coalesce(sum(mm.points), 0)
  into new_score
  from public.user_missions uum
  join public.missions mm on mm.id = uum.mission_id
  where uum.user_id = s.user_id
    and uum.status = 'completed';

  update public.profiles
  set total_points = new_score
  where id = s.user_id;

  return jsonb_build_object(
    'submission_id', s.id,
    'mission', m.slug,
    'decision', p_decision,
    'comment', nullif(trim(p_comment), ''),
    'score', new_score
  );
end;
$$;

/* ============================================================
   RESET — useful for testing only
   ============================================================ */
create or replace function public.reset_my_game()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  first_id uuid;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select id into first_id
  from public.missions
  where sort_order = 1
    and is_active = true
  limit 1;

  delete from public.mission_actions where user_id = uid;
  delete from public.mission_submissions where user_id = uid;

  update public.user_missions
  set progress = 0,
      status = case when mission_id = first_id then 'in_progress' else 'locked' end,
      completed_at = null
  where user_id = uid;

  update public.profiles
  set total_points = 0
  where id = uid;
end;
$$;

/* ============================================================
   RLS
   ============================================================ */
alter table public.profiles enable row level security;
alter table public.missions enable row level security;
alter table public.user_missions enable row level security;
alter table public.mission_submissions enable row level security;
alter table public.mission_actions enable row level security;

/* Public grants are restricted; writes happen via RPCs above. */
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.missions from anon, authenticated;
revoke all on table public.user_missions from anon, authenticated;
revoke all on table public.mission_submissions from anon, authenticated;
revoke all on table public.mission_actions from anon, authenticated;

grant select on public.profiles to authenticated;
grant select on public.missions to authenticated;
grant select on public.user_missions to authenticated;
grant select on public.mission_submissions to authenticated;
grant select on public.mission_actions to authenticated;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.is_admin())
);

drop policy if exists missions_read_authenticated on public.missions;
create policy missions_read_authenticated
on public.missions
for select
to authenticated
using (is_active = true);

drop policy if exists user_missions_select_own_or_admin on public.user_missions;
create policy user_missions_select_own_or_admin
on public.user_missions
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
);

drop policy if exists mission_submissions_select_own_or_admin on public.mission_submissions;
create policy mission_submissions_select_own_or_admin
on public.mission_submissions
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
);

drop policy if exists mission_actions_select_own_or_admin on public.mission_actions;
create policy mission_actions_select_own_or_admin
on public.mission_actions
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
);

/* No browser role may update its own role/progress/submission status. */
revoke all on function public.ensure_game_state() from public;
grant execute on function public.ensure_game_state() to authenticated;

revoke all on function public.recalculate_my_score() from public;
grant execute on function public.recalculate_my_score() to authenticated;

revoke all on function public.submit_mission(text,text,text) from public;
grant execute on function public.submit_mission(text,text,text) to authenticated;

revoke all on function public.review_mission_submission(uuid,text,text) from public;
grant execute on function public.review_mission_submission(uuid,text,text) to authenticated;

revoke all on function public.reset_my_game() from public;
grant execute on function public.reset_my_game() to authenticated;


/* ============================================================
   SUBMISSION EVIDENCE RLS
   Users may read their own evidence metadata; admins may read all.
   Writes are done through add_submission_evidence RPC.
   ============================================================ */
alter table public.submission_evidence enable row level security;

revoke all on table public.submission_evidence from anon, authenticated;
grant select on public.submission_evidence to authenticated;

drop policy if exists submission_evidence_select_own_or_admin on public.submission_evidence;
create policy submission_evidence_select_own_or_admin
on public.submission_evidence
for select
to authenticated
using (
  exists (
    select 1
    from public.mission_submissions s
    where s.id = submission_evidence.submission_id
      and (
        s.user_id = (select auth.uid())
        or (select private.is_admin())
      )
  )
);

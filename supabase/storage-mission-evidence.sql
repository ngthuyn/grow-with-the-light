/*
  Private evidence bucket.
  Path convention:
    <user_uuid>/<draft_uuid>/<filename>
*/

insert into storage.buckets (id, name, public)
values ('mission-evidence', 'mission-evidence', false)
on conflict (id) do update set public = false;

drop policy if exists "users upload own mission evidence" on storage.objects;
create policy "users upload own mission evidence"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'mission-evidence'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "users and admins read mission evidence" on storage.objects;
create policy "users and admins read mission evidence"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'mission-evidence'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or (select private.is_admin())
  )
);

drop policy if exists "users delete own mission evidence" on storage.objects;
create policy "users delete own mission evidence"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'mission-evidence'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

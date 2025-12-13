-- Create Meetings Table
create table if not exists meetings (
  id uuid default gen_random_uuid() primary key,
  meeting_id text not null unique,
  password text not null,
  host_id uuid not null, -- references auth.users(id)
  livekit_room text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default timezone('utc'::text, now() + interval '24 hours') not null
);

-- Enable RLS
alter table meetings enable row level security;

-- Policies
create policy "Anyone can read active meetings"
  on meetings for select
  using (true);

create policy "Authenticated users can insert meetings"
  on meetings for insert
  with check (auth.uid() = host_id);

create policy "Hosts can update their meetings"
  on meetings for update
  using (auth.uid() = host_id);

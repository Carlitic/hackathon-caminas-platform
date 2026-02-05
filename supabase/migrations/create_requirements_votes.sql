-- Create Requirements table
create table if not exists requirements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  tag text not null default 'General',
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- Enable RLS on requirements
alter table requirements enable row level security;

-- Policy: Public read access
create policy "Requirements are viewable by everyone" 
on requirements for select 
using (true);

-- Policy: Teachers can insert their own requirements
create policy "Teachers can insert their own requirements" 
on requirements for insert 
with check (auth.uid() = teacher_id);

-- Policy: Teachers can delete their own requirements
create policy "Teachers can delete their own requirements" 
on requirements for delete 
using (auth.uid() = teacher_id);

-- Create Votes table
create table if not exists votes (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  teacher_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  constraint unique_teacher_vote unique (teacher_id) -- Only 1 vote per teacher
);

-- Enable RLS on votes
alter table votes enable row level security;

-- Policy: Public read (for counts)
create policy "Votes are viewable by everyone" 
on votes for select 
using (true);

-- Policy: Teachers can insert their own vote
create policy "Teachers can cast vote" 
on votes for insert 
with check (auth.uid() = teacher_id);

-- Policy: Teachers can update their own vote (change vote)
create policy "Teachers can change vote" 
on votes for update 
using (auth.uid() = teacher_id);

-- Function to get vote count on teams (already done in lib via join, but good to have constraint)

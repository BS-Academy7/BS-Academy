-- Add drive_folder columns to programs
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS drive_folder_id text;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS drive_folder_url text;

-- Add drive_folder columns to profiles (for students and instructors)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS drive_folder_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS drive_folder_url text;

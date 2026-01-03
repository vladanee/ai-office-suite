-- Add foreign key from office_members to profiles for the join query
ALTER TABLE public.office_members
ADD CONSTRAINT office_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
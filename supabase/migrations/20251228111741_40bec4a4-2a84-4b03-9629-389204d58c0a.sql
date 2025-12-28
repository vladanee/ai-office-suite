-- Create offices table (tenants)
CREATE TABLE public.offices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  current_office_id UUID REFERENCES public.offices(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create office_members junction table for multi-tenant access
CREATE TABLE public.office_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID NOT NULL REFERENCES public.offices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(office_id, user_id)
);

-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID NOT NULL REFERENCES public.offices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personas table
CREATE TABLE public.personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID NOT NULL REFERENCES public.offices(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT DEFAULT '🤖',
  status TEXT DEFAULT 'idle' CHECK (status IN ('active', 'busy', 'idle')),
  skills TEXT[] DEFAULT '{}',
  system_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflows table
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID NOT NULL REFERENCES public.offices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB DEFAULT '[]',
  edges JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow_runs table
CREATE TABLE public.workflow_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  office_id UUID NOT NULL REFERENCES public.offices(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  current_node_id TEXT,
  result JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;

-- Create function to check office membership
CREATE OR REPLACE FUNCTION public.is_office_member(office_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.office_members
    WHERE office_id = office_uuid AND user_id = auth.uid()
  )
$$;

-- Create function to check office admin/owner
CREATE OR REPLACE FUNCTION public.is_office_admin(office_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.office_members
    WHERE office_id = office_uuid 
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Offices policies
CREATE POLICY "Users can view offices they are members of"
  ON public.offices FOR SELECT
  USING (public.is_office_member(id) OR owner_id = auth.uid());

CREATE POLICY "Users can create offices"
  ON public.offices FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Office owners can update their offices"
  ON public.offices FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Office owners can delete their offices"
  ON public.offices FOR DELETE
  USING (owner_id = auth.uid());

-- Office members policies
CREATE POLICY "Members can view office members"
  ON public.office_members FOR SELECT
  USING (public.is_office_member(office_id));

CREATE POLICY "Admins can manage office members"
  ON public.office_members FOR INSERT
  WITH CHECK (public.is_office_admin(office_id) OR user_id = auth.uid());

CREATE POLICY "Admins can update office members"
  ON public.office_members FOR UPDATE
  USING (public.is_office_admin(office_id));

CREATE POLICY "Admins can delete office members"
  ON public.office_members FOR DELETE
  USING (public.is_office_admin(office_id));

-- Departments policies
CREATE POLICY "Members can view departments"
  ON public.departments FOR SELECT
  USING (public.is_office_member(office_id));

CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL
  USING (public.is_office_admin(office_id));

-- Personas policies
CREATE POLICY "Members can view personas"
  ON public.personas FOR SELECT
  USING (public.is_office_member(office_id));

CREATE POLICY "Admins can manage personas"
  ON public.personas FOR ALL
  USING (public.is_office_admin(office_id));

-- Workflows policies
CREATE POLICY "Members can view workflows"
  ON public.workflows FOR SELECT
  USING (public.is_office_member(office_id));

CREATE POLICY "Admins can manage workflows"
  ON public.workflows FOR ALL
  USING (public.is_office_admin(office_id));

-- Workflow runs policies
CREATE POLICY "Members can view workflow runs"
  ON public.workflow_runs FOR SELECT
  USING (public.is_office_member(office_id));

CREATE POLICY "Members can create workflow runs"
  ON public.workflow_runs FOR INSERT
  WITH CHECK (public.is_office_member(office_id));

CREATE POLICY "Members can update workflow runs"
  ON public.workflow_runs FOR UPDATE
  USING (public.is_office_member(office_id));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_offices_updated_at
  BEFORE UPDATE ON public.offices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personas_updated_at
  BEFORE UPDATE ON public.personas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
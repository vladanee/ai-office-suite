-- Create function to handle new user onboarding
CREATE OR REPLACE FUNCTION public.handle_new_user_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_office_id uuid;
  support_dept_id uuid;
  sales_dept_id uuid;
  engineering_dept_id uuid;
  marketing_dept_id uuid;
BEGIN
  -- Create a default office for the new user
  INSERT INTO public.offices (id, name, description, slug, owner_id)
  VALUES (
    gen_random_uuid(),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)) || '''s Office',
    'Your AI-powered workspace',
    lower(replace(COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)), ' ', '-')) || '-' || substr(gen_random_uuid()::text, 1, 8),
    NEW.id
  )
  RETURNING id INTO new_office_id;

  -- Add user as office owner in office_members
  INSERT INTO public.office_members (office_id, user_id, role)
  VALUES (new_office_id, NEW.id, 'owner');

  -- Update user's profile with current office
  UPDATE public.profiles
  SET current_office_id = new_office_id
  WHERE id = NEW.id;

  -- Create sample departments
  INSERT INTO public.departments (id, name, description, color, office_id)
  VALUES 
    (gen_random_uuid(), 'Customer Support', 'Handle customer inquiries and provide assistance', '#6366f1', new_office_id)
  RETURNING id INTO support_dept_id;

  INSERT INTO public.departments (id, name, description, color, office_id)
  VALUES 
    (gen_random_uuid(), 'Sales', 'Drive revenue growth and manage client relationships', '#f59e0b', new_office_id)
  RETURNING id INTO sales_dept_id;

  INSERT INTO public.departments (id, name, description, color, office_id)
  VALUES 
    (gen_random_uuid(), 'Engineering', 'Build and maintain products and infrastructure', '#10b981', new_office_id)
  RETURNING id INTO engineering_dept_id;

  INSERT INTO public.departments (id, name, description, color, office_id)
  VALUES 
    (gen_random_uuid(), 'Marketing', 'Brand awareness and lead generation', '#ec4899', new_office_id)
  RETURNING id INTO marketing_dept_id;

  -- Create sample personas
  INSERT INTO public.personas (name, role, avatar, office_id, department_id, skills, status, system_prompt)
  VALUES 
    ('Alex Support', 'Support Lead', '👨‍💼', new_office_id, support_dept_id, ARRAY['Communication', 'Problem Solving', 'Empathy'], 'active', 'You are a friendly and helpful customer support lead. You excel at resolving customer issues quickly and maintaining high satisfaction.'),
    ('Sam Sales', 'Sales Representative', '👩‍💼', new_office_id, sales_dept_id, ARRAY['Negotiation', 'CRM', 'Presentation'], 'active', 'You are a skilled sales representative focused on building relationships and closing deals. You understand customer needs and propose tailored solutions.'),
    ('Jordan Dev', 'Senior Engineer', '👨‍💻', new_office_id, engineering_dept_id, ARRAY['React', 'Node.js', 'System Design'], 'active', 'You are an experienced software engineer who writes clean, efficient code. You mentor junior developers and architect scalable solutions.'),
    ('Taylor QA', 'QA Analyst', '👩‍🔬', new_office_id, engineering_dept_id, ARRAY['Testing', 'Automation', 'Documentation'], 'idle', 'You are a detail-oriented QA analyst who ensures product quality through comprehensive testing strategies and automation.'),
    ('Morgan Marketing', 'Marketing Manager', '👨‍🎨', new_office_id, marketing_dept_id, ARRAY['SEO', 'Content Strategy', 'Analytics'], 'active', 'You are a creative marketing manager who drives brand awareness through data-driven campaigns and compelling content.');

  RETURN NEW;
END;
$$;

-- Create trigger for onboarding (runs after profile is created)
DROP TRIGGER IF EXISTS on_auth_user_created_onboarding ON auth.users;
CREATE TRIGGER on_auth_user_created_onboarding
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_onboarding();
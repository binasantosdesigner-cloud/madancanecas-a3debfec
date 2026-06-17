
-- Enum de status
DO $$ BEGIN
  CREATE TYPE public.art_status AS ENUM (
    'waiting', 'adjustment_requested', 'new_version', 'approved', 'expired', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- art_approvals
CREATE TABLE IF NOT EXISTS public.art_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  project_name text NOT NULL,
  product_name text,
  preview_image_url text,
  download_url text,
  status public.art_status NOT NULL DEFAULT 'waiting',
  team_notes text,
  approval_deadline timestamptz,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.art_approvals TO authenticated;
GRANT ALL ON public.art_approvals TO service_role;
ALTER TABLE public.art_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "art_approvals owner select" ON public.art_approvals
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "art_approvals owner update" ON public.art_approvals
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "art_approvals admin insert" ON public.art_approvals
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "art_approvals admin delete" ON public.art_approvals
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS art_approvals_touch_updated_at ON public.art_approvals;
CREATE TRIGGER art_approvals_touch_updated_at
  BEFORE UPDATE ON public.art_approvals
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- versions
CREATE TABLE IF NOT EXISTS public.art_approval_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  art_approval_id uuid NOT NULL REFERENCES public.art_approvals(id) ON DELETE CASCADE,
  version_number int NOT NULL DEFAULT 1,
  preview_image_url text,
  download_url text,
  team_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.art_approval_versions TO authenticated;
GRANT ALL ON public.art_approval_versions TO service_role;
ALTER TABLE public.art_approval_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "versions owner select" ON public.art_approval_versions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.art_approvals a WHERE a.id = art_approval_id
            AND (a.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );
CREATE POLICY "versions admin write" ON public.art_approval_versions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- feedback
CREATE TABLE IF NOT EXISTS public.art_approval_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  art_approval_id uuid NOT NULL REFERENCES public.art_approvals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  reference_file_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.art_approval_feedback TO authenticated;
GRANT ALL ON public.art_approval_feedback TO service_role;
ALTER TABLE public.art_approval_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback owner select" ON public.art_approval_feedback
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "feedback owner insert" ON public.art_approval_feedback
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.art_approvals a WHERE a.id = art_approval_id AND a.user_id = auth.uid())
  );

-- events
CREATE TABLE IF NOT EXISTS public.art_approval_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  art_approval_id uuid NOT NULL REFERENCES public.art_approvals(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  title text NOT NULL,
  description text,
  responsible text NOT NULL DEFAULT 'client',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.art_approval_events TO authenticated;
GRANT ALL ON public.art_approval_events TO service_role;
ALTER TABLE public.art_approval_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events owner select" ON public.art_approval_events
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.art_approvals a WHERE a.id = art_approval_id
            AND (a.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );
CREATE POLICY "events owner insert" ON public.art_approval_events
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.art_approvals a WHERE a.id = art_approval_id AND a.user_id = auth.uid())
  );


-- Create user_credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 3,
  next_reset TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create credit_usage table to track usage
CREATE TABLE IF NOT EXISTS public.credit_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create subscription table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create a function to reset monthly credits
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Update next reset date to first day of next month
  NEW.next_reset := date_trunc('month', NEW.next_reset) + interval '1 month';
  -- Reset to 3 free credits
  NEW.credits := 3;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to reset credits monthly
CREATE TRIGGER reset_monthly_credits_trigger
BEFORE UPDATE ON user_credits
FOR EACH ROW
WHEN (now() >= OLD.next_reset)
EXECUTE FUNCTION reset_monthly_credits();

-- Setup row level security
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own credits"
  ON public.user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own credit usage"
  ON public.credit_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only allow inserts by service role or the user themselves
CREATE POLICY "Service role can insert"
  ON public.user_credits FOR INSERT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Service role can update"
  ON public.user_credits FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

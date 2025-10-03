-- Drop the incorrectly placed trigger from auth.users
DROP TRIGGER IF EXISTS create_mfa_settings_trigger ON auth.users;

-- Drop any existing trigger on buybidhq_users
DROP TRIGGER IF EXISTS on_buybidhq_user_created_mfa ON public.buybidhq_users;

-- Create the trigger on the correct table (buybidhq_users) where mobile_number exists
CREATE TRIGGER on_buybidhq_user_created_mfa
  AFTER INSERT ON public.buybidhq_users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_mfa_settings();

import { supabase } from "@/integrations/supabase/client";
import { MFAVerificationResult } from "@/types/mfa";

export const checkEmailMFAStatus = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: factors, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  
  return factors.all.some(factor => factor.factor_type === 'email');
};

export const sendMFAEnrollmentEmail = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    throw new Error("No user email found");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: {
      shouldCreateUser: false,
    }
  });

  if (error) throw error;
};

export const verifyMFACode = async (email: string, token: string): Promise<MFAVerificationResult> => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to verify code"
    };
  }
};

export const disableMFA = async (): Promise<void> => {
  const { error } = await supabase.auth.mfa.unenroll({
    factorId: 'email'
  });

  if (error) throw error;
};

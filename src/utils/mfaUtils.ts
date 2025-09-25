
import { supabase } from "@/integrations/supabase/client";
import { MFAVerificationResult, MFAMethod } from "@/types/mfa";

export const checkMFAStatus = async (method: MFAMethod): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('mfa_settings')
    .select('status')
    .eq('user_id', user.id)
    .eq('method', method)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return false; // No record found
    throw error;
  }
  
  return data?.status === 'enabled';
};

export const checkSMSMFAStatus = async (): Promise<boolean> => {
  return checkMFAStatus('sms');
};


export const sendMFAEnrollmentSMS = async (phoneNumber: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No user found");
  }

  // Validate phone number format
  if (!phoneNumber || phoneNumber.length < 10) {
    throw new Error("Please enter a valid phone number");
  }

  // Create MFA verification record and send SMS
  const { error: verificationError } = await supabase.functions.invoke('send-mfa-sms', {
    body: { 
      method: 'sms',
      phoneNumber: phoneNumber.replace(/\D/g, '') // Remove non-digits
    }
  });

  if (verificationError) throw verificationError;
};

export const verifyMFACode = async (token: string, phoneNumber?: string): Promise<MFAVerificationResult> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("No user found");
    }

    // Call the database function to verify MFA code
    const { data, error } = await supabase.rpc('verify_mfa_code', {
      p_user_id: user.id,
      p_verification_code: token
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    const result = data?.[0];
    if (!result?.is_valid) {
      return {
        success: false,
        error: result?.error_message || "Invalid verification code"
      };
    }

    // Update MFA settings to enabled
    await supabase
      .from('mfa_settings')
      .upsert({
        user_id: user.id,
        method: 'sms',
        status: 'enabled'
      }, {
        onConflict: 'user_id,method'
      });

    // If SMS, update user's mobile number
    if (phoneNumber) {
      await supabase
        .from('buybidhq_users')
        .update({ mobile_number: phoneNumber })
        .eq('id', user.id);
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

export const enableMFA = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No user found");
  }

  const { error } = await supabase
    .from('mfa_settings')
    .upsert({
      user_id: user.id,
      method: 'sms',
      status: 'enabled'
    }, {
      onConflict: 'user_id,method'
    });

  if (error) throw error;
};

export const disableMFA = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No user found");
  }

  const { error } = await supabase
    .from('mfa_settings')
    .update({ status: 'disabled' })
    .eq('user_id', user.id)
    .eq('method', 'sms');

  if (error) throw error;
};

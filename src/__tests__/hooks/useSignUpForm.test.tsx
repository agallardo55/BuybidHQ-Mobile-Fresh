/**
 * useSignUpForm Hook Tests
 * 
 * Tests for signup wizard step transitions and form state management.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSignUpForm } from '@/hooks/useSignUpForm';

// Mock the sub-hooks
vi.mock('@/hooks/signup/useSignUpState', () => ({
  useSignUpState: () => ({
    formData: {
      // Personal info
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      mobile_number: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      
      // Dealership info
      dealer_name: '',
      business_phone: '',
      business_email: '',
      license_number: '',
      dealer_address: '',
      dealer_city: '',
      dealer_state: '',
      dealer_zip_code: '',
      
      // Plan selection
      selected_plan: 'free',
    },
    currentStep: 'plan' as const,
    isSubmitting: false,
    setIsSubmitting: vi.fn(),
    setCurrentStep: vi.fn(),
    handleChange: vi.fn(),
    handleStateChange: vi.fn(),
    handlePlanSelect: vi.fn(),
  }),
}));

vi.mock('@/hooks/signup/useSignUpNavigation', () => ({
  useSignUpNavigation: () => ({
    handleNext: vi.fn(),
    handleBack: vi.fn(),
  }),
}));

vi.mock('@/hooks/signup/useSignUpSubmission', () => ({
  useSignUpSubmission: () => ({
    handleSubmit: vi.fn(),
  }),
}));

describe('useSignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all form state and handlers', () => {
    const { result } = renderHook(() => useSignUpForm());

    expect(result.current).toHaveProperty('formData');
    expect(result.current).toHaveProperty('currentStep');
    expect(result.current).toHaveProperty('isSubmitting');
    expect(result.current).toHaveProperty('handleChange');
    expect(result.current).toHaveProperty('handleStateChange');
    expect(result.current).toHaveProperty('handlePlanSelect');
    expect(result.current).toHaveProperty('handleNext');
    expect(result.current).toHaveProperty('handleBack');
    expect(result.current).toHaveProperty('handleSubmit');
  });

  it('should have correct initial form data structure', () => {
    const { result } = renderHook(() => useSignUpForm());

    expect(result.current.formData).toMatchObject({
      // Personal info
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      mobile_number: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      
      // Dealership info
      dealer_name: '',
      business_phone: '',
      business_email: '',
      license_number: '',
      dealer_address: '',
      dealer_city: '',
      dealer_state: '',
      dealer_zip_code: '',
      
      // Plan selection
      selected_plan: 'free',
    });
  });

  it('should start with plan selection step', () => {
    const { result } = renderHook(() => useSignUpForm());

    expect(result.current.currentStep).toBe('plan');
  });

  it('should not be submitting initially', () => {
    const { result } = renderHook(() => useSignUpForm());

    expect(result.current.isSubmitting).toBe(false);
  });

  it('should provide function handlers', () => {
    const { result } = renderHook(() => useSignUpForm());

    expect(typeof result.current.handleChange).toBe('function');
    expect(typeof result.current.handleStateChange).toBe('function');
    expect(typeof result.current.handlePlanSelect).toBe('function');
    expect(typeof result.current.handleNext).toBe('function');
    expect(typeof result.current.handleBack).toBe('function');
    expect(typeof result.current.handleSubmit).toBe('function');
  });
});
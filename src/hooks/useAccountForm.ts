
import { useState, useEffect } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { CarrierType } from "@/types/users";

interface AccountFormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  phoneCarrier?: CarrierType;
  businessNumber: string;
  dealershipName: string;
  licenseNumber: string;
  dealershipAddress: string;
  city: string;
  state: string;
  zipCode: string;
  subscriptionType: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

export const useAccountForm = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const [formData, setFormData] = useState<AccountFormData>({
    fullName: "",
    email: "",
    mobileNumber: "",
    phoneCarrier: undefined,
    businessNumber: "",
    dealershipName: "",
    licenseNumber: "",
    dealershipAddress: "",
    city: "",
    state: "",
    zipCode: "",
    subscriptionType: "basic",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.full_name || "",
        email: currentUser.email || "",
        mobileNumber: currentUser.mobile_number || "",
        phoneCarrier: currentUser.phone_carrier as CarrierType || undefined,
        businessNumber: currentUser.business_phone || "",
        dealershipName: currentUser.dealer_name || "",
        licenseNumber: currentUser.dealer_id || "",
        dealershipAddress: currentUser.address || "",
        city: currentUser.city || "",
        state: currentUser.state || "",
        zipCode: currentUser.zip_code || "",
      }));
    }
  }, [currentUser]);

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    
    if (phoneNumber.length >= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
    if (phoneNumber.length > 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    }
    if (phoneNumber.length > 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    if (phoneNumber.length > 0) {
      return `(${phoneNumber}`;
    }
    return phoneNumber;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    
    if (name === 'mobileNumber' || name === 'businessNumber') {
      setFormData((prev) => ({
        ...prev,
        [name]: formatPhoneNumber(value),
      }));
    } else if (name === 'cardNumber') {
      const formatted = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim();
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
    } else if (name === 'cardExpiry') {
      const expiry = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d{0,2})/, '$1/$2')
        .substr(0, 5);
      setFormData((prev) => ({
        ...prev,
        [name]: expiry,
      }));
    } else if (name === 'cardCvc') {
      const cvc = value.replace(/\D/g, '').substr(0, 3);
      setFormData((prev) => ({
        ...prev,
        [name]: cvc,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    isLoading
  };
};

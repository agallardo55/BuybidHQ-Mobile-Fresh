
import { useState, useEffect } from "react";
import { useCurrentUser } from "./useCurrentUser";

export const useAccountForm = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
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
        businessNumber: currentUser.dealerships?.business_phone || "",
        dealershipName: currentUser.dealerships?.dealer_name || "",
        dealershipAddress: currentUser.dealerships?.address || currentUser.address || "",
        city: currentUser.dealerships?.city || currentUser.city || "",
        state: currentUser.dealerships?.state || currentUser.state || "",
        zipCode: currentUser.dealerships?.zip_code || currentUser.zip_code || "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

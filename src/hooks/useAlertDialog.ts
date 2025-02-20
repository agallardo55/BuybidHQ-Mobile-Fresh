
import { useState } from 'react';

export type AlertType = 'success' | 'error' | 'info';

interface AlertState {
  open: boolean;
  title: string;
  message: string;
  type: AlertType;
}

export const useAlertDialog = () => {
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    title: "",
    message: "",
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: AlertType) => {
    setAlert({
      open: true,
      title,
      message,
      type
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  return {
    alert,
    showAlert,
    closeAlert,
    setAlert
  };
};

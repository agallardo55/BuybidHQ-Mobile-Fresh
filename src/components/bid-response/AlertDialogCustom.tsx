
import { CheckCircle, XCircle, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertType } from "@/hooks/useAlertDialog";

interface AlertDialogCustomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  type: AlertType;
}

const AlertIcon = ({ type }: { type: AlertType }) => {
  const className = "w-6 h-6 mb-2";
  switch (type) {
    case 'success':
      return <CheckCircle className={`${className} text-green-500`} />;
    case 'error':
      return <XCircle className={`${className} text-red-500`} />;
    default:
      return <Info className={`${className} text-blue-500`} />;
  }
};

export const AlertDialogCustom = ({
  open,
  onOpenChange,
  title,
  message,
  type
}: AlertDialogCustomProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="text-center">
        <AlertDialogHeader>
          <div className="flex flex-col items-center">
            <AlertIcon type={type} />
            <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
            <AlertDialogDescription className="mt-2">
              {message}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center">
          <AlertDialogAction 
            className={`px-4 py-2 rounded-md ${
              type === 'success' ? 'bg-green-500' :
              type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            } text-white hover:opacity-90`}
          >
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

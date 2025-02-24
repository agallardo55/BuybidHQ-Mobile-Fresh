
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
  message: string | { amount: string; description: string };
  type: AlertType;
}

const AlertIcon = ({ type }: { type: AlertType }) => {
  const className = "w-12 h-12 mb-4"; // Increased size
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
  const isDetailedMessage = typeof message === 'object';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="text-center max-w-md">
        <AlertDialogHeader>
          <div className="flex flex-col items-center">
            <AlertIcon type={type} />
            <AlertDialogTitle className="text-2xl font-bold mb-2">{title}</AlertDialogTitle>
            {isDetailedMessage ? (
              <>
                <div className="text-lg font-semibold text-gray-700 mb-2">
                  {message.amount}
                </div>
                <AlertDialogDescription className="text-gray-600">
                  {message.description}
                </AlertDialogDescription>
              </>
            ) : (
              <AlertDialogDescription className="text-gray-600">
                {message}
              </AlertDialogDescription>
            )}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center mt-4">
          <AlertDialogAction 
            className={`w-full px-4 py-2 rounded-md ${
              type === 'success' ? 'bg-green-500' :
              type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            } text-white hover:opacity-90 text-base font-medium`}
          >
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

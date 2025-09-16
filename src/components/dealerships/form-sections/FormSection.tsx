import { ReactNode } from "react";
interface FormSectionProps {
  title: string;
  children: ReactNode;
}
const FormSection = ({
  title,
  children
}: FormSectionProps) => {
  return <div className="space-y-4">
      
      <div className="space-y-4">
        {children}
      </div>
    </div>;
};
export default FormSection;
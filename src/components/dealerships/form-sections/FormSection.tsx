import { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

const FormSection = ({ title, children }: FormSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
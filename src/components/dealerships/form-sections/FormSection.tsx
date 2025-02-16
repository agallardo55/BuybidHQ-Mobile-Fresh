
interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const FormSection = ({ title, children, className = "" }: FormSectionProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium">{title}</h3>
      {children}
    </div>
  );
};

export default FormSection;

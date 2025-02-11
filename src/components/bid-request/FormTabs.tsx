
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

const FormTabs = () => {
  return (
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="basic-info">Vehicle</TabsTrigger>
      <TabsTrigger value="appearance">Appearance</TabsTrigger>
      <TabsTrigger value="condition">Condition</TabsTrigger>
      <TabsTrigger value="buyers">Buyers</TabsTrigger>
    </TabsList>
  );
};

export default FormTabs;

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const FormTabs = () => {
  return (
    <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
      <TabsTrigger
        value="appearance"
        className={cn(
          "text-[11px] font-bold uppercase tracking-widest py-3 rounded-none border-b-2 border-transparent",
          "data-[state=active]:border-custom-blue data-[state=active]:text-custom-blue data-[state=active]:bg-transparent",
          "text-slate-600 hover:text-slate-900"
        )}
      >
        Appearance
      </TabsTrigger>
      <TabsTrigger
        value="condition"
        className={cn(
          "text-[11px] font-bold uppercase tracking-widest py-3 rounded-none border-b-2 border-transparent",
          "data-[state=active]:border-custom-blue data-[state=active]:text-custom-blue data-[state=active]:bg-transparent",
          "text-slate-600 hover:text-slate-900"
        )}
      >
        Condition
      </TabsTrigger>
      <TabsTrigger
        value="book-values"
        className={cn(
          "text-[11px] font-bold uppercase tracking-widest py-3 rounded-none border-b-2 border-transparent",
          "data-[state=active]:border-custom-blue data-[state=active]:text-custom-blue data-[state=active]:bg-transparent",
          "text-slate-600 hover:text-slate-900"
        )}
      >
        Valuation
      </TabsTrigger>
      <TabsTrigger
        value="buyers"
        className={cn(
          "text-[11px] font-bold uppercase tracking-widest py-3 rounded-none border-b-2 border-transparent",
          "data-[state=active]:border-custom-blue data-[state=active]:text-custom-blue data-[state=active]:bg-transparent",
          "text-slate-600 hover:text-slate-900"
        )}
      >
        Buyers
      </TabsTrigger>
    </TabsList>
  );
};

export default FormTabs;

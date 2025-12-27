
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { usePhoneFormat } from "@/hooks/signup/usePhoneFormat";

interface ContactInfoProps {
  control: Control<any>;
}

export const ContactInfo = ({ control }: ContactInfoProps) => {
  const { formatPhoneNumber } = usePhoneFormat();

  return (
    <>
      <FormField
        control={control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input {...field} autoComplete="name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email address <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input {...field} autoComplete="email" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="mobileNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mobile Number <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                {...field}
                onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                placeholder="(123) 456-7890"
                maxLength={14}
                autoComplete="tel"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

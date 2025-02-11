
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserFormData } from "@/types/users";

interface AddUserFormProps {
  onSubmit: (e: React.FormEvent) => void;
  formData: UserFormData;
  onFormDataChange: (data: Partial<UserFormData>) => void;
}

const AddUserForm = ({ onSubmit, formData, onFormDataChange }: AddUserFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={(e) => onFormDataChange({ fullName: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={(e) => onFormDataChange({ email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value: "admin" | "dealer" | "basic") => onFormDataChange({ role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="dealer">Dealer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobileNumber">Mobile Number</Label>
          <Input
            id="mobileNumber"
            placeholder="Enter mobile number"
            value={formData.mobileNumber}
            onChange={(e) => onFormDataChange({ mobileNumber: e.target.value })}
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Add User
      </Button>
    </form>
  );
};

export default AddUserForm;

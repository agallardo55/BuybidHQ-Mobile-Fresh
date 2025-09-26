import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dealership } from "@/types/dealerships";
import { User } from "lucide-react";

interface AccountAdminSectionProps {
  dealership?: Dealership;
}

const AccountAdminSection = ({ dealership }: AccountAdminSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");

  // Mock data - in a real app, this would come from your API
  const availableUsers = [
    { id: "1", name: "John Smith", email: "john@example.com" },
    { id: "2", name: "Jane Doe", email: "jane@example.com" },
    { id: "3", name: "Mike Johnson", email: "mike@example.com" },
  ];

  const currentAdmin = dealership?.account_admin;

  useEffect(() => {
    if (currentAdmin) {
      setSelectedAdminId(currentAdmin.id);
    }
  }, [currentAdmin]);

  const handleSaveAdmin = () => {
    // TODO: Implement API call to update account admin
    console.log("Updating admin to user ID:", selectedAdminId);
    setIsEditing(false);
  };

  const handleRemoveAdmin = () => {
    // TODO: Implement API call to remove account admin
    console.log("Removing current admin");
    setSelectedAdminId("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Account Administrator</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Manage the account administrator for this dealership. The account admin has full access to manage users and settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current Account Admin
          </CardTitle>
          <CardDescription>
            The user assigned as the account administrator for this dealership
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentAdmin ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input 
                    value={currentAdmin.full_name || "N/A"} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={currentAdmin.email || "N/A"} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label>Mobile Number</Label>
                  <Input 
                    value={currentAdmin.mobile_number || "N/A"} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
                <div className="flex items-end">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Active Admin
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                >
                  Change Admin
                </Button>
                <Button 
                  type="button"
                  variant="destructive" 
                  onClick={handleRemoveAdmin}
                >
                  Remove Admin
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No account administrator assigned</p>
              <Button 
                type="button"
                onClick={() => setIsEditing(true)}
              >
                Assign Admin
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>
              {currentAdmin ? "Change Account Admin" : "Assign Account Admin"}
            </CardTitle>
            <CardDescription>
              Select a user to be the account administrator for this dealership
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select User</Label>
              <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user to assign as admin" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-sm text-muted-foreground group-data-[highlighted]:text-white">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button"
                onClick={handleSaveAdmin}
                disabled={!selectedAdminId}
              >
                {currentAdmin ? "Update Admin" : "Assign Admin"}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountAdminSection;
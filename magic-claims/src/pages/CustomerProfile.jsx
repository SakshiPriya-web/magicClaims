import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useState } from "react";

const CustomerProfile = () => {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    address: "Kolkata, WB, India",
    policyCount: 3,
    vehicleCount: 2,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-2xl shadow-md rounded-2xl">
        <CardHeader className="flex flex-col items-center">
          <Avatar className="w-24 h-24 mb-3">
            <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=John" alt="Avatar" />
            <AvatarFallback>SP</AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl font-semibold">{profile.name}</CardTitle>
          <p className="text-gray-500 text-sm">Customer Profile</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                name="name"
                value={profile.name}
                disabled={!isEditing}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                value={profile.email}
                disabled={!isEditing}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                name="phone"
                value={profile.phone}
                disabled={!isEditing}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                name="address"
                value={profile.address}
                disabled={!isEditing}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <p><strong>Policies:</strong> {profile.policyCount}</p>
            <p><strong>Vehicles:</strong> {profile.vehicleCount}</p>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfile;

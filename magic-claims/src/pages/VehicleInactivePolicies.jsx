// src/pages/VehicleInactivePolicies.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Shield, Car, List, User, LogOut, Search } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function VehicleInactivePolicies() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const car = state?.car;

  const [inactivePolicies, setInactivePolicies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const BASE_URL = "https://invoice-parser-production-4123.up.railway.app";
  const customer_id = "751c2d59-449a-498a-8d81-de72b1d39cfc";

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  useEffect(() => {
    if (!carId) return;
    async function fetchInactivePolicies() {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/customer/${customer_id}/car/${carId}/policy`
        );
        const policies = res.data?.policies || [];
        const inactive = policies.filter((p) =>
          ["EXPIRED", "INACTIVE"].includes(p.status)
        );
        setInactivePolicies(inactive);
      } catch (err) {
        console.error("Error fetching inactive policies:", err);
        toast.error("Failed to load inactive policies.");
      } finally {
        setLoading(false);
      }
    }
    fetchInactivePolicies();
  }, [carId]);

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

  const filteredPolicies = inactivePolicies.filter((p) =>
    p.policy_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!car || car.car_id !== carId) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navbar (same as Home) */}
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/home")}
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">magicClaims</h1>
                <p className="text-sm text-muted-foreground">
                  Policy Holder Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate("/tracking")}>
                <List className="w-4 h-4 mr-1" />
                Track Claims
              </Button>
              <Button variant="outline" onClick={() => navigate("/profile")}>
                <User className="w-4 h-4 mr-1" />
                Profile
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">Vehicle not found</CardTitle>
              <CardDescription>
                Please go back and open the list again.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar (same as Home) */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/home")}
          >
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">magicClaims</h1>
              <p className="text-sm text-muted-foreground">
                Policy Holder Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/tracking")}>
              <List className="w-4 h-4 mr-1" />
              Track Claims
            </Button>
            <Button variant="outline" onClick={() => navigate("/profile")}>
              <User className="w-4 h-4 mr-1" />
              Profile
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="container mx-auto px-4 py-8">
        {/* Vehicle header card (matches Home styling) */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {car.make} {car.model}
              </CardTitle>
              <Car className="w-5 h-5 text-primary" />
            </div>
            <CardDescription>
              {car.year} • {car.trim} • Car ID: {car.car_id}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
            <p>
              <span className="text-muted-foreground">VIN:</span> {car.vin}
            </p>
            <p>
              <span className="text-muted-foreground">Registration:</span>{" "}
              {car.registration_number}
            </p>
            <p>
              <span className="text-muted-foreground">Created On:</span>{" "}
              {fmtDate(car.created_at)}
            </p>
          </CardContent>
        </Card>

        {/* Search bar */}
        <div className="flex items-center gap-2 mb-6 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by policy number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Inactive policies list */}
        <h2 className="text-2xl font-bold mb-4">Inactive Policies</h2>

        {loading ? (
          <Card className="shadow-md">
            <CardContent className="py-6 text-center text-muted-foreground">
              Loading inactive policies...
            </CardContent>
          </Card>
        ) : filteredPolicies.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.map((p) => (
              <Card
                key={p.policy_id}
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-base">
                    Policy #{p.policy_number}
                  </CardTitle>
                  <CardDescription>Policy ID: {p.policy_id}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    {p.status || "Inactive"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Start:</span>{" "}
                    {fmtDate(p.start_date)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">End:</span>{" "}
                    {fmtDate(p.end_date)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Max Amount:</span>{" "}
                    ₹{p.max_amount?.toLocaleString?.() ?? p.max_amount}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-md">
            <CardContent className="py-6 text-center text-muted-foreground">
              No inactive policies found for this vehicle.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

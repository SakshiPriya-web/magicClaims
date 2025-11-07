// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Shield, Car, LogOut, User, List } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "https://invoice-parser-production-4123.up.railway.app";
  const customer_id = "cust_test";

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await axios.get(`${BASE_URL}/api/customer/${customer_id}/car`);
        if (res.data?.cars) setVehicles(res.data.cars);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        toast.error("Failed to load vehicles. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, []);

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Loading your vehicles...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
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
              <p className="text-sm text-muted-foreground">Policy Holder Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/tracking")}>
              <List className="w-4 h-4 mr-1" /> Track Claims
            </Button>
            <Button variant="outline" onClick={() => navigate("/profile")}>
              <User className="w-4 h-4 mr-1" /> Profile
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">My Insured Vehicles</h2>

        {vehicles.length === 0 ? (
          <p className="text-muted-foreground text-center mt-10">
            No vehicles found for this account.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((car) => (
              <Card key={car.car_id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {car.make} {car.model}
                    </CardTitle>
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <CardDescription>
                    {car.year} • {car.trim}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Car ID:</span> {car.car_id}
                  </p>
                  <p>
                    <span className="text-muted-foreground">VIN:</span> {car.vin}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Registration:</span>{" "}
                    {car.registration_number}
                  </p>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        navigate(`/vehicle/${car.car_id}/policies/inactive`, {
                          state: { car },
                        })
                      }
                    >
                      View Inactive Policies
                    </Button>

                    <Button
                      className="flex-1"
                      onClick={() =>
                        navigate("/report-damage", {
                          state: { car },
                        })
                      }
                    >
                      Report Damage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

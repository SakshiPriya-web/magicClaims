// src/pages/ReportDamage.jsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Calendar } from "../components/ui/calendar";
import { Shield, Upload, X, LogOut, Car, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://invoice-parser-production-4123.up.railway.app";
const CUSTOMER_ID = "751c2d59-449a-498a-8d81-de72b1d39cfc";
const DEFAULT_REPAIR_SHOP_ID = "51b02a49-425c-4817-b2fc-366415b65182";
const UPLOADED_BY_USER_ID = 6;
const DEFAULT_CLAIM_AMOUNT = 0;

const ReportDamage = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // may contain { car }
  const params = useParams();

  // carId can come from location.state (when navigating from Home) or URL /report-damage/:carId
  const carId = state?.car_id || state?.car?.car_id || params.carId;

  // Vehicle & policy state
  const [car, setCar] = useState(state?.car || null);
  const [activePolicy, setActivePolicy] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(!state?.car);
  const [loadingPolicy, setLoadingPolicy] = useState(true);

  // Form states
  const [incidentDate, setIncidentDate] = useState(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Repair shop field (pre-populated but editable)
  const [repairShopId, setRepairShopId] = useState(DEFAULT_REPAIR_SHOP_ID);

  // ---- Fetch vehicle if not provided via state ----
  useEffect(() => {
    if (!carId) return;
    if (car) {
      setLoadingVehicle(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/customer/${CUSTOMER_ID}/car`);
        if (!mounted) return;
        const found = (data?.cars || []).find((c) => c.car_id === carId);
        setCar(found || null);
        if (!found) toast.error("Vehicle not found.");
      } catch (err) {
        console.error("Error fetching vehicle:", err);
        toast.error("Failed to load vehicle details.");
      } finally {
        if (mounted) setLoadingVehicle(false);
      }
    })();
    return () => (mounted = false);
  }, [carId, car]);

  // ---- Fetch policies for car; pick ACTIVE (case-insensitive) ----
  useEffect(() => {
    if (!carId) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/customer/${CUSTOMER_ID}/car/${carId}/policy`
        );
        if (!mounted) return;
        const policies = data?.policies || [];
        const active = policies.find(
          (p) => String(p.status || "").trim().toUpperCase() === "ACTIVE"
        );
        setActivePolicy(active || null);
        if (!active) {
          toast.message("No active policy for this vehicle.");
        }
      } catch (err) {
        console.error("Error fetching policies:", err);
        toast.error("Failed to load active policy.");
      } finally {
        if (mounted) setLoadingPolicy(false);
      }
    })();
    return () => (mounted = false);
  }, [carId]);

  // Upload handling
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      description: "",
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const updateImageDescription = (id, desc) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, description: desc } : img)));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!incidentDate) {
      toast.error("Please select incident date");
      return;
    }
    if (!activePolicy?.policy_id) {
      toast.error("No active policy found for this vehicle.");
      return;
    }
    if (!repairShopId.trim()) {
      toast.error("Please enter Repair Shop ID");
      return;
    }
    if (!location.trim()) {
      toast.error("Please enter the incident location");
      return;
    }
    if (!description.trim()) {
      toast.error("Please provide an incident description");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload at least one damage photo");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("policy_id", activePolicy.policy_id); // ✅ dynamic from API
      formData.append("date_of_incident", format(incidentDate, "yyyy-MM-dd"));
      formData.append("description", description);
      formData.append("claim_amount", DEFAULT_CLAIM_AMOUNT);
      formData.append("uploaded_by_user_id", UPLOADED_BY_USER_ID);
      formData.append("repair_shop_id_done", repairShopId);

      if (location.trim()) {
        formData.append("incident_location", location);
      }

      images.forEach((img) => formData.append("files", img.file));
      images.forEach((img) => formData.append("image_descriptions", img.description || ""));

      const response = await axios.post(
        `${BASE_URL}/api/customer/${CUSTOMER_ID}/claim`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("✅ Claim submitted successfully!");
      navigate("/claim-submitted", { state: { claimId: response.data } });
    } catch (err) {
      console.error("❌ Submit error:", err.response || err);
      toast.error(
        err?.response?.data?.detail?.[0]?.msg ||
          err?.response?.data?.message ||
          "Server error — please verify data types and policy ID."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

  const fmt = useMemo(
    () => ({
      date: (d) => (d ? new Date(d).toLocaleDateString() : "—"),
      money: (n) => (typeof n === "number" ? `₹${n.toLocaleString()}` : "—"),
    }),
    []
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/home")}>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">magicClaims</h1>
              <p className="text-sm text-muted-foreground">Policy Holder Portal</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Vehicle summary (unchanged styling) */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Your Insured Vehicle</h3>

                {!carId ? (
                  <p className="text-sm text-red-500">Missing vehicle ID.</p>
                ) : loadingVehicle ? (
                  <p className="text-sm text-muted-foreground">Loading vehicle…</p>
                ) : car ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                    <div>
                      <p className="text-muted-foreground">Make</p>
                      <p className="font-medium">{car.make}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Model</p>
                      <p className="font-medium">{car.model}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Year</p>
                      <p className="font-medium">{car.year}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Trim</p>
                      <p className="font-medium">{car.trim}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">VIN</p>
                      <p className="font-medium break-all">{car.vin}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Registration</p>
                      <p className="font-medium">{car.registration_number}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Car ID</p>
                      <p className="font-medium break-all">{car.car_id}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-500">Vehicle not found.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Policy summary (same design language) */}
        <Card className="mb-6 border-indigo-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Active Policy
            </CardTitle>
            <CardDescription>Policy currently covering this vehicle</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {!carId ? (
              <p className="text-sm text-muted-foreground italic">Provide a vehicle to load policy.</p>
            ) : loadingPolicy ? (
              <p className="text-muted-foreground">Loading policy…</p>
            ) : activePolicy ? (
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
                <p><span className="text-muted-foreground">Policy #:</span> {activePolicy.policy_number}</p>
                {/* <p><span className="text-muted-foreground">Policy ID:</span> {activePolicy.policy_id}</p> */}
                <p><span className="text-muted-foreground">Start:</span> {fmt.date(activePolicy.start_date)}</p>
                <p><span className="text-muted-foreground">End:</span> {fmt.date(activePolicy.end_date)}</p>
                <p><span className="text-muted-foreground">Max Amount:</span> {fmt.money(activePolicy.max_amount)}</p>
                <p><span className="text-muted-foreground">Status:</span> {activePolicy.status}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No active policy found.</p>
            )}
          </CardContent>
        </Card>

        {/* Report form (unchanged UI) */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Report Vehicle Damage</CardTitle>
            <CardDescription>Fill in the incident details and upload supporting photos</CardDescription>
          </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Incident Date *</Label>
                <Calendar
                  mode="single"
                  selected={incidentDate}
                  onSelect={setIncidentDate}
                  initialFocus
                  className="p-2 border rounded shadow bg-white"
                  disabled={(date) => date > new Date()}
                />
              </div>
              <div></div>
            </div>

            {/* Repair Shop ID */}
            <div>
              <Label htmlFor="repairShopId">Repair Shop ID *</Label>
              <Input
                id="repairShopId"
                placeholder="Enter or confirm Repair Shop ID"
                value={repairShopId}
                onChange={(e) => setRepairShopId(e.target.value)}
                required
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Incident Location *</Label>
              <Input
                id="location"
                placeholder="e.g., 123 Main Street, City"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what happened..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>

            {/* Upload photos */}
            <div className="space-y-4">
              <div>
                <Label>Damage Photos *</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload clear photos of all damaged areas.
                </p>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-medium">Click to upload images</p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG up to 10MB each
                  </p>
                </label>
              </div>

              {images.length > 0 && (
                <div className="space-y-4">
                  {images.map((image) => (
                    <Card key={image.id}>
                      <div className="flex flex-col md:flex-row gap-4 p-4">
                        <div className="relative w-full md:w-48 h-48">
                          <img
                            src={image.preview}
                            alt="Damage"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`desc-${image.id}`}>Photo Description</Label>
                          <Textarea
                            id={`desc-${image.id}`}
                            placeholder="Describe this photo..."
                            value={image.description}
                            onChange={(e) => updateImageDescription(image.id, e.target.value)}
                            rows={5}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (window.confirm("Cancel report? All data will be lost.")) {
                    navigate("/home");
                  }
                }}
              >
                Cancel
              </Button>

              <Button type="submit" className="flex-1 h-11" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Claim"}
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportDamage;

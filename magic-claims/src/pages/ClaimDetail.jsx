import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Shield, LogOut, ArrowLeft, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";

// Central API URL (optional, leave undefined for demo mode)
const API_URL = import.meta.env.VITE_API_URL;

const ClaimDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(state?.claim || null);
  const [loading, setLoading] = useState(!state?.claim);
  const [editing, setEditing] = useState(false);

  // >>> STATUS REMOVED FROM EDITABLE FORM
  const [form, setForm] = useState({
    description: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleRegNo: "",
    policyNumber: "",
    insurer: "",
    incidentDate: "",
  });

  useEffect(() => {
    if (claim) {
      setForm({
        description: claim.description || "",
        vehicleMake: claim.vehicle?.make || "",
        vehicleModel: claim.vehicle?.model || "",
        vehicleRegNo: claim.vehicle?.regNo || "",
        policyNumber: claim.policy?.number || "",
        insurer: claim.policy?.insurer || "",
        incidentDate: claim.date || "",
      });
    }
  }, [claim]);

  // Fetch claim if opened directly by URL
  useEffect(() => {
    let mounted = true;
    const fetchClaim = async () => {
      try {
        if (state?.claim) return;
        if (!API_URL) {
          const fallback = {
            id,
            vehicle: { make: "Unknown", model: "Unknown", regNo: "—" },
            policy: { number: "—", insurer: "—", validTill: "—" },
            date: "—",
            status: "Under Review", // <<< status shown but never edited
            description: "Loaded without API (demo fallback).",
          };
          if (mounted) {
            setClaim(fallback);
            setLoading(false);
          }
          return;
        }
        setLoading(true);
        const r = await fetch(`${API_URL}/claims/${id}`);
        if (!r.ok) throw new Error("Failed to fetch claim");
        const data = await r.json();
        if (mounted) {
          setClaim(data);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        toast.error("Could not load claim. Showing placeholder.");
        const fallback = {
          id,
          vehicle: { make: "Unknown", model: "Unknown", regNo: "—" },
          policy: { number: "—", insurer: "—", validTill: "—" },
          date: "—",
          status: "Under Review",
          description: "Loaded without API (error fallback).",
        };
        if (mounted) {
          setClaim(fallback);
          setLoading(false);
        }
      }
    };
    fetchClaim();
    return () => { mounted = false; };
  }, [API_URL, id, state?.claim]);

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async () => {
    try {
      // >>> STATUS EXCLUDED FROM UPDATE PAYLOAD
      const payload = {
        description: form.description,
        vehicle: {
          make: form.vehicleMake,
          model: form.vehicleModel,
          regNo: form.vehicleRegNo,
        },
        policy: {
          number: form.policyNumber,
          insurer: form.insurer,
        },
        date: form.incidentDate,
      };

      if (API_URL) {
        const r = await fetch(`${API_URL}/claims/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!r.ok) throw new Error("Update failed");
      }

      // Merge updated fields, keep status untouched (admin-controlled)
      setClaim((prev) => prev ? {
        ...prev,
        ...payload,
        status: prev.status,
      } : prev);

      toast.success("Claim updated and resubmitted (status managed by admin).");
      setEditing(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update claim");
    }
  };

  const Section = ({ title, children, desc }) => (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {desc && <CardDescription>{desc}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header kept intact */}
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">magicClaims</h1>
                <p className="text-sm text-muted-foreground">Claim Tracking</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <p className="text-muted-foreground">Loading claim…</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">magicClaims</h1>
                <p className="text-sm text-muted-foreground">Claim Tracking</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <p className="text-muted-foreground">Claim not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            {/* <ArrowLeft className="w-4 h-4 mr-2" /> */}
            Back
          </Button>
        </div>
      </div>
    );
  }

  const statusColor =
    claim.status === "Approved"
      ? "text-green-600"
      : claim.status === "Under Review"
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="min-h-screen bg-background">
      {/* Header kept intact */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">magicClaims</h1>
              <p className="text-sm text-muted-foreground">Claim Tracking</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Claim {claim.id}</h2>
            <p className="text-sm text-muted-foreground">View and update claim details</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)}>
                {/* <Edit className="w-4 h-4 mr-2" /> */}
                Update Claim
              </Button>
            ) : (
              <>
                <Button onClick={onSubmit}>
                  {/* <Save className="w-4 h-4 mr-2" /> */}
                  Save & Resubmit
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  {/* <X className="w-4 h-4 mr-2" /> */}
                  Cancel
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => navigate(-1)}>
              {/* <ArrowLeft className="w-4 h-4 mr-2" /> */}
              Back
            </Button>
          </div>
        </div>

        {/* Vehicle */}
        <Section title="Vehicle" desc="Vehicle information linked to this claim">
          {!editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><p className="text-sm text-muted-foreground">Make</p><p className="font-medium">{claim.vehicle?.make}</p></div>
              <div><p className="text-sm text-muted-foreground">Model</p><p className="font-medium">{claim.vehicle?.model}</p></div>
              <div><p className="text-sm text-muted-foreground">Registration</p><p className="font-medium">{claim.vehicle?.regNo}</p></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input name="vehicleMake" value={form.vehicleMake} onChange={onChange} placeholder="Make" />
              <Input name="vehicleModel" value={form.vehicleModel} onChange={onChange} placeholder="Model" />
              <Input name="vehicleRegNo" value={form.vehicleRegNo} onChange={onChange} placeholder="Registration No." />
            </div>
          )}
        </Section>

        {/* Policy */}
        <Section title="Policy" desc="Policy details">
          {!editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><p className="text-sm text-muted-foreground">Policy #</p><p className="font-medium">{claim.policy?.number}</p></div>
              <div><p className="text-sm text-muted-foreground">Insurer</p><p className="font-medium">{claim.policy?.insurer}</p></div>
              <div><p className="text-sm text-muted-foreground">Valid Till</p><p className="font-medium">{claim.policy?.validTill || "—"}</p></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input name="policyNumber" value={form.policyNumber} onChange={onChange} placeholder="Policy Number" />
              <Input name="insurer" value={form.insurer} onChange={onChange} placeholder="Insurer" />
              <Input name="incidentDate" value={form.incidentDate} onChange={onChange} placeholder="Incident/Claim Date (e.g. 5 Oct 2025)" />
            </div>
          )}
        </Section>

        {/* Claim */}
        <Section title="Claim" desc="Status (admin-controlled) and description">
          {/* STATUS ALWAYS READ-ONLY */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className={`font-medium ${statusColor}`}>{claim.status}</p>
            <p className="text-xs text-muted-foreground mt-1">Status is managed in the admin portal and cannot be changed here.</p>
          </div>

          {!editing ? (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p>{claim.description}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Describe the damage/claim notes"
              />
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

export default ClaimDetail;

// src/pages/Tracking.jsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Shield, CheckCircle, Clock, XCircle, LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

const BASE_URL = "https://invoice-parser-production-4123.up.railway.app";
const CUSTOMER_ID = "751c2d59-449a-498a-8d81-de72b1d39cfc";

const Tracking = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/customer/${CUSTOMER_ID}/claim`);
        if (!mounted) return;

        const apiClaims = (data?.claims || []).map((c) => ({
          id: c.claim_id,
          car_id: c.car_id ?? null,                 // ← backend may or may not send this
          policy_id: c.policy_id ?? null,           // ← backend may or may not send this
          createdAt:
            c.created_at || c.created_on || c.created || null, // ← if your API adds a created timestamp
          dateOfIncident: c.date_of_incident,
          status: (c.status || "").toLowerCase(),
          description: c.description || "",
          policy: {
            number: c.policy_number,
            start: c.start_date,
            end: c.end_date,
          },
          vehicle: {
            make: c.make,
            model: c.model,
            year: c.year,
            regNo: c.registration_number,
          },
          raw: c,
        }));

        setClaims(apiClaims);
      } catch (err) {
        console.error("Error loading claims:", err);
        toast.error("Failed to load claims.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return claims;
    return claims.filter((c) => {
      const mix = [
        c.id,
        c.car_id,
        c.policy_id,
        c.status,
        c.description,
        c.vehicle?.make,
        c.vehicle?.model,
        c.vehicle?.year,
        c.vehicle?.regNo,
        c.policy?.number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return mix.includes(q);
    });
  }, [search, claims]);

  const statusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
      case "under review":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const statusClass = (status) =>
    status === "approved"
      ? "text-green-600"
      : status === "pending" || status === "under review"
      ? "text-yellow-600"
      : "text-red-600";

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

  const openClaim = (claim) => {
    navigate(`/claims/${claim.id}`, { state: { claim, raw: claim.raw } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav/Header (unchanged) */}
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
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold">My Claims</h2>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by claim id, car id, make/model/year, status, policy…"
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <Card className="mb-4 shadow-md">
            <CardContent className="py-6 text-center text-muted-foreground">
              Loading your claims…
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="mb-4 shadow-md">
            <CardContent className="py-6 text-center text-muted-foreground">
              No claims found{search ? " for your search." : "."}
            </CardContent>
          </Card>
        ) : (
          filtered.map((claim) => (
            <Card
              key={claim.id}
              className="mb-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openClaim(claim)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Claim ID: {claim.id}</CardTitle>
                  <CardDescription>
                    {/* Keep subtitle concise */}
                    {claim.vehicle?.make} {claim.vehicle?.model} • Incident: {fmtDate(claim.dateOfIncident)}
                  </CardDescription>
                </div>
                {statusIcon(claim.status)}
              </CardHeader>

              <CardContent className="pt-0">
                {/* New details grid */}
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-3">
                  <p>
                    <span className="text-muted-foreground">Car ID:</span>{" "}
                    <span className="break-all">{claim.car_id || "—"}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Policy ID:</span>{" "}
                    <span className="break-all">{claim.policy_id || "—"}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Make / Model / Year:</span>{" "}
                    {[
                      claim.vehicle?.make || "—",
                      claim.vehicle?.model || "—",
                      claim.vehicle?.year || "—",
                    ].join(" / ")}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Claim Created:</span>{" "}
                    {fmtDate(claim.createdAt)}
                  </p>
                </div>

                {/* Existing summary & status */}
                <p className="text-sm text-muted-foreground mb-2">
                  {claim.description || "No description provided."}
                </p>
                <p className="font-medium">
                  Status:{" "}
                  <span className={statusClass(claim.status)}>
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </span>
                </p>

                {/* Explicit button */}
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openClaim(claim);
                    }}
                  >
                    View Claim
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        <div className="mt-6">
          <Button variant="outline" onClick={() => navigate("/home")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Tracking;

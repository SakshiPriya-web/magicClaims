// src/pages/Tracking.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Shield, LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

const BASE_URL = "https://invoice-parser-production-4123.up.railway.app";
const CUSTOMER_ID = "cust_test";

const fmtDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso; // fallback
  return d.toLocaleString();
};

const fmtDate = (yyyyMmDd) => {
  if (!yyyyMmDd) return "—";
  // Safe for "YYYY-MM-DD" strings
  const d = new Date(yyyyMmDd + "T00:00:00Z");
  return Number.isNaN(d.getTime()) ? yyyyMmDd : d.toLocaleDateString();
};

const Tracking = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch claims from API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/customer/${CUSTOMER_ID}/claim`
        );
        if (!mounted) return;
        const apiClaims = (data?.claims || []).map((c) => ({
          id: c.claim_id,
          createdAt: c.created_at,              // ISO string
          policyNumber: c.policy_number,
          make: c.make,
          model: c.model,
          year: c.year,
          date_of_incident: c.date_of_incident, // <-- ADD THIS LINE
          status: c.status,
          description: c.description,
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

  // Search across the requested fields
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return claims;
    return claims.filter((c) => {
      const mix = [
        c.id,
        c.policyNumber,
        c.make,
        c.model,
        String(c.year ?? ""),
        fmtDateTime(c.createdAt),
        c.date_of_incident, // include in search
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return mix.includes(q);
    });
  }, [search, claims]);

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
              placeholder="Search by claim id, make, model, year, created date, policy number…"
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
          filtered.map((c) => (
            <Card
              key={c.id}
              className="mb-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openClaim(c)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Claim ID: {c.id}</CardTitle>
                  <CardDescription>
                    {c.make} {c.model} • {c.year}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-sm">
                <div className="grid md:grid-cols-2 gap-y-1 gap-x-6">
                  <p>
                    <span className="text-muted-foreground">Claim ID:</span>{" "}
                    {c.id}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Date of Incident:</span>{" "}
                    {fmtDate(c.date_of_incident)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Created:</span>{" "}
                    {fmtDateTime(c.createdAt)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Policy #:</span>{" "}
                    {c.policyNumber}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    {c.status}
                  </p>
                </div>

                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openClaim(c);
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

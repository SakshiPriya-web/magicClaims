import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Image as ImageIcon,
} from "lucide-react";

const BASE_URL = "https://invoice-parser-production-4123.up.railway.app";

const AdminDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  /** Fetch all claims for admin **/
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/admin/claim`);
        if (!mounted) return;

        if (data?.status === "ok") {
          // Parse all claims, then filter only those having at least 1 photo
          const parsed = data.claims
            .map((item) => ({
              id: item.claim.claim_id,
              policyNumber: item.claim.policy_id,
              customerId: item.claim.customer_id,
              customerName: item.claim.customer_name,
              shopId: item.claim.repair_shop_id_done,
              date: item.claim.date_of_incident,
              status: item.claim.status || "pending",
              description: item.claim.description || "",
              photos: item.claim_media?.map((m) => m.storage_path) || [],
              invoices: item.invoice
                ? [
                    {
                      name: item.invoice.invoice_id + ".pdf",
                      url: item.invoice.file_url,
                    },
                  ]
                : [],
            }))
            .filter((c) => c.photos.length > 0); // 👈 Only keep claims with photos

          setClaims(parsed);
        } else {
          toast({
            title: "Error",
            description: "Unexpected API response format",
          });
        }
      } catch (err) {
        console.error("Failed to load admin claims:", err);
        toast({
          title: "Error fetching claims",
          description: err?.response?.data?.detail || err.message,
          variant: "destructive",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [toast]);

  const handleLogout = () => {
    navigate("/admin");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "default",
      review: "destructive",
      approved: "secondary",
      submitted: "outline",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  /** Filtered claims by search + status **/
  const filteredClaims = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return claims.filter((claim) => {
      const matchesSearch =
        claim.id.toLowerCase().includes(q) ||
        claim.policyNumber.toLowerCase().includes(q) ||
        claim.customerId.toLowerCase().includes(q) ||
        (claim.shopId || "").toLowerCase().includes(q) ||
        (claim.customerName || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || claim.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, claims]);

  /** KPI Stats **/
  const stats = useMemo(() => {
    return {
      total: claims.length,
      pending: claims.filter((c) => c.status === "pending").length,
      approved: claims.filter((c) => c.status === "approved").length,
      review: claims.filter((c) => c.status === "review").length,
    };
  }, [claims]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="page py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">magicClaims Admin Portal</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="page py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Claims
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Review
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Flagged for Review
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.review}</div>
            </CardContent>
          </Card>
        </div>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle>Claims Management</CardTitle>
            <CardDescription>
              Review and manage insurance claims
            </CardDescription>
          </CardHeader>
          <CardContent className="text-left">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-5">
              <div className="flex gap-2">
                {["all", "pending", "review", "submitted"].map((s) => (
                  <Button
                    key={s}
                    variant={statusFilter === s ? "default" : "outline"}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s === "all"
                      ? "All"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by claim ID, policy number, customer, or shop ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Claims List */}
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading claims…
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No claims found matching your criteria
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClaims.map((claim) => (
                  <Card
                    key={claim.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="pt-6 text-left">
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.9fr)]">
                        {/* Column 1: Claim Details */}
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg mb-2">
                              {claim.id}
                            </h3>
                            {getStatusBadge(claim.status)}
                          </div>
                          <div>
                            <div className="text-muted-foreground">Policy:</div>
                            <div className="font-medium break-all">
                              {claim.policyNumber}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Customer:
                            </div>
                            <div className="font-medium">
                              {claim.customerName}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Shop ID:
                            </div>
                            <div className="font-medium">
                              {claim.shopId || "—"}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Date:</div>
                            <div className="font-medium">{claim.date}</div>
                          </div>
                        </div>

                        {/* Column 2: Damage Photos */}
                        <div className="max-w-xs">
                          <div className="text-sm text-muted-foreground mb-2">
                            Damage Photos
                          </div>
                          {claim.photos?.length ? (
                            <div className="grid grid-cols-3 gap-2">
                              {claim.photos.slice(0, 6).map((src, i) => (
                                <div
                                  key={i}
                                  className="aspect-square bg-muted rounded overflow-hidden"
                                >
                                  <img
                                    src={src}
                                    alt={`photo-${i}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-24 rounded bg-muted/60 flex items-center justify-center text-xs text-muted-foreground">
                              <ImageIcon className="w-4 h-4 mr-1" /> No photos
                            </div>
                          )}
                        </div>

                        {/* Column 3: Invoice */}
                        <div className="max-w-xs">
                          <div className="text-sm text-muted-foreground mb-2">
                            Invoice
                          </div>
                          {claim.invoices?.length ? (
                            <div className="rounded overflow-hidden border">
                              <iframe
                                src={claim.invoices[0].url}
                                title={claim.invoices[0].name}
                                className="w-full h-28"
                              />
                              <div className="px-2 py-1 text-xs truncate">
                                {claim.invoices[0].name}
                              </div>
                            </div>
                          ) : (
                            <div className="h-24 rounded bg-muted/60 flex items-center justify-center text-xs text-muted-foreground">
                              <FileText className="w-4 h-4 mr-1" /> No invoice
                            </div>
                          )}
                        </div>

                        {/* Column 4: Analyze Button */}
                        <div className="flex flex-col items-start gap-3">
                          <Button
                            className="w-full mt-20"
                            onClick={() =>
                              navigate(`/admin/claims/${claim.id}`)
                            }
                          >
                            Analyze
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Wrench, LogOut, Search, Trash2, FileUp, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  getClaimsForRepairShop,
  deleteInvoiceForShop,
} from "../lib/invoiceService";

export default function RepairDashboard() {
  const [search, setSearch] = useState("");
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const repairShopId = "shop_test";

  // ---- Fetch all claims ----
  async function fetchClaims() {
    try {
      const response = await getClaimsForRepairShop(repairShopId);
      if (response?.claims) {
        const byClaim = response.claims.reduce((acc, c) => {
          const k = c.claim_id;
          const prev = acc[k];
          const curTs = c.invoice_date ? Date.parse(c.invoice_date) : -1;
          const prevTs = prev?.invoice_date
            ? Date.parse(prev.invoice_date)
            : -1;
          if (!prev || curTs >= prevTs) acc[k] = c;
          return acc;
        }, {});
        setClaims(Object.values(byClaim));
      } else {
        setClaims([]);
        toast.info("No claims found for this repair shop.");
      }
    } catch (err) {
      console.error("Error fetching claims:", err);
      toast.error("Failed to load claims. Please check server connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClaims();
    const onFocus = () => fetchClaims();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // ---- Filter and counts ----
  const filteredClaims = claims.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.claim_id?.toLowerCase().includes(q) ||
      c.customer_name?.toLowerCase().includes(q)
    );
  });

  const totalClaims = claims.length;
  const successfulClaims = claims.filter(
    (c) => !!c.invoice_id || !!c.file_url
  ).length;
  const pendingClaims = totalClaims - successfulClaims;

  // ---- Logout ----
  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
    window.location.href = "/";
  };

  // ---- Delete Invoice ----
  const handleDeleteInvoice = async (claim) => {
    if (!claim.invoice_id) {
      toast.error("No invoice found to delete.");
      return;
    }
    if (!window.confirm("Delete this invoice permanently?")) return;

    try {
      setDeleting(claim.claim_id);
      await deleteInvoiceForShop({
        repair_shop_id: repairShopId,
        invoice_id: claim.invoice_id,
      });

      setClaims((prev) =>
        prev.map((c) =>
          c.claim_id === claim.claim_id
            ? { ...c, invoice_id: null, file_url: null }
            : c
        )
      );

      toast.success(`Invoice deleted for Claim ${claim.claim_id}`);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(
        err?.response?.data?.detail || "Failed to delete invoice from server."
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Wrench className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-indigo-700">
              Repair Shop Dashboard
            </h1>
          </div>

          <Button
            variant="outline"
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/90 shadow-md rounded-xl border border-gray-200 text-center cursor-default">
            <CardContent className="py-4">
              <p className="text-sm text-gray-500 font-medium">Total Claims</p>
              <p className="text-2xl font-bold text-indigo-700">{totalClaims}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 shadow-md rounded-xl border border-gray-200 text-center cursor-default">
            <CardContent className="py-4">
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingClaims}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 shadow-md rounded-xl border border-gray-200 text-center cursor-default">
            <CardContent className="py-4">
              <p className="text-sm text-gray-500 font-medium">Successful</p>
              <p className="text-2xl font-bold text-green-600">
                {successfulClaims}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 mb-6">
          <Input
            placeholder="Search by Claim ID or Customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11"
          />
          <Button className="h-11 flex items-center gap-2 cursor-pointer">
            <Search className="w-4 h-4" /> Search
          </Button>
        </div>

        {/* Claims List */}
        {loading ? (
          <p className="text-center text-gray-600 mt-10">Loading claims...</p>
        ) : filteredClaims.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredClaims.map((claim) => {
              const hasInvoice = !!claim.invoice_id || !!claim.file_url;
              const displayStatus = hasInvoice ? "Successful" : "Pending";
              const statusColor = hasInvoice
                ? "text-green-600 font-semibold"
                : "text-gray-600";

              return (
                <Card
                  key={claim.claim_id}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition rounded-2xl cursor-default"
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-indigo-700">
                      Claim ID: {claim.claim_id}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>Customer:</strong> {claim.customer_name}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={statusColor}>{displayStatus}</span>
                    </p>
                    <p>
                      <strong>Claim Amount:</strong> ₹
                      {claim.claim_amount?.toLocaleString() || "—"}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(claim.date_of_incident).toLocaleDateString()}
                    </p>

                    {/* Actions */}
                    {hasInvoice ? (
                      <div className="flex flex-wrap gap-3 pt-3">
                        {(claim.invoice_id || claim.file_url) && (
                          <Link
                            to={`/repair/invoice/${repairShopId}/${claim.invoice_id}`}
                            className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 transition cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                            View Invoice
                          </Link>
                        )}

                        <button
                          onClick={() => handleDeleteInvoice(claim)}
                          disabled={deleting === claim.claim_id}
                          className="flex items-center gap-2 text-red-600 font-medium hover:text-red-800 hover:underline transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deleting === claim.claim_id
                            ? "Deleting..."
                            : "Delete Invoice"}
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <Link
                          to={`/repair/claims/${claim.claim_id}`}
                          state={{ claim }}
                          className="flex items-center gap-2 text-indigo-600 font-medium hover:underline hover:text-indigo-800 transition cursor-pointer"
                        >
                          <FileUp className="w-4 h-4" /> Upload Invoice
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-10">
            No matching claims found.
          </p>
        )}
      </div>
    </div>
  );
}

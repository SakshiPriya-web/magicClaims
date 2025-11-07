import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, FileText, FileUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  uploadInvoicePdf,
  deleteInvoiceForShop,
  getClaimsForRepairShop,
} from "../lib/invoiceService";

export default function RepairClaimDetail() {
  const { claimId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState("Pending");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedInvoice, setUploadedInvoice] = useState(null);
  const [claim, setClaim] = useState(state?.claim || null);
  const [loading, setLoading] = useState(!state?.claim);
  const fileInputRef = useRef(null);

  const repairShopId = "shop_test";

  // ---- Fetch ALL details for the clicked card (from claimuploadstobedone) ----
  useEffect(() => {
    async function fetchClaim() {
      try {
        const response = await getClaimsForRepairShop(repairShopId);
        const found = response?.claims?.find(
          (c) => c.claim_id?.trim().toLowerCase() === claimId?.trim().toLowerCase()
        );

        if (!found) {
          toast.error("Claim not found for this repair shop.");
          setLoading(false);
          return;
        }

        setClaim(found);
        // API can return either `claim_status` or `status` depending on view
        setStatus(found.claim_status || found.status || "Pending");

        // If invoice exists on this claim, preload it for the page
        if (found.invoice_id) {
          setUploadedInvoice({
            invoice_id: found.invoice_id,
            file_url: found.invoice_file_url || found.file_url || null,
          });
        }
      } catch (err) {
        console.error("Error fetching claim:", err);
        toast.error("Failed to fetch claim details.");
      } finally {
        setLoading(false);
      }
    }

    if (!state?.claim) fetchClaim();
    else {
      // Normalize state.claim to full shape if you navigated with partial claim
      const sc = state.claim;
      setClaim(sc);
      setStatus(sc.claim_status || sc.status || "Pending");
      if (sc.invoice_id) {
        setUploadedInvoice({
          invoice_id: sc.invoice_id,
          file_url: sc.invoice_file_url || sc.file_url || null,
        });
      }
      setLoading(false);
    }
  }, [claimId, state]);

  // ---- File selection ----
  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;
    if (uploaded.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file!");
      return;
    }
    setFile(uploaded);
  };

  // ---- Upload invoice (replace if exists) ----
  const handleUpload = async () => {
    const realClaimId = claim?.claim_id || claimId;
    const realCustomerId = claim?.customer_id;

    if (!file) return toast.error("Please select a PDF file to upload.");
    if (!realClaimId || !realCustomerId)
      return toast.error("Invalid claim or customer data. Please reload the page.");

    try {
      setIsUploading(true);

      if (uploadedInvoice?.invoice_id) {
        toast.info("Replacing old invoice...");
        await deleteInvoiceForShop({
          repair_shop_id: repairShopId,
          invoice_id: uploadedInvoice.invoice_id,
        });
        await new Promise((r) => setTimeout(r, 350));
      }

      const resp = await uploadInvoicePdf({
        repair_shop_id: repairShopId,
        customer_id: realCustomerId,
        claim_id: realClaimId,
        file,
      });

      setUploadedInvoice(resp);
      setStatus("Completed");
      toast.success("Invoice uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(
        err?.response?.data?.detail || "Upload failed — please verify claim_id & server."
      );
    } finally {
      setIsUploading(false);
    }
  };
  

  // ---- Delete invoice ----
  const handleDelete = async () => {
    try {
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (!uploadedInvoice?.invoice_id) {
        setFile(null);
        setUploadedInvoice(null);
        setStatus("Pending");
        toast.info("Invoice removed locally.");
        return;
      }

      await deleteInvoiceForShop({
        repair_shop_id: repairShopId,
        invoice_id: uploadedInvoice.invoice_id,
      });

      setFile(null);
      setUploadedInvoice(null);
      setStatus("Pending");
      toast.success("Invoice deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete invoice from server.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading claim details...
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        Claim not found.
      </div>
    );
  }

  // Helpers with graceful fallbacks (API fields can vary slightly)
  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "—");
  const safe = (v) => (v ?? v === 0 ? v : "—");

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/repair-dashboard")}
          className="mb-4 flex items-center gap-2 text-indigo-700 hover:text-indigo-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>

        {/* Card */}
        <Card className="bg-white/80 backdrop-blur-sm border shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Claim Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8 text-gray-700">
            {/* --- Claim Details --- */}
            <section>
              <h2 className="text-lg font-semibold text-indigo-600 mb-2">Claim Information</h2>
              <div className="grid md:grid-cols-2 gap-x-6 text-sm">
                <p><strong>Claim ID:</strong> {safe(claim.claim_id)}</p>
                <p><strong>Status:</strong> {safe(status)}</p>
                <p><strong>Description:</strong> {safe(claim.claim_description || claim.description)}</p>
                <p><strong>Claim Amount:</strong> ₹{safe(claim.claim_amount)?.toLocaleString?.() ?? safe(claim.claim_amount)}</p>
                <p><strong>Date of Incident:</strong> {fmt(claim.date_of_incident)}</p>
                <p><strong>Created At:</strong> {fmt(claim.created_at)}</p>
              </div>
            </section>

            {/* --- Policy Details --- */}
            <section>
              <h2 className="text-lg font-semibold text-indigo-600 mb-2">Policy Details</h2>
              <div className="grid md:grid-cols-2 gap-x-6 text-sm">
                <p><strong>Policy ID:</strong> {safe(claim.policy_id)}</p>
                <p><strong>Policy Number:</strong> {safe(claim.policy_number)}</p>
                <p><strong>Start Date:</strong> {fmt(claim.policy_start_date)}</p>
                <p><strong>End Date:</strong> {fmt(claim.policy_end_date)}</p>
                <p><strong>Max Coverage:</strong> ₹{safe(claim.policy_max_amount)?.toLocaleString?.() ?? safe(claim.policy_max_amount)}</p>
              </div>
            </section>

            {/* --- Vehicle Details --- */}
            <section>
              <h2 className="text-lg font-semibold text-indigo-600 mb-2">Vehicle Details</h2>
              <div className="grid md:grid-cols-2 gap-x-6 text-sm">
                <p><strong>Car ID:</strong> {safe(claim.car_id)}</p>
                <p><strong>Make:</strong> {safe(claim.make)}</p>
                <p><strong>Model:</strong> {safe(claim.model)}</p>
                <p><strong>Year:</strong> {safe(claim.year)}</p>
                <p><strong>VIN:</strong> {safe(claim.vin)}</p>
                <p><strong>Registration:</strong> {safe(claim.registration_number)}</p>
              </div>
            </section>

            {/* --- Customer Details --- */}
            <section>
              <h2 className="text-lg font-semibold text-indigo-600 mb-2">Customer Details</h2>
              <div className="grid md:grid-cols-2 gap-x-6 text-sm">
                <p><strong>Customer ID:</strong> {safe(claim.customer_id)}</p>
                <p><strong>Name:</strong> {safe(claim.customer_name)}</p>
                <p><strong>Phone:</strong> {safe(claim.phone_number)}</p>
                <p><strong>Address:</strong> {safe(claim.address)}</p>
              </div>
            </section>

            {/* --- Upload Section --- */}
            <section>
              <h2 className="text-lg font-semibold text-indigo-600 mb-2">Invoice Upload</h2>
              <Label>Upload Invoice (PDF)</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                <Button
                  disabled={!file || isUploading}
                  className="flex items-center gap-2"
                  onClick={handleUpload}
                >
                  <FileUp className="w-4 h-4" />
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>

              {/* Local preview before upload */}
              {file && (
                <div className="mt-4">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <embed
                    src={URL.createObjectURL(file)}
                    type="application/pdf"
                    width="100%"
                    height="500px"
                    className="rounded-lg border border-gray-300 mt-3"
                  />
                </div>
              )}

              {/* Uploaded invoice info */}
              {uploadedInvoice && (
                <div className="mt-4 border-t pt-3 text-sm space-y-2">
                  <p className="text-green-700">
                    <strong>Invoice ID:</strong> {uploadedInvoice.invoice_id}
                  </p>
                  {uploadedInvoice.file_url && (
                    <a
                      href={uploadedInvoice.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 underline"
                    >
                      View Uploaded Invoice
                    </a>
                  )}
                  <Button
                    onClick={handleDelete}
                    size="sm"
                    className="mt-3 bg-red-500/90 hover:bg-red-600 text-white font-medium flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Invoice
                  </Button>
                </div>
              )}
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

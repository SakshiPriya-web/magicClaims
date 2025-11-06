// src/pages/InvoiceDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";

export default function InvoiceDetail() {
  const { repairShopId, invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const { data } = await api.get(`/api/invoice/${repairShopId}/${invoiceId}`);
        setInvoice(data.invoice);
      } catch (err) {
        console.error("Error fetching invoice:", err);
        toast.error("Failed to load invoice details.");
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [repairShopId, invoiceId]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading invoice details...
      </div>
    );

  if (!invoice)
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        Invoice not found.
      </div>
    );

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
              <FileText className="w-5 h-5" /> Invoice Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8 text-gray-700">
            {/* --- Invoice Summary --- */}
            <section>
              <h2 className="text-lg font-semibold text-indigo-600 mb-2">Invoice Summary</h2>
              <div className="grid md:grid-cols-2 gap-x-6 text-sm">
                <p><strong>Invoice ID:</strong> {invoice.invoice_id}</p>
                <p><strong>Invoice Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
                {/* <p><strong>Total Amount:</strong> ₹{invoice.total_amount?.toLocaleString() ?? "—"}</p> */}
                <p><strong>File:</strong>{" "}
                  <a
                    href={invoice.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline"
                  >
                    Open PDF
                  </a>
                </p>
              </div>
            </section>

            {/* --- Claim Details --- */}
            <section>
              <h2 className="text-lg font-semibold text-indigo-600 mb-2">Claim Details</h2>
              <div className="grid md:grid-cols-2 gap-x-6 text-sm">
                <p><strong>Claim ID:</strong> {invoice.claim_id}</p>
                <p><strong>Date of Incident:</strong> {new Date(invoice.date_of_incident).toLocaleDateString()}</p>
                <p><strong>Description:</strong> {invoice.claim_description}</p>
                <p><strong>Status:</strong> {invoice.claim_status}</p>
                <p><strong>Claim Amount:</strong> ₹{invoice.claim_amount?.toLocaleString()}</p>
              </div>
            </section>

            {/* --- Policy Details --- */}
            <section>
              <h2 className="text-lg font-semibold text-indigo-600 mb-2">Policy Details</h2>
              <div className="grid md:grid-cols-2 gap-x-6 text-sm">
                <p><strong>Policy ID:</strong> {invoice.policy_id}</p>
                <p><strong>Policy Number:</strong> {invoice.policy_number}</p>
                <p><strong>Start Date:</strong> {new Date(invoice.policy_start_date).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(invoice.policy_end_date).toLocaleDateString()}</p>
                <p><strong>Max Coverage:</strong> ₹{invoice.policy_max_amount?.toLocaleString()}</p>
              </div>
            </section>

            {/* --- Vehicle Details --- */}
            <section>
              <h2 className="text-lg font-semibold text-indigo-600 mb-2">Vehicle Details</h2>
              <div className="grid md:grid-cols-2 gap-x-6 text-sm">
                <p><strong>Car ID:</strong> {invoice.car_id}</p>
                <p><strong>Make:</strong> {invoice.make}</p>
                <p><strong>Model:</strong> {invoice.model}</p>
                <p><strong>Year:</strong> {invoice.year}</p>
                <p><strong>VIN:</strong> {invoice.vin}</p>
                <p><strong>Registration:</strong> {invoice.registration_number}</p>
              </div>
            </section>

            {/* --- Customer Details --- */}
            <section>
              <h2 className="text-lg font-semibold text-indigo-600 mb-2">Customer Details</h2>
              <div className="grid md:grid-cols-2 gap-x-6 text-sm">
                <p><strong>Customer ID:</strong> {invoice.customer_id}</p>
                <p><strong>Name:</strong> {invoice.customer_name}</p>
                <p><strong>Phone:</strong> {invoice.phone_number}</p>
                <p><strong>Address:</strong> {invoice.address}</p>
              </div>
            </section>

            {/* --- Repair Shop Details --- */}
            <section>
              <h2 className="text-lg font-semibold text-indigo-600 mb-2">Repair Shop Details</h2>
              <div className="grid md:grid-cols-2 gap-x-6 text-sm">
                <p><strong>Shop Name:</strong> {invoice.shop_name}</p>
                <p><strong>Email:</strong> {invoice.contact_email}</p>
                <p><strong>Address:</strong> {invoice.shop_address}</p>
              </div>
            </section>

            {/* --- PDF Preview --- */}
            <section>
              <h2 className="text-lg font-semibold text-indigo-600 mb-2">Invoice PDF Preview</h2>
              {invoice.file_url ? (
                <embed
                  src={invoice.file_url}
                  type="application/pdf"
                  width="100%"
                  height="600px"
                  className="rounded-lg border border-gray-300"
                />
              ) : (
                <p className="text-gray-500 italic">No PDF file available.</p>
              )}
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

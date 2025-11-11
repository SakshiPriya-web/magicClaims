import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, User, Car, Calendar, MapPin, DollarSign, CheckCircle,
  XCircle, AlertTriangle, FileText, Image as ImageIcon,
} from "lucide-react";

/* ------- mock data (same as before) ------- */
const mockClaimData = {
  id: "CLM-2024-001",
  status: "pending",
  policyNumber: "POL-2024-5678",
  customerId: "CUST-001",
  customerName: "John Smith",
  customerEmail: "john.smith@email.com",
  customerPhone: "(555) 123-4567",
  shopId: "SHOP-101",
  shopName: "Quality Auto Repair",
  shopAddress: "456 Repair St, Springfield, IL",
  shopPhone: "(555) 987-6543",
  vehicle: "2020 Toyota Camry",
  vin: "1HGBH41JXMN109186",
  licensePlate: "ABC-1234",
  incidentDate: "2024-01-10",
  incidentTime: "14:30",
  location: "123 Main St, Springfield, IL",
  description:
    "Rear-end collision at traffic light. Another vehicle failed to stop and hit the rear bumper.",
  estimatedAmount: "$2,500",
  submittedDate: "2024-01-15",
  images: [
    { id: 1, url: "/placeholder.svg", description: "Rear bumper damage" },
    { id: 2, url: "/placeholder.svg", description: "Left tail light broken" },
    { id: 3, url: "/placeholder.svg", description: "Trunk alignment issue" },
  ],
  invoices: [
    { id: 1, name: "repair-invoice-001.pdf", size: "245 KB", uploadDate: "2024-01-18", shopId: "SHOP-101", url: "/sample.pdf" },
  ],
};

const AdminClaimDetail = () => {
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // NEW: analysis states
  const [photoAnalysis, setPhotoAnalysis] = useState(null);
  const [invoiceAnalysis, setInvoiceAnalysis] = useState(null);
  const [matching, setMatching] = useState(false);
  const [matchResults, setMatchResults] = useState(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { claimId } = useParams();

  const claim = mockClaimData;

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({ title: "Claim Approved", description: `Claim ${claim.id} has been approved for processing.` });
      navigate("/admin/dashboard");
    }, 800);
  };
  const handleReject = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({ title: "Claim Rejected", description: `Claim ${claim.id} has been rejected.`, variant: "destructive" });
      navigate("/admin/dashboard");
    }, 800);
  };
  const handleFlagForReview = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({ title: "Flagged for Review", description: `Claim ${claim.id} has been flagged for additional review.` });
    }, 600);
  };

  // ---- Analysis stubs → populate results & open accordions
  const analyzePhotos = () => {
    const results = [
      { label: "Detected parts", value: "Rear bumper, Left tail light, Trunk lid" },
      { label: "Damage severity", value: "Moderate (est. 2–3 panels)" },
      { label: "Scratches/Dents", value: "Multiple dents and paint scuffs on bumper" },
      { label: "Confidence", value: "0.86" },
    ];
    setPhotoAnalysis(results);
    toast({ title: "Analyzed photos", description: "Visual analysis completed." });
  };

  const analyzeInvoice = () => {
    const results = [
      { label: "Subtotal (parts)", value: "$1,650" },
      { label: "Labor", value: "$650" },
      { label: "Taxes/Fees", value: "$200" },
      { label: "Total", value: "$2,500" },
      { label: "Key items", value: "Bumper cover, Tail light LH, Paint & refinish" },
    ];
    setInvoiceAnalysis(results);
    toast({ title: "Analyzed invoice", description: "Text extraction completed." });
  };

  const matchParts = () => {
    setMatching(true);
    setTimeout(() => {
      setMatching(false);
      setMatchResults([
        { part: "Rear Bumper", inPhoto: true, inInvoice: true, note: "OK" },
        { part: "Left Tail Light", inPhoto: true, inInvoice: true, note: "OK" },
        { part: "Trunk Lid", inPhoto: true, inInvoice: false, note: "Missing in invoice" },
        { part: "Paint/Refinish", inPhoto: false, inInvoice: true, note: "Not evident in photos" },
      ]);
      toast({ title: "Match complete", description: "Compared detected parts in photos vs invoice line items." });
    }, 900);
  };

  const getStatusBadge = (status) => {
    const variants = { pending: "default", review: "destructive", approved: "secondary" };
    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="page py-4">
          <Button variant="ghost" onClick={() => navigate("/admin/dashboard")} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h1 className="text-2xl font-bold leading-tight">Claim Details</h1>
              <p className="text-muted-foreground">{claim.id}</p>
            </div>
            {getStatusBadge(claim.status)}
          </div>
        </div>
      </header>

      <main className="page py-8 space-y-6">
        {/* TOP: 4 equal-height columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="panel">
            <CardHeader>
              <CardTitle className="row-title"><User className="h-5 w-5" /> Customer Information</CardTitle>
              <CardDescription>ID: {claim.customerId}</CardDescription>
            </CardHeader>
            <CardContent className="content-list">
              <div><span className="muted">Name:</span> <span className="font-medium">{claim.customerName}</span></div>
              <div><span className="muted">Email:</span> <span className="font-medium">{claim.customerEmail}</span></div>
              <div><span className="muted">Phone:</span> <span className="font-medium">{claim.customerPhone}</span></div>
              <div><span className="muted">Policy #:</span> <span className="font-medium">{claim.policyNumber}</span></div>
            </CardContent>
          </Card>

          <Card className="panel">
            <CardHeader>
              <CardTitle className="row-title"><Car className="h-5 w-5" /> Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="content-list">
              <div><span className="muted">Vehicle:</span> <span className="font-medium">{claim.vehicle}</span></div>
              <div><span className="muted">VIN:</span> <span className="font-medium">{claim.vin}</span></div>
              <div><span className="muted">License Plate:</span> <span className="font-medium">{claim.licensePlate}</span></div>
            </CardContent>
          </Card>

          <Card className="panel">
            <CardHeader>
              <CardTitle className="row-title"><AlertTriangle className="h-5 w-5" /> Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="content-list">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{claim.incidentDate} at {claim.incidentTime}</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{claim.location}</span></div>
              <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{claim.estimatedAmount}</span></div>
              <div className="text-xs text-muted-foreground">Submitted: {claim.submittedDate}</div>
              <div className="text-sm mt-1"><span className="muted">Description:</span><p className="mt-1">{claim.description}</p></div>
            </CardContent>
          </Card>

          <Card className="panel">
            <CardHeader>
              <CardTitle className="row-title"><FileText className="h-5 w-5" /> Repair Shop Information</CardTitle>
              <CardDescription>ID: {claim.shopId}</CardDescription>
            </CardHeader>
            <CardContent className="content-list">
              <div><span className="muted">Name:</span> <span className="font-medium">{claim.shopName}</span></div>
              <div><span className="muted">Address:</span> <span className="font-medium">{claim.shopAddress}</span></div>
              <div><span className="muted">Phone:</span> <span className="font-medium">{claim.shopPhone}</span></div>
            </CardContent>
          </Card>
        </div>

        {/* SECOND ROW: 2 matched columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Photos */}
          <Card className="panel">
            <CardHeader>
              <CardTitle>Damage Photos</CardTitle>
              <CardDescription>{claim.images.length} photos uploaded</CardDescription>
            </CardHeader>
            <CardContent className="media-body">
              {claim.images.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {claim.images.map((image) => (
                    <div key={image.id} className="space-y-2">
                      <div className="media-frame">
                        <img src={image.url} alt={image.description} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm text-muted-foreground">{image.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <ImageIcon className="w-4 h-4 mr-2" /> No photos uploaded
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3">
              <Button onClick={analyzePhotos}>Analyze Photos</Button>

              {/* Collapsible output for Photos */}
              {photoAnalysis && (
                <Accordion type="single" collapsible defaultValue="photo-analysis">
                  <AccordionItem value="photo-analysis" className="border rounded-md">
                    <AccordionTrigger className="px-4">Photo Analysis Results</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                        {photoAnalysis.map((r, i) => (
                          <li key={i} className="flex justify-between gap-4 border-b pb-2">
                            <span className="text-muted-foreground">{r.label}</span>
                            <span className="font-medium text-right">{r.value}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardFooter>
          </Card>

          {/* Invoice */}
          <Card className="panel">
            <CardHeader>
              <CardTitle>Repair Invoices</CardTitle>
              <CardDescription>Invoices uploaded by repair shop</CardDescription>
            </CardHeader>
            <CardContent className="media-body">
              {claim.invoices.length ? (
                <>
                  {claim.invoices.map((invoice) => (
                    <div key={invoice.id} className="space-y-2">
                      <div className="media-frame">
                        <iframe src={invoice.url} title={invoice.name} className="w-full h-full" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <p className="font-medium">{invoice.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.size} • Uploaded {invoice.uploadDate} • Shop: {invoice.shopId}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="empty-state">
                  <FileText className="w-4 h-4 mr-2" /> No invoice uploaded
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3">
              <Button onClick={analyzeInvoice}>Analyze Invoice</Button>

              {/* Collapsible output for Invoice */}
              {invoiceAnalysis && (
                <Accordion type="single" collapsible defaultValue="invoice-analysis">
                  <AccordionItem value="invoice-analysis" className="border rounded-md">
                    <AccordionTrigger className="px-4">Invoice Analysis Results</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                        {invoiceAnalysis.map((r, i) => (
                          <li key={i} className="flex justify-between gap-4 border-b pb-2">
                            <span className="text-muted-foreground">{r.label}</span>
                            <span className="font-medium text-right">{r.value}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* MATCH SECTION */}
        <Card className="panel">
          <CardHeader>
            <CardTitle>Match Parts from Photo &amp; Invoice</CardTitle>
            <CardDescription>Compare detected parts in the photos to line items in the invoice and highlight discrepancies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={matchParts} disabled={matching}>{matching ? "Matching..." : "Run Matching"}</Button>
            </div>
            {matchResults && (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="text-left p-3">Part</th>
                      <th className="text-left p-3">Seen in Photos</th>
                      <th className="text-left p-3">In Invoice</th>
                      <th className="text-left p-3">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchResults.map((r, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-3 font-medium">{r.part}</td>
                        <td className="p-3">{r.inPhoto ? <Badge variant="secondary">Yes</Badge> : <Badge variant="outline">No</Badge>}</td>
                        <td className="p-3">{r.inInvoice ? <Badge variant="secondary">Yes</Badge> : <Badge variant="outline">No</Badge>}</td>
                        <td className="p-3">
                          {r.note.includes("Missing") ? (
                            <Badge variant="destructive">{r.note}</Badge>
                          ) : r.note.includes("Not evident") ? (
                            <Badge variant="outline">{r.note}</Badge>
                          ) : (
                            <span className="text-muted-foreground">{r.note}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ACTIONS */}
        <Card className="panel">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Review and process this claim</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea id="notes" placeholder="Add notes about this claim..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={4} />
            </div>
            <div className="space-y-2">
              <Button className="w-full" onClick={handleApprove} disabled={isProcessing}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Claim
              </Button>
              <Button variant="outline" className="w-full" onClick={handleFlagForReview} disabled={isProcessing}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Flag for Review
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleReject} disabled={isProcessing}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject Claim
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Local utilities for alignment (no global css changes) */}
      <style>{`
        .page { margin-left: auto; margin-right: auto; width: 100%; max-width: 950px; padding-left: 1rem; padding-right: 1rem; }
        .panel { display: flex; flex-direction: column; height: 100%; }
        .row-title { display: flex; align-items: center; gap: .5rem; }
        .content-list { display: grid; gap: .5rem; font-size: .9rem; }
        .muted { color: hsl(var(--muted-foreground)); }
        .media-body { display: flex; flex-direction: column; gap: 1rem; }
        .media-frame { height: 16rem; border-radius: .75rem; overflow: hidden; border: 1px solid hsl(var(--border)); background: hsl(var(--muted)); }
        .empty-state { height: 8rem; border-radius: .75rem; display: flex; align-items: center; justify-content: center; background: hsl(var(--muted) / .6); color: hsl(var(--muted-foreground)); font-size: .875rem; }
        @media (min-width: 1024px) { .media-frame { height: 18rem; } }
      `}</style>
    </div>
  );
};

export default AdminClaimDetail;

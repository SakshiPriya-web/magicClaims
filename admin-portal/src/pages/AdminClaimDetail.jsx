import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  User,
  Car,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";

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
  description: "Rear-end collision at traffic light. Another vehicle failed to stop and hit the rear bumper.",
  estimatedAmount: "$2,500",
  submittedDate: "2024-01-15",
  images: [
    { id: 1, url: "/placeholder.svg", description: "Rear bumper damage" },
    { id: 2, url: "/placeholder.svg", description: "Left tail light broken" },
    { id: 3, url: "/placeholder.svg", description: "Trunk alignment issue" },
  ],
  invoices: [
    { id: 1, name: "repair-invoice-001.pdf", size: "245 KB", uploadDate: "2024-01-18", shopId: "SHOP-101" },
  ],
};

const AdminClaimDetail = () => {
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { claimId } = useParams();

  const claim = mockClaimData;

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Claim Approved",
        description: `Claim ${claim.id} has been approved for processing.`,
      });
      navigate("/admin/dashboard");
    }, 1000);
  };

  const handleReject = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Claim Rejected",
        description: `Claim ${claim.id} has been rejected.`,
        variant: "destructive",
      });
      navigate("/admin/dashboard");
    }, 1000);
  };

  const handleFlagForReview = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Flagged for Review",
        description: `Claim ${claim.id} has been flagged for additional review.`,
      });
    }, 1000);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "default",
      review: "destructive",
      approved: "secondary",
    };
    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/admin/dashboard")} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Claim Details</h1>
              <p className="text-muted-foreground">{claim.id}</p>
            </div>
            {getStatusBadge(claim.status)}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Customer ID</Label>
                  <p className="font-medium">{claim.customerId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{claim.customerName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{claim.customerEmail}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{claim.customerPhone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Policy Number</Label>
                  <p className="font-medium">{claim.policyNumber}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Vehicle</Label>
                  <p className="font-medium">{claim.vehicle}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">VIN</Label>
                  <p className="font-medium">{claim.vin}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">License Plate</Label>
                  <p className="font-medium">{claim.licensePlate}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Incident Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Incident Date
                    </Label>
                    <p className="font-medium">{claim.incidentDate} at {claim.incidentTime}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <p className="font-medium">{claim.location}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Estimated Amount
                    </Label>
                    <p className="font-medium text-lg">{claim.estimatedAmount}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Submitted Date</Label>
                    <p className="font-medium">{claim.submittedDate}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-2">{claim.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Damage Photos</CardTitle>
                <CardDescription>{claim.images.length} photos uploaded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {claim.images.map((image) => (
                    <div key={image.id} className="space-y-2">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.description}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{image.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Repair Shop Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Shop ID</Label>
                  <p className="font-medium">{claim.shopId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Shop Name</Label>
                  <p className="font-medium">{claim.shopName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-medium">{claim.shopAddress}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{claim.shopPhone}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Repair Invoices</CardTitle>
                <CardDescription>Invoices uploaded by repair shop</CardDescription>
              </CardHeader>
              <CardContent>
                {claim.invoices.length > 0 ? (
                  <div className="space-y-2">
                    {claim.invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{invoice.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {invoice.size} • Uploaded {invoice.uploadDate} • Shop: {invoice.shopId}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No invoices uploaded yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Review and process this claim</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Admin Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about this claim..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={handleApprove}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Claim
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleFlagForReview}
                    disabled={isProcessing}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Flag for Review
                  </Button>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Claim
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminClaimDetail;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Clock, CheckCircle, AlertTriangle, LogOut } from "lucide-react";

const mockClaims = [
  {
    id: "CLM-2024-001",
    policyNumber: "POL-2024-5678",
    customerId: "CUST-001",
    shopId: "SHOP-101",
    date: "2024-01-15",
    status: "pending",
  },
  {
    id: "CLM-2024-002",
    policyNumber: "POL-2024-5679",
    customerId: "CUST-002",
    shopId: "SHOP-102",
    date: "2024-01-14",
    status: "review",
  },
  {
    id: "CLM-2024-003",
    policyNumber: "POL-2024-5680",
    customerId: "CUST-003",
    shopId: "SHOP-101",
    date: "2024-01-13",
    status: "approved",
  },
  {
    id: "CLM-2024-004",
    policyNumber: "POL-2024-5681",
    customerId: "CUST-004",
    shopId: "SHOP-103",
    date: "2024-01-12",
    status: "pending",
  },
  {
    id: "CLM-2024-005",
    policyNumber: "POL-2024-5682",
    customerId: "CUST-005",
    shopId: "SHOP-102",
    date: "2024-01-11",
    status: "approved",
  },
];

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();

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
    };
    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const filteredClaims = mockClaims.filter((claim) => {
    const matchesSearch =
      claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.shopId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockClaims.length,
    pending: mockClaims.filter((c) => c.status === "pending").length,
    approved: mockClaims.filter((c) => c.status === "approved").length,
    review: mockClaims.filter((c) => c.status === "review").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Insurance Admin Portal</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged for Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.review}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Claims Management</CardTitle>
            <CardDescription>Review and manage insurance claims</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    onClick={() => setStatusFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === "pending" ? "default" : "outline"}
                    onClick={() => setStatusFilter("pending")}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={statusFilter === "review" ? "default" : "outline"}
                    onClick={() => setStatusFilter("review")}
                  >
                    Review
                  </Button>
                </div>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by claim ID, policy number, customer ID, or shop ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredClaims.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No claims found matching your criteria
                  </div>
                ) : (
                  filteredClaims.map((claim) => (
                    <Card key={claim.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/admin/claims/${claim.id}`)}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{claim.id}</h3>
                              {getStatusBadge(claim.status)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Policy:</span>
                                <p className="font-medium">{claim.policyNumber}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Customer ID:</span>
                                <p className="font-medium">{claim.customerId}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Shop ID:</span>
                                <p className="font-medium">{claim.shopId}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Date:</span>
                                <p className="font-medium">{claim.date}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;

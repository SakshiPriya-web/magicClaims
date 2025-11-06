// src/pages/ClaimSubmitted.jsx
import { Shield, LogOut, CheckCircle2, FileImage, Home, List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function ClaimSubmitted() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // We expect you navigated with: navigate("/claim-submitted", { state: { claimId: response.data } });
  const payload = state?.claimId ?? state ?? null;

  const status = (payload && payload.status) || "success";
  const message = (payload && payload.message) || "Your claim was submitted successfully.";
  const claimId = (payload && (payload.claim_id || payload.claimId)) || "—";
  const uploadedFiles = Array.isArray(payload?.uploaded_files) ? payload.uploaded_files : [];

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header (same look & feel) */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/home")}>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">magicClaims</h1>
              <p className="text-sm text-muted-foreground">Policy Holder Portal</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <CardTitle className="text-2xl">Claim Submitted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{String(status)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Message</p>
              <p className="font-medium">{String(message)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Claim ID</p>
              <p className="font-medium">{String(claimId)}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Uploaded Files</p>
              {uploadedFiles.length === 0 ? (
                <p className="text-sm italic text-muted-foreground">No files listed by the server.</p>
              ) : (
                <ul className="space-y-2">
                  {uploadedFiles.map((file, idx) => {
                    // Each item could be string or object with fields
                    const label =
                      typeof file === "string"
                        ? file
                        : file?.file_name || file?.url || JSON.stringify(file);

                    const href =
                      typeof file === "string"
                        ? file.startsWith("http")
                          ? file
                          : undefined
                        : file?.url;

                    return (
                      <li key={idx} className="flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-primary" />
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            {label}
                          </a>
                        ) : (
                          <span className="text-sm">{label}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={() => navigate("/home")}>
                {/* <Home className="w-4 h-4 mr-2" /> */}
                Go to Home
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate("/tracking")}>
                {/* <List className="w-4 h-4 mr-2" /> */}
                Track Claims
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

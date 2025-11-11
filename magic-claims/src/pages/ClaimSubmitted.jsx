// src/pages/ClaimSubmitted.jsx
import { Shield, LogOut, CheckCircle2, FileText, Home, List } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

/** Base parts for Supabase Storage public URLs */
const SUPABASE_PROJECT_BASE = "https://kwzlzelrgfbcvconsqvm.supabase.co";
const SUPABASE_PUBLIC_PREFIX = "/storage/v1/object/public/";
const SUPABASE_BUCKET = "claims-media";

/** ---- URL helpers ---- */
function isHttpUrl(s) {
  return typeof s === "string" && /^https?:\/\//i.test(s);
}

function isImageUrl(url) {
  if (typeof url !== "string") return false;
  const q = url.split("?")[0].toLowerCase();
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(q);
}

/**
 * Resolves a payload item (string or object) to a usable public URL.
 * Handles:
 *  1) Full http(s) URLs
 *  2) Already-has "/storage/v1/object/public/..." paths
 *  3) Raw storage keys like "claims-media/<claim>/<file>.jpg" or "claims/<...>"
 */
function toUrlFromPayloadItem(item) {
  // Prefer explicit URL-like fields if object
  let raw =
    typeof item === "string"
      ? item
      : item?.url ||
        item?.file_url ||
        item?.public_url ||
        item?.storage_path ||
        item?.path ||
        item?.file_name ||
        item?.name ||
        "";

  if (!raw) return undefined;

  // Case 1: Full URL
  if (isHttpUrl(raw)) return raw;

  // Normalize (strip protocol domain if someone embedded the supabase domain incorrectly)
  const normalized = raw.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/+/, "");

  // Case 2: Already includes public storage prefix
  if (normalized.startsWith("storage/v1/object/public/") || normalized.startsWith("/storage/v1/object/public/")) {
    return `${SUPABASE_PROJECT_BASE}/${normalized.replace(/^\/+/, "")}`;
  }

  // Case 3: Raw storage keys
  // - Remove legacy "claims/" prefix
  let rel = normalized.replace(/^claims\//, "");
  // - Ensure it starts with the bucket name
  if (!rel.startsWith(`${SUPABASE_BUCKET}/`)) {
    rel = `${SUPABASE_BUCKET}/${rel}`;
  }
  return `${SUPABASE_PROJECT_BASE}${SUPABASE_PUBLIC_PREFIX}${rel.replace(/^\/+/, "")}`;
}

export default function ClaimSubmitted() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // We expect you navigated with: navigate("/claim-submitted", { state: { claimId: response.data } });
  const payload = state?.claimId ?? state ?? null;

  const status = (payload && payload.status) || "success";
  const message = (payload && payload.message) || "Your claim was submitted successfully.";
  const claimId = (payload && (payload.claim_id || payload.claimId)) || "—";
  const uploadedFiles = Array.isArray(payload?.uploaded_files) ? payload.uploaded_files : [];

  const handleLogout = () => navigate("/");

  // Prepare files → { url, label, isImage }
  const files = uploadedFiles.map((item) => {
    const url = toUrlFromPayloadItem(item);
    const label =
      typeof item === "string"
        ? item
        : item?.file_name || item?.original_name || item?.name || item?.storage_path || url || "file";
    return { url, label, isImage: url ? isImageUrl(url) : false };
  });

  // Debug if needed:
  // console.log("ClaimSubmitted payload:", payload);
  // console.log("Resolved files:", files);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

          <CardContent className="space-y-6 text-left">
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
              <p className="font-medium break-all">{String(claimId)}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Uploaded Files</p>

              {files.length === 0 ? (
                <p className="text-sm italic text-muted-foreground">No files listed by the server.</p>
              ) : (
                <>
                  {/* Image thumbnails */}
                  {files.some((f) => f.isImage) && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Images</p>
                      <div className="flex flex-wrap gap-3">
                        {files
                          .filter((f) => f.isImage)
                          .map((f, idx) => (
                            <a
                              key={`img-${idx}`}
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                              title={f.label}
                            >
                              <img
                                src={f.url}
                                alt={f.label}
                                className="w-20 h-20 rounded-md object-cover border"
                                onError={(e) => {
                                  // fallback to link text if image fails
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </a>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Non-image files */}
                  {files.some((f) => !f.isImage) && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-2">Other files</p>
                      <ul className="space-y-2">
                        {files
                          .filter((f) => !f.isImage)
                          .map((f, idx) => (
                            <li key={`file-${idx}`} className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              {f.url ? (
                                <a
                                  href={f.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary underline break-all"
                                >
                                  {f.label}
                                </a>
                              ) : (
                                <span className="text-sm break-all">{f.label}</span>
                              )}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </>
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

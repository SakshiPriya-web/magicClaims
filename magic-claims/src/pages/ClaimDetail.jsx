// src/pages/ClaimDetail.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Shield,
  LogOut,
  Car,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  X,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BASE_URL = "https://magicclaim.up.railway.app";
const EDITED_BY_USER_ID = 1; // <-- make sure this user exists in DB
const SUPABASE_BUCKET_URL =
  "https://kwzlzelrgfbcvconsqvm.supabase.co/storage/v1/object/public/claims-media";

const fmt = {
  date: (d) => (d ? new Date(d).toLocaleDateString() : "—"),
  datetime: (d) => (d ? new Date(d).toLocaleString() : "—"),
  time: (t) => {
    if (!t) return "—";
    const m = String(t).match(/^(\d{2}:\d{2})/);
    return m ? m[1] : t;
  },
};

// ensure time is HH:MM:SS (no Z)
const toTimeHMS = (v) => {
  if (!v) return "";
  const s = String(v).trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s;
  if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`;
  return ""; // invalid → don't send
};

const buildMediaUrl = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p; // already absolute (legacy)
  // normalize legacy prefixes
  const rel = p
    .replace(/^claims\//, "")
    .replace(/^claims-media\//, "")
    .replace(/^\/+/, "");
  return `${SUPABASE_BUCKET_URL}/${rel}`;
};

export default function ClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [media, setMedia] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    date_of_incident: "",
    incident_time: "",
    incident_location: "",
    description: "",
  });
  const [markedForDelete, setMarkedForDelete] = useState([]);
  const [newFiles, setNewFiles] = useState([]); // {id, file, preview, description}

  // ------- Load claim (with abort) -------
  useEffect(() => {
    const controller = new AbortController();

    async function fetchClaim() {
      try {
        setLoading(true);
        const { data } = await axios.get(`${BASE_URL}/claim/${id}`, {
          signal: controller.signal,
        });
        const [claimData, ...rest] = data || [];
        const mediaFiles =
          rest?.filter((r) => r?.media_id && !r?.is_deleted) || [];
        const vehicleData = rest?.find((r) => r?.car_id) || null;

        setClaim(claimData || null);
        setMedia(mediaFiles);
        setVehicle(vehicleData);

        setForm({
          date_of_incident: claimData?.date_of_incident || "",
          incident_time: claimData?.incident_time
            ? fmt.time(claimData.incident_time)
            : "",
          incident_location: claimData?.incident_location || "",
          description: claimData?.description || "",
        });
      } catch (err) {
        if (err.name === "CanceledError") return;
        console.error("Error fetching claim:", err?.response?.data || err);
        toast.error("Failed to load claim details.");
      } finally {
        setLoading(false);
      }
    }

    fetchClaim();
    return () => controller.abort();
  }, [id]);

  const refreshClaim = async () => {
    const { data } = await axios.get(`${BASE_URL}/claim/${id}`);
    const [claimData, ...rest] = data || [];
    setClaim(claimData || null);
    setMedia(rest?.filter((r) => r?.media_id && !r?.is_deleted) || []);
    setVehicle(rest?.find((r) => r?.car_id) || null);
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const toggleDelete = (mediaId) => {
    setMarkedForDelete((prev) =>
      prev.includes(mediaId)
        ? prev.filter((m) => m !== mediaId)
        : [...prev, mediaId]
    );
  };

  const onAddFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      description: "",
    }));
    setNewFiles((prev) => [...prev, ...mapped]);
  };

  // Revoke object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      newFiles.forEach((f) => {
        try {
          URL.revokeObjectURL(f.preview);
        } catch {}
      });
    };
  }, [newFiles]);

  const onChangeNewDesc = (id, desc) => {
    setNewFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, description: desc } : f))
    );
  };

  const removeNewFile = (id) => {
    setNewFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) {
        try {
          URL.revokeObjectURL(target.preview);
        } catch {}
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const canSave = useMemo(() => {
    return Boolean(form.date_of_incident) && Boolean(form.incident_location);
  }, [form]);

  // Optional immediate per-item delete button handler
  const deletePhotoNow = async (mediaId) => {
    try {
      await axios.delete(`${BASE_URL}/photos/${mediaId}`);
      setMedia((prev) => prev.filter((m) => m.media_id !== mediaId));
      setMarkedForDelete((prev) => prev.filter((m) => m !== mediaId));
      toast.success("Photo deleted.");
    } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      console.error("Delete photo error →", status, data || e);
      toast.error(data?.detail || data?.message || "Delete failed.");
    }
  };

  const onSave = async () => {
    if (!canSave || saving) {
      if (!canSave) toast.error("Please fill all required fields.");
      return;
    }
    setSaving(true);
    try {
      // 1) Delete marked photos first via DELETE /photos/{media_id}
      if (markedForDelete?.length) {
        await Promise.all(
          markedForDelete.map((mid) =>
            axios.delete(`${BASE_URL}/photos/${mid}`)
          )
        );
      }

      // 2) Build FormData for claim fields + new files (no need to send media_to_delete_json now)
      const fd = new FormData();

      if (form.date_of_incident)
        fd.append("date_of_incident", form.date_of_incident);
      const t = toTimeHMS(form.incident_time);
      if (t) fd.append("incident_time", t);

      fd.append("incident_location", form.incident_location);
      fd.append("description", form.description || "");
      fd.append("edited_by_user_id", String(EDITED_BY_USER_ID));

      // Append files with suggested clean filename (server may ignore)
      newFiles.forEach((f) => {
        const rawExt = f.file.type?.split("/")[1] || "";
        const ext = rawExt.replace(/[^a-z0-9]/gi, "") || "jpg";
        const suggested = `${id}/${
          crypto.randomUUID?.() || Math.random().toString(36).slice(2)
        }.${ext}`;
        fd.append("new_files", f.file, suggested);
      });

      // Keep counts aligned: 1 description per file
      newFiles.forEach((f) =>
        fd.append("new_descriptions", f.description || "")
      );

      // Let axios set multipart boundary
      await axios.put(`${BASE_URL}/claim/full_submission/${id}`, fd);

      toast.success("Claim updated successfully.");
      await refreshClaim();
      setMarkedForDelete([]);
      setNewFiles([]);
      setEditing(false);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error("Update error →", status, data || err);
      toast.error(data?.detail || data?.message || "Failed to update claim.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading claim details…
      </div>
    );

  if (!claim)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
        <p>Claim not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/home")}
          >
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">magicClaims</h1>
              <p className="text-sm text-muted-foreground">Claim Detail</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Claim {claim.claim_id}</h2>
            <p className="text-sm text-muted-foreground">
              Created: {fmt.datetime(claim.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)}>Edit</Button>
            ) : (
              <>
                <Button onClick={onSave} disabled={!canSave || saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setMarkedForDelete([]);
                    setNewFiles([]);
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </div>
        </div>

        {/* Vehicle + Policy */}
        <div className="grid md:grid-cols-2 gap-4">
          {vehicle && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Car className="w-4 h-4 text-primary" /> Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>
                  <span className="text-muted-foreground">Make:</span>{" "}
                  {vehicle.make}
                </p>
                <p>
                  <span className="text-muted-foreground">Model:</span>{" "}
                  {vehicle.model}
                </p>
                <p>
                  <span className="text-muted-foreground">Year:</span>{" "}
                  {vehicle.year}
                </p>
                <p>
                  <span className="text-muted-foreground">Reg No:</span>{" "}
                  {vehicle.registration_number}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-indigo-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4 text-indigo-600" /> Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>
                <span className="text-muted-foreground">Policy ID:</span>{" "}
                {claim.policy_id}
              </p>
              <p>
                <span className="text-muted-foreground">Customer ID:</span>{" "}
                {claim.customer_id}
              </p>
              <p>
                <span className="text-muted-foreground">Repair Shop:</span>{" "}
                {claim.repair_shop_id_done || "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Claim Info */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" /> Claim Details
            </CardTitle>
          </CardHeader>

          {!editing ? (
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
              <p>
                <b>Date of Incident:</b> {fmt.date(claim.date_of_incident)}
              </p>
              <p>
                <b>Location:</b> {claim.incident_location}
              </p>
              <p>
                <b>Status:</b> {claim.status}
              </p>
              <p className="sm:col-span-2">
                <b>Description:</b> {claim.description || "—"}
              </p>
            </CardContent>
          ) : (
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <Input
                type="date"
                name="date_of_incident"
                value={form.date_of_incident}
                onChange={onChange}
              />
              <Input
                name="incident_location"
                value={form.incident_location}
                onChange={onChange}
                placeholder="Incident Location"
                className="sm:col-span-2"
              />
              <Textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={4}
                placeholder="Description"
                className="sm:col-span-2"
              />
            </CardContent>
          )}
        </Card>

        {/* Media */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" /> Uploaded Photos
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {media.map((m) => {
              const marked = markedForDelete.includes(m.media_id);
              return (
                <Card
                  key={m.media_id}
                  className={`overflow-hidden border ${
                    marked ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-4 p-4">
                    <div className="relative w-full md:w-48 h-48">
                      <img
                        src={buildMediaUrl(m.storage_path)}
                        alt="Damage"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 text-sm">
                      <p>
                        <b>Description:</b> {m.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {fmt.datetime(m.uploaded_at)}
                      </p>

                      {editing && (
                        <div className="flex items-center gap-3 mt-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={marked}
                              onChange={() => toggleDelete(m.media_id)}
                              className="accent-primary"
                            />
                            <span className="font-medium">Mark to delete</span>

                            {/* Info icon + horizontal tooltip */}
                            <div className="relative group flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 text-muted-foreground cursor-pointer"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                                />
                              </svg>

                              {/* Tooltip text to the right */}
                              <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-md border border-border">
                                Tick this box and click <b>Save</b> to
                                permanently delete this photo.
                              </div>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}

            {editing && (
              <>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="new-media"
                    className="hidden"
                    onChange={onAddFiles}
                  />
                  <label
                    htmlFor="new-media"
                    className="cursor-pointer font-medium"
                  >
                    Click to add new images
                  </label>
                </div>

                {newFiles.map((f) => (
                  <Card key={f.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-4 p-4">
                      <div className="relative w-full md:w-48 h-48">
                        <img
                          src={f.preview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewFile(f.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <Textarea
                        value={f.description}
                        onChange={(e) => onChangeNewDesc(f.id, e.target.value)}
                        rows={3}
                        placeholder="New image description"
                      />
                    </div>
                  </Card>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

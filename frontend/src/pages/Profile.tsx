import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UserRound } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import { Account } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Profile() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get<{ data: Account }>("/users/me")).data.data,
  });
  const [form, setForm] = useState({ fullName: "", phone: "" });
  const [saving, setSaving] = useState(false);

  if (isLoading || !profile) return <LoadingSpinner label="Loading profile..." />;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/users/me", {
        fullName: form.fullName || profile!.full_name,
        phone: form.phone || profile!.phone,
      });
      toast.success("Profile updated.");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("avatar", file);
    try {
      await api.post("/users/me/avatar", data, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Avatar updated.");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not upload avatar."));
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold">Your profile</h1>

      <div className="card mt-6 p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/40">
            {profile.avatar_url ? <img src={profile.avatar_url} className="h-full w-full object-cover" /> : <UserRound size={28} />}
          </div>
          <div>
            <label className="btn-secondary cursor-pointer text-sm">
              Change photo
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </label>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" defaultValue={profile.full_name} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input opacity-60" value={profile.email} disabled />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" defaultValue={profile.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <button className="btn-primary w-full" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
        </form>
      </div>
    </div>
  );
}

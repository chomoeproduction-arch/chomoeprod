"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { TeamProfile } from "@/lib/team";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProfileSettingsProps = {
  initialProfile: TeamProfile;
};

export function ProfileSettings({ initialProfile }: ProfileSettingsProps) {
  const [form, setForm] = useState({
    fullName: initialProfile.fullName,
    email: initialProfile.email,
    teamRole: initialProfile.teamRole,
    roleTitle: initialProfile.roleTitle,
    department: initialProfile.department,
    phone: initialProfile.phone,
    bio: initialProfile.bio,
    avatarUrl: initialProfile.avatarUrl,
    avatarPath: initialProfile.avatarPath,
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "تعذر تحديث الملف الشخصي.");
      }

      setMessage("تم تحديث الملف الشخصي.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر تحديث الملف الشخصي.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "profiles");

    const response = await fetch("/api/dashboard/storage/avatar", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as { ok?: boolean; error?: string; url?: string; path?: string };
    if (!response.ok || !payload.ok || !payload.url || !payload.path) {
      throw new Error(payload.error || "تعذر رفع الصورة.");
    }

    setForm((current) => ({ ...current, avatarUrl: payload.url!, avatarPath: payload.path! }));
  }

  async function handleDeleteAvatar() {
    if (!form.avatarPath) {
      setForm((current) => ({ ...current, avatarUrl: "", avatarPath: "" }));
      return;
    }

    const response = await fetch("/api/dashboard/storage/avatar", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: form.avatarPath }),
    });

    const payload = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "تعذر حذف الصورة.");
    }

    setForm((current) => ({ ...current, avatarUrl: "", avatarPath: "" }));
  }

  return (
    <>
      <Card className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(213,109,59,0.18),transparent_28%),linear-gradient(135deg,#ffffff,#fbf7f2)]">
        <CardContent className="p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d56d3b]">Profile</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1d2a43] md:text-4xl">الملف الشخصي</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#5c6577]">
            عدّل بياناتك الأساسية التي تظهر داخل النظام لأعضاء الفريق.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Profile Settings</CardDescription>
          <CardTitle>تعديل الملف الشخصي</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input placeholder="الاسم الكامل" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
          <Input placeholder="البريد الإلكتروني" value={form.email} disabled />
          <Input placeholder="الدور" value={form.teamRole} disabled />
          <Input placeholder="المنصب" value={form.roleTitle} onChange={(event) => setForm((current) => ({ ...current, roleTitle: event.target.value }))} />
          <Input placeholder="القسم" value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} />
          <Input placeholder="الهاتف" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          <Input
            type="password"
            placeholder="كلمة مرور جديدة"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm font-medium text-[#1d2a43]">الصورة</label>
            <Input
              type="file"
              accept="image/*"
              onChange={async (event) => {
                try {
                  await handleFileChange(event.target.files?.[0] ?? null);
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "تعذر رفع الصورة.");
                }
              }}
            />
            <div className="flex items-center gap-3">
              {form.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.avatarUrl} alt="preview" className="h-24 w-24 rounded-2xl border border-[#ece2d6] object-cover" />
              ) : null}
              {form.avatarUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await handleDeleteAvatar();
                    } catch (error) {
                      setMessage(error instanceof Error ? error.message : "تعذر حذف الصورة.");
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                  حذف الصورة
                </Button>
              ) : null}
            </div>
          </div>
          <div className="md:col-span-2">
            <Textarea placeholder="نبذة مختصرة" value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Button onClick={handleSave} disabled={saving}>
              حفظ التعديلات
            </Button>
          </div>
        </CardContent>
      </Card>

      {message ? <div className="rounded-2xl border border-[#ccead7] bg-[#e9f8ee] px-4 py-3 text-sm font-semibold text-[#166534]">{message}</div> : null}
    </>
  );
}

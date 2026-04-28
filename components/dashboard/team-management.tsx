"use client";

import { useState } from "react";
import { Plus, Trash2, UserPen } from "lucide-react";
import type { TeamProfile } from "@/lib/team";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type TeamManagementProps = {
  initialMembers: TeamProfile[];
  setupRequired?: boolean;
  canManage?: boolean;
};

type MemberForm = {
  fullName: string;
  email: string;
  password: string;
  teamRole: string;
  roleTitle: string;
  department: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  avatarPath: string;
  status: "active" | "inactive";
};

const emptyForm: MemberForm = {
  fullName: "",
  email: "",
  password: "",
  teamRole: "viewer",
  roleTitle: "",
  department: "",
  phone: "",
  bio: "",
  avatarUrl: "",
  avatarPath: "",
  status: "active",
};

const roleOptions = ["admin", "manager", "reviewer", "recruiter", "viewer"] as const;

export function TeamManagement({ initialMembers, setupRequired = false, canManage = false }: TeamManagementProps) {
  const [members, setMembers] = useState(initialMembers);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);

  function openCreate() {
    setEditingMemberId(null);
    setForm(emptyForm);
    setIsOpen(true);
  }

  function openEdit(member: TeamProfile) {
    setEditingMemberId(member.id);
    setForm({
      fullName: member.fullName,
      email: member.email,
      password: "",
      teamRole: member.teamRole || "viewer",
      roleTitle: member.roleTitle,
      department: member.department,
      phone: member.phone,
      bio: member.bio,
      avatarUrl: member.avatarUrl,
      avatarPath: member.avatarPath,
      status: member.status,
    });
    setIsOpen(true);
  }

  async function uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "team");

    const response = await fetch("/api/dashboard/storage/avatar", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as { ok?: boolean; error?: string; url?: string; path?: string };
    if (!response.ok || !payload.ok || !payload.url || !payload.path) {
      throw new Error(payload.error || "تعذر رفع الصورة.");
    }

    setForm((current) => ({
      ...current,
      avatarUrl: payload.url!,
      avatarPath: payload.path!,
    }));
  }

  async function deleteAvatar() {
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

  async function handleSubmit() {
    setSaving(true);
    setMessage("");

    try {
      const { password, ...memberProfile } = form;
      const requestPayload = editingMemberId ? memberProfile : form;
      const response = await fetch(editingMemberId ? `/api/dashboard/team/${editingMemberId}` : "/api/dashboard/team", {
        method: editingMemberId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "تعذر حفظ بيانات الفريق.");
      }

      if (editingMemberId) {
        setMembers((current) =>
          current.map((member) =>
            member.id === editingMemberId
              ? {
                  ...member,
                  ...form,
                }
              : member
          )
        );
        setMessage("تم تحديث العضو.");
      } else {
        setMessage("تمت إضافة العضو. حدّث الصفحة إذا أردت رؤية المعرف النهائي مباشرة.");
      }

      setIsOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ بيانات الفريق.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Card className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(213,109,59,0.18),transparent_28%),linear-gradient(135deg,#ffffff,#fbf7f2)]">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d56d3b]">Team Space</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1d2a43] md:text-4xl">الفريق</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#5c6577]">
                صفحة لإدارة أعضاء الفريق، إضافة أعضاء جدد، وتعديل معلوماتهم الأساسية داخل النظام.
              </p>
            </div>

            {canManage ? (
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                إضافة عضو
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Members</CardDescription>
          <CardTitle>قائمة الفريق</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {members.length ? (
            members.map((member) => (
              <div key={member.id} className="rounded-[24px] border border-[#ece2d6] bg-[#fcfaf7] p-5">
                <div className="flex items-center justify-between gap-3">
                  {member.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.avatarUrl} alt={member.fullName} className="h-12 w-12 rounded-2xl border border-[#ece2d6] object-cover" />
                  ) : (
                    <div className="grid size-12 place-items-center rounded-2xl bg-[#f5efe7] font-bold text-[#24324d]">
                      {member.fullName
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                  <Badge variant={member.status === "active" ? "success" : "warning"}>{member.status}</Badge>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-[#1d2a43]">{member.fullName}</h3>
                <p className="mt-1 text-sm font-medium text-[#24324d]">{member.teamRole || "viewer"}</p>
                <p className="mt-1 text-sm text-[#5c6577]">{member.roleTitle || "بدون منصب"}</p>
                <p className="mt-1 text-sm text-[#5c6577]">{member.department || "بدون قسم"}</p>
                <p className="mt-3 text-sm text-[#5c6577]">{member.email || "بدون بريد"}</p>
                <p className="mt-1 text-sm text-[#5c6577]">{member.phone || "بدون هاتف"}</p>

                {canManage ? (
                  <Button variant="outline" className="mt-4 w-full" onClick={() => openEdit(member)}>
                    <UserPen className="size-4" />
                    تعديل
                  </Button>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#dccfc0] bg-white/70 p-6 text-sm text-[#7a8497]">
              لا يوجد أعضاء فريق بعد.
            </div>
          )}
        </CardContent>
      </Card>

      {setupRequired ? (
        <div className="rounded-2xl border border-[#f0d7bf] bg-[#fff2e6] px-4 py-3 text-sm font-semibold text-[#b45309]">
          إدارة الفريق صارت تعتمد على
          {" "}
          <span className="font-mono">Supabase Auth users</span>
          {" "}
          مباشرة. أضف
          {" "}
          <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span>
          {" "}
          في
          {" "}
          <span className="font-mono">.env.local</span>
          {" "}
          حتى تعمل إضافة وتعديل الأعضاء.
        </div>
      ) : null}

      {!canManage ? (
        <div className="rounded-2xl border border-[#d8e0ef] bg-[#f4f8ff] px-4 py-3 text-sm font-semibold text-[#36507c]">
          صلاحيات إدارة الفريق متاحة فقط لمن يملك دور
          {" "}
          <span className="font-mono">admin</span>
          .
        </div>
      ) : null}

      {message ? <div className="rounded-2xl border border-[#ccead7] bg-[#e9f8ee] px-4 py-3 text-sm font-semibold text-[#166534]">{message}</div> : null}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMemberId ? "تعديل عضو" : "إضافة عضو"}</DialogTitle>
            <DialogDescription>املأ بيانات العضو الأساسية ثم احفظ.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="الاسم الكامل" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
            <Input placeholder="البريد الإلكتروني" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            {!editingMemberId ? (
              <Input
                placeholder="كلمة المرور"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            ) : null}
            <select
              className="flex h-11 w-full rounded-xl border border-[#ddd3c7] bg-white px-4 py-2 text-sm text-[#1d2a43] shadow-sm outline-none transition"
              value={form.teamRole}
              onChange={(event) => setForm((current) => ({ ...current, teamRole: event.target.value }))}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <Input placeholder="المنصب" value={form.roleTitle} onChange={(event) => setForm((current) => ({ ...current, roleTitle: event.target.value }))} />
            <Input placeholder="القسم" value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} />
            <Input placeholder="الهاتف" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#1d2a43]">الصورة</label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  try {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    await uploadAvatar(file);
                  } catch (error) {
                    setMessage(error instanceof Error ? error.message : "تعذر رفع الصورة.");
                  }
                }}
              />
              <div className="flex items-center gap-3">
                {form.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.avatarUrl} alt="preview" className="h-20 w-20 rounded-2xl border border-[#ece2d6] object-cover" />
                ) : null}
                {form.avatarUrl ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await deleteAvatar();
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
            <select
              className="flex h-11 w-full rounded-xl border border-[#ddd3c7] bg-white px-4 py-2 text-sm text-[#1d2a43] shadow-sm outline-none transition"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as MemberForm["status"] }))}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>

          <Button onClick={handleSubmit} disabled={saving}>
            {editingMemberId ? "حفظ التعديلات" : "إضافة العضو"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

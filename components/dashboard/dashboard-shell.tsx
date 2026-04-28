"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  ChartColumnBig,
  KanbanSquare,
  List,
  MapPin,
  RefreshCcw,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { technicalSections, type DashboardApplicant, type Evaluation, type StageOption } from "@/lib/crm-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type DashboardShellProps = {
  initialApplicants: DashboardApplicant[];
  stages: StageOption[];
};

type CommunicationForm = {
  channel: "Phone" | "WhatsApp" | "Email";
  result: string;
  followUp: string;
  summary: string;
};

type DetailTab = "overview" | "evaluation" | "notes" | "communication";
type DragStageId = string | "__unassigned__";
type ViewMode = "list" | "kanban";

const evaluationFields: Array<{
  key: keyof Pick<Evaluation, "problemSolving" | "codeQuality" | "communication" | "systemThinking" | "aiUsage">;
  label: string;
}> = [
  { key: "problemSolving", label: "حل المشكلات" },
  { key: "codeQuality", label: "جودة الكود" },
  { key: "communication", label: "التواصل" },
  { key: "systemThinking", label: "التفكير المنظومي" },
  { key: "aiUsage", label: "استخدام الذكاء الاصطناعي" },
];

const decisions: Evaluation["decision"][] = ["Undecided", "Strong Yes", "Yes", "Maybe", "No"];

function statCount(applicants: DashboardApplicant[], stageName: string) {
  return applicants.filter((applicant) => applicant.stage?.name === stageName).length;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function averageScore(evaluation: Evaluation) {
  const values = evaluationFields.map(({ key }) => evaluation[key]);
  const total = values.reduce((sum, value) => sum + value, 0);
  return (total / values.length).toFixed(1);
}

function findStageByName(stages: StageOption[], stageName: string) {
  return stages.find((stage) => stage.name.toLowerCase() === stageName.toLowerCase()) ?? null;
}

function selectClassName() {
  return "flex h-11 w-full rounded-xl border border-[#ddd3c7] bg-white px-4 py-2 text-sm text-[#1d2a43] shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#d56d3b]/35 disabled:cursor-not-allowed disabled:opacity-50";
}

async function parseResponse(response: Response, fallback: string) {
  const payload = (await response.json()) as { ok?: boolean; error?: string };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || fallback);
  }
}

export function DashboardShell({ initialApplicants, stages }: DashboardShellProps) {
  const router = useRouter();
  const [applicants, setApplicants] = useState(initialApplicants);
  const [selectedApplicantId, setSelectedApplicantId] = useState(initialApplicants[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [noteText, setNoteText] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [draggedApplicantId, setDraggedApplicantId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<DragStageId | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [communicationForm, setCommunicationForm] = useState<CommunicationForm>({
    channel: "Phone",
    result: "",
    followUp: "",
    summary: "",
  });

  useEffect(() => {
    setApplicants(initialApplicants);
    if (!initialApplicants.some((applicant) => applicant.id === selectedApplicantId)) {
      setSelectedApplicantId(initialApplicants[0]?.id ?? "");
    }
  }, [initialApplicants, selectedApplicantId]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const target = [
        applicant.profile.fullName,
        applicant.profile.primaryStack,
        applicant.profile.location,
        applicant.profile.email,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || target.includes(search.toLowerCase());
      const matchesStage = !stageFilter || applicant.stage?.id === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [applicants, search, stageFilter]);

  const selectedApplicant =
    applicants.find((applicant) => applicant.id === selectedApplicantId) || filteredApplicants[0] || applicants[0];

  const pipelineColumns = useMemo(() => {
    return stages.map((stage) => ({
      stage,
      applicants: filteredApplicants.filter((applicant) => applicant.stage?.id === stage.id),
    }));
  }, [filteredApplicants, stages]);

  const unassignedApplicants = useMemo(
    () => filteredApplicants.filter((applicant) => !applicant.stage?.id),
    [filteredApplicants]
  );

  const newStage = findStageByName(stages, "New");
  const reviewedStage = findStageByName(stages, "Reviewed");
  const interviewStage = findStageByName(stages, "Interview");
  const acceptedStage = findStageByName(stages, "Accepted");
  const rejectedStage = findStageByName(stages, "Rejected");

  const stats = [
    { label: "الجدد", value: statCount(applicants, "New"), icon: Sparkles, stageId: newStage?.id ?? "" },
    { label: "قيد المراجعة", value: statCount(applicants, "Reviewed"), icon: ChartColumnBig, stageId: reviewedStage?.id ?? "" },
    { label: "المقابلات", value: statCount(applicants, "Interview"), icon: BriefcaseBusiness, stageId: interviewStage?.id ?? "" },
    { label: "المقبولين", value: statCount(applicants, "Accepted"), icon: UsersRound, stageId: acceptedStage?.id ?? "" },
    { label: "المرفوضين", value: statCount(applicants, "Rejected"), icon: Bell, stageId: rejectedStage?.id ?? "" },
  ];

  async function refreshDashboard() {
    router.refresh();
  }

  function buildStagePayload(stageId: string | null) {
    const nextStage = stageId ? stages.find((stage) => stage.id === stageId) ?? null : null;
    return nextStage
      ? {
          id: nextStage.id,
          name: nextStage.name,
          slug: nextStage.slug,
          sortOrder: nextStage.sortOrder,
        }
      : null;
  }

  function openDetails(applicantId: string, tab: DetailTab = "overview") {
    setSelectedApplicantId(applicantId);
    setActiveTab(tab);
    setIsDetailOpen(true);
  }

  async function updateApplicant(applicantId: string, payload: { stageId?: string | null; statusNote?: string }) {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/dashboard/applicants/${applicantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      await parseResponse(response, "تعذر التحديث.");
      setMessage("تم حفظ التحديث.");
      await refreshDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر التحديث.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStageDrop(applicantId: string, nextStageId: string | null) {
    const currentApplicant = applicants.find((applicant) => applicant.id === applicantId);
    if (!currentApplicant) {
      return;
    }

    const currentStageId = currentApplicant.stage?.id ?? null;
    if (currentStageId === nextStageId) {
      setDraggedApplicantId(null);
      setDragOverStageId(null);
      return;
    }

    const previousApplicants = applicants;
    const nextStage = buildStagePayload(nextStageId);

    setApplicants((current) =>
      current.map((applicant) =>
        applicant.id === applicantId
          ? {
              ...applicant,
              stage: nextStage,
            }
          : applicant
      )
    );
    setSelectedApplicantId(applicantId);
    setDraggedApplicantId(null);
    setDragOverStageId(null);
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/dashboard/applicants/${applicantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stageId: nextStageId }),
      });

      await parseResponse(response, "تعذر نقل المرشح.");
      setMessage("تم نقل المرشح بنجاح.");
      await refreshDashboard();
    } catch (error) {
      setApplicants(previousApplicants);
      setMessage(error instanceof Error ? error.message : "تعذر نقل المرشح.");
    } finally {
      setSaving(false);
    }
  }

  async function saveNote() {
    if (!selectedApplicant || !noteText.trim()) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/dashboard/applicants/${selectedApplicant.id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: noteText }),
      });

      await parseResponse(response, "تعذر حفظ الملاحظة.");
      setNoteText("");
      setMessage("تمت إضافة الملاحظة.");
      await refreshDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ الملاحظة.");
    } finally {
      setSaving(false);
    }
  }

  async function saveCommunication() {
    if (!selectedApplicant || !communicationForm.result.trim()) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/dashboard/applicants/${selectedApplicant.id}/communications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(communicationForm),
      });

      await parseResponse(response, "تعذر حفظ سجل التواصل.");
      setCommunicationForm({
        channel: "Phone",
        result: "",
        followUp: "",
        summary: "",
      });
      setMessage("تم حفظ سجل التواصل.");
      await refreshDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ سجل التواصل.");
    } finally {
      setSaving(false);
    }
  }

  async function saveEvaluation(evaluation: Evaluation) {
    if (!selectedApplicant) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/dashboard/applicants/${selectedApplicant.id}/evaluation`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(evaluation),
      });

      await parseResponse(response, "تعذر حفظ التقييم.");
      setMessage("تم حفظ التقييم.");
      await refreshDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ التقييم.");
    } finally {
      setSaving(false);
    }
  }

  function updateLocalEvaluation(nextEvaluation: Evaluation) {
    if (!selectedApplicant) {
      return;
    }

    setApplicants((current) =>
      current.map((applicant) =>
        applicant.id === selectedApplicant.id
          ? {
              ...applicant,
              evaluation: nextEvaluation,
            }
          : applicant
      )
    );
  }

  return (
    <>
      <div className="space-y-6">
          <Card className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(213,109,59,0.18),transparent_28%),linear-gradient(135deg,#ffffff,#fbf7f2)]">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <Badge variant="warning" className="w-fit">
                    لوحة الإدارة
                  </Badge>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-[#1d2a43] md:text-4xl">متابعة المرشحين</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[#5c6577]">
                      قائمة بكل التسجيلات مع واجهة Kanban ثانية، وإحصائيات ذكية تضغط عليها لتفلتر النتائج فورًا.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => router.refresh()} disabled={saving}>
                    <RefreshCcw className="size-4" />
                    تحديث البيانات
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Filters</CardDescription>
              <CardTitle>بحث وتنظيم</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#9aa2b2]" />
                <Input className="pr-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="اسم، بريد، تقنية..." />
              </div>

              <select className={selectClassName()} value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}>
                <option value="">كل المراحل</option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <section id="dashboard-reports" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {stats.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setStageFilter((current) => (current === item.stageId ? "" : item.stageId))}
                className="text-right"
              >
                <Card
                  className={cn(
                    "overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(17,32,51,0.08)]",
                    stageFilter === item.stageId && item.stageId && "border-[#d56d3b] bg-[#fff8f2]"
                  )}
                >
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm font-medium text-[#5c6577]">{item.label}</p>
                      <strong className="mt-2 block text-3xl font-semibold text-[#1d2a43]">{item.value}</strong>
                    </div>
                    <div className="grid size-12 place-items-center rounded-2xl bg-[#f5efe7] text-[#24324d]">
                      <item.icon className="size-5" />
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </section>

          <div id="dashboard-registrations">
          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardDescription>Registrations</CardDescription>
                <CardTitle>كل التسجيلات</CardTitle>
                <p className="mt-2 text-sm text-[#5c6577]">
                  {stageFilter
                    ? `يتم الآن عرض ${filteredApplicants.length} تسجيل بعد تطبيق الفلتر الحالي.`
                    : `يتم الآن عرض كل التسجيلات (${filteredApplicants.length}).`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {stageFilter ? (
                  <Button variant="outline" onClick={() => setStageFilter("")}>
                    إلغاء الفلتر
                  </Button>
                ) : null}

                <div className="rounded-full bg-[#f6f1ea] p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                      viewMode === "list" ? "bg-[#24324d] text-white" : "text-[#5c6577]"
                    )}
                  >
                    <List className="size-4" />
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("kanban")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                      viewMode === "kanban" ? "bg-[#24324d] text-white" : "text-[#5c6577]"
                    )}
                  >
                    <KanbanSquare className="size-4" />
                    Kanban
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {viewMode === "list" ? (
                <div className="overflow-hidden rounded-[24px] border border-[#ece2d6]">
                  <div className="hidden grid-cols-[minmax(220px,1.3fr)_minmax(150px,0.85fr)_minmax(160px,0.9fr)_minmax(120px,0.7fr)_minmax(120px,0.7fr)] gap-4 bg-[#faf7f3] px-5 py-4 text-sm font-semibold text-[#5c6577] md:grid">
                    <span>الاسم</span>
                    <span>المرحلة</span>
                    <span>التقنية / الدور</span>
                    <span>الموقع</span>
                    <span>القرار</span>
                  </div>

                  <div className="divide-y divide-[#eee5da]">
                    {filteredApplicants.length ? (
                      filteredApplicants.map((applicant) => (
                        <button
                          key={applicant.id}
                          type="button"
                          onClick={() => openDetails(applicant.id)}
                          className="grid w-full gap-4 px-5 py-4 text-right transition hover:bg-[#fcfaf7] md:grid-cols-[minmax(220px,1.3fr)_minmax(150px,0.85fr)_minmax(160px,0.9fr)_minmax(120px,0.7fr)_minmax(120px,0.7fr)] md:items-center"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1d2a43]">{applicant.profile.fullName}</p>
                            <p className="mt-1 text-sm text-[#5c6577]">{applicant.profile.email || "بدون بريد"}</p>
                          </div>

                          <div>
                            <Badge>{applicant.stage?.name || "بدون مرحلة"}</Badge>
                          </div>

                          <div className="min-w-0">
                            <p className="font-medium text-[#1d2a43]">{applicant.profile.primaryStack || "بدون تقنية محددة"}</p>
                            <p className="mt-1 text-sm text-[#5c6577]">{applicant.category?.name || "—"}</p>
                          </div>

                          <div className="text-sm text-[#5c6577]">{applicant.profile.location || "—"}</div>

                          <div>
                            <Badge variant="success">{applicant.evaluation.decision}</Badge>
                          </div>

                        </button>
                      ))
                    ) : (
                      <div className="px-5 py-10 text-center text-sm text-[#7a8497]">لا توجد تسجيلات مطابقة للفلاتر الحالية.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid auto-cols-[minmax(260px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2">
                  {pipelineColumns.map(({ stage, applicants: stageApplicants }) => (
                    <div
                      key={stage.id}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                        setDragOverStageId(stage.id);
                      }}
                      onDragLeave={() => {
                        if (dragOverStageId === stage.id) {
                          setDragOverStageId(null);
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const applicantId = event.dataTransfer.getData("text/plain");
                        void handleStageDrop(applicantId, stage.id);
                      }}
                      className={cn(
                        "min-h-[520px] rounded-[28px] border border-[#ece2d6] bg-[#faf7f3] p-4 transition",
                        dragOverStageId === stage.id && "border-[#d56d3b] bg-[#fff8f2] shadow-[inset_0_0_0_1px_rgba(213,109,59,0.18)]"
                      )}
                    >
                      <div className="mb-4 flex items-center justify-between border-b border-[#e9dfd3] pb-4">
                        <div>
                          <h3 className="font-semibold text-[#1d2a43]">{stage.name}</h3>
                          <p className="text-sm text-[#5c6577]">{stageApplicants.length} مرشح</p>
                        </div>
                        <Badge>{stageApplicants.length}</Badge>
                      </div>

                      <div className="grid gap-3">
                        {stageApplicants.length ? (
                          stageApplicants.map((applicant) => (
                            <button
                              key={applicant.id}
                              type="button"
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.effectAllowed = "move";
                                event.dataTransfer.setData("text/plain", applicant.id);
                                setDraggedApplicantId(applicant.id);
                              }}
                              onDragEnd={() => {
                                setDraggedApplicantId(null);
                                setDragOverStageId(null);
                              }}
                              onClick={() => openDetails(applicant.id)}
                              className={cn(
                                "rounded-[22px] border border-[#e5dbce] bg-white p-4 text-right transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(17,32,51,0.08)]",
                                selectedApplicant?.id === applicant.id && "border-[#d56d3b]/50 shadow-[0_18px_34px_rgba(17,32,51,0.08)]",
                                draggedApplicantId === applicant.id && "cursor-grabbing opacity-60 ring-2 ring-[#d56d3b]/30"
                              )}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="grid size-10 place-items-center rounded-2xl bg-[#f5efe7] font-bold text-[#24324d]">
                                  {getInitials(applicant.profile.fullName)}
                                </div>
                                <Badge variant="dark">{averageScore(applicant.evaluation)}/5</Badge>
                              </div>

                              <h4 className="mt-4 text-base font-semibold text-[#1d2a43]">{applicant.profile.fullName}</h4>
                              <p className="mt-1 text-sm text-[#5c6577]">{applicant.profile.primaryStack || "بدون تقنية محددة"}</p>

                              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[#7a8497]">
                                <span className="flex items-center gap-1">
                                  <MapPin className="size-3.5" />
                                  {applicant.profile.location || "—"}
                                </span>
                                <span>{applicant.evaluation.decision}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="grid min-h-[140px] place-items-center rounded-[22px] border border-dashed border-[#dccfc0] bg-white/70 p-4 text-center text-sm text-[#7a8497]">
                            لا يوجد مرشحون هنا.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDragOverStageId("__unassigned__");
                    }}
                    onDragLeave={() => {
                      if (dragOverStageId === "__unassigned__") {
                        setDragOverStageId(null);
                      }
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const applicantId = event.dataTransfer.getData("text/plain");
                      void handleStageDrop(applicantId, null);
                    }}
                    className={cn(
                      "min-h-[520px] rounded-[28px] border border-[#ece2d6] bg-[#f7f4ef] p-4 transition",
                      dragOverStageId === "__unassigned__" && "border-[#d56d3b] bg-[#fff8f2] shadow-[inset_0_0_0_1px_rgba(213,109,59,0.18)]"
                    )}
                  >
                    <div className="mb-4 flex items-center justify-between border-b border-[#e9dfd3] pb-4">
                      <div>
                        <h3 className="font-semibold text-[#1d2a43]">بدون مرحلة</h3>
                        <p className="text-sm text-[#5c6577]">{unassignedApplicants.length} مرشح</p>
                      </div>
                      <Badge variant="warning">{unassignedApplicants.length}</Badge>
                    </div>

                    <div className="grid gap-3">
                      {unassignedApplicants.length ? (
                        unassignedApplicants.map((applicant) => (
                          <button
                            key={applicant.id}
                            type="button"
                            draggable
                            onDragStart={(event) => {
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData("text/plain", applicant.id);
                              setDraggedApplicantId(applicant.id);
                            }}
                            onDragEnd={() => {
                              setDraggedApplicantId(null);
                              setDragOverStageId(null);
                            }}
                            onClick={() => openDetails(applicant.id)}
                            className={cn(
                              "rounded-[22px] border border-[#e5dbce] bg-white p-4 text-right transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(17,32,51,0.08)]",
                              draggedApplicantId === applicant.id && "cursor-grabbing opacity-60 ring-2 ring-[#d56d3b]/30"
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="grid size-10 place-items-center rounded-2xl bg-[#f5efe7] font-bold text-[#24324d]">
                                {getInitials(applicant.profile.fullName)}
                              </div>
                              <Badge>{averageScore(applicant.evaluation)}/5</Badge>
                            </div>
                            <h4 className="mt-4 text-base font-semibold text-[#1d2a43]">{applicant.profile.fullName}</h4>
                            <p className="mt-1 text-sm text-[#5c6577]">{applicant.profile.primaryStack || "بدون تقنية محددة"}</p>
                          </button>
                        ))
                      ) : (
                        <div className="grid min-h-[140px] place-items-center rounded-[22px] border border-dashed border-[#dccfc0] bg-white/70 p-4 text-center text-sm text-[#7a8497]">
                          كل المرشحين موزعين على المراحل.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </div>

          {message ? (
            <div className="rounded-2xl border border-[#ccead7] bg-[#e9f8ee] px-4 py-3 text-sm font-semibold text-[#166534]">{message}</div>
          ) : null}
      </div>

      <Dialog open={isDetailOpen && !!selectedApplicant} onOpenChange={setIsDetailOpen}>
        <DialogContent className="p-0 sm:max-w-none">
          {selectedApplicant ? (
            <div className="grid max-h-[calc(100vh-24px)] grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden">
              <div className="border-b border-[#eee5da] px-6 py-5">
                <DialogHeader className="gap-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-[#1d2a43] to-[#d56d3b] text-sm font-bold text-white">
                        {getInitials(selectedApplicant.profile.fullName)}
                      </div>
                      <div>
                        <DialogTitle>{selectedApplicant.profile.fullName}</DialogTitle>
                        <DialogDescription className="mt-1">
                          {selectedApplicant.profile.email || "بدون بريد"} · {selectedApplicant.profile.phone || "بدون هاتف"}
                        </DialogDescription>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge>{selectedApplicant.category?.name || "بدون تصنيف"}</Badge>
                      <Badge variant="success">{selectedApplicant.evaluation.decision}</Badge>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="grid gap-3 border-b border-[#eee5da] px-6 py-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#e7ddd0] bg-[#faf7f3] p-4">
                  <p className="mb-2 text-sm text-[#5c6577]">المرحلة الحالية</p>
                  <select
                    className={selectClassName()}
                    value={selectedApplicant.stage?.id || ""}
                    onChange={(event) => updateApplicant(selectedApplicant.id, { stageId: event.target.value || null })}
                    disabled={saving}
                  >
                    <option value="">بدون مرحلة</option>
                    {stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-2xl border border-[#e7ddd0] bg-[#faf7f3] p-4">
                  <p className="text-sm text-[#5c6577]">المعدل العام</p>
                  <strong className="mt-3 block text-2xl font-semibold text-[#1d2a43]">{averageScore(selectedApplicant.evaluation)}/5</strong>
                </div>
                <div className="rounded-2xl border border-[#e7ddd0] bg-[#faf7f3] p-4">
                  <p className="text-sm text-[#5c6577]">تاريخ التقديم</p>
                  <strong className="mt-3 block text-2xl font-semibold text-[#1d2a43]">{selectedApplicant.submittedAt}</strong>
                </div>
              </div>

              <div className="overflow-y-auto px-6 py-5">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DetailTab)}>
                  <TabsList>
                    <TabsTrigger value="overview">الملخص</TabsTrigger>
                    <TabsTrigger value="evaluation">التقييم</TabsTrigger>
                    <TabsTrigger value="notes">الملاحظات</TabsTrigger>
                    <TabsTrigger value="communication">التواصل</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <div className="grid gap-4">
                      {technicalSections.map((section) => (
                        <Card key={section.key} className="bg-[#fcfaf7]">
                          <CardHeader>
                            <CardTitle>{section.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                              {section.fields.map(([label, key]) => (
                                <div key={key} className="rounded-2xl border border-[#ece2d6] bg-white p-4">
                                  <strong className="text-sm text-[#1d2a43]">{label}</strong>
                                  <p className="mt-2 text-sm leading-7 text-[#5c6577]">
                                    {selectedApplicant.profile[key as keyof typeof selectedApplicant.profile] || "—"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="evaluation">
                    <Card className="bg-[#fcfaf7]">
                      <CardHeader>
                        <CardTitle>التقييم</CardTitle>
                        <CardDescription>عدّل الدرجات والقرار ثم سيُحفَظ التحديث مباشرة.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        {evaluationFields.map(({ key, label }) => (
                          <label key={key} className="grid gap-2 text-sm font-medium text-[#1d2a43]">
                            {label}
                            <Input
                              type="number"
                              min={1}
                              max={5}
                              value={selectedApplicant.evaluation[key]}
                              onChange={(event) => {
                                const nextEvaluation = {
                                  ...selectedApplicant.evaluation,
                                  [key]: Number(event.target.value),
                                } as Evaluation;
                                updateLocalEvaluation(nextEvaluation);
                                saveEvaluation(nextEvaluation);
                              }}
                            />
                          </label>
                        ))}

                        <label className="grid gap-2 text-sm font-medium text-[#1d2a43]">
                          القرار
                          <select
                            className={selectClassName()}
                            value={selectedApplicant.evaluation.decision}
                            onChange={(event) => {
                              const nextEvaluation = {
                                ...selectedApplicant.evaluation,
                                decision: event.target.value as Evaluation["decision"],
                              };
                              updateLocalEvaluation(nextEvaluation);
                              saveEvaluation(nextEvaluation);
                            }}
                          >
                            {decisions.map((decision) => (
                              <option key={decision} value={decision}>
                                {decision}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="grid gap-2 text-sm font-medium text-[#1d2a43] md:col-span-2">
                          ملخص التقييم
                          <Textarea
                            rows={5}
                            value={selectedApplicant.evaluation.summary}
                            onChange={(event) =>
                              updateLocalEvaluation({
                                ...selectedApplicant.evaluation,
                                summary: event.target.value,
                              })
                            }
                            onBlur={() =>
                              saveEvaluation({
                                ...(applicants.find((applicant) => applicant.id === selectedApplicant.id)?.evaluation ||
                                  selectedApplicant.evaluation),
                              })
                            }
                          />
                        </label>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notes">
                    <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
                      <Card className="bg-[#fcfaf7]">
                        <CardHeader>
                          <CardTitle>إضافة ملاحظة</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                          <Textarea rows={5} value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="أضف ملاحظة داخلية..." />
                          <Button onClick={saveNote} disabled={saving}>
                            حفظ الملاحظة
                          </Button>
                        </CardContent>
                      </Card>

                      <div className="grid gap-3">
                        {selectedApplicant.notes.length ? (
                          selectedApplicant.notes.map((note) => (
                            <Card key={note.id} className="bg-[#fcfaf7]">
                              <CardContent className="p-5">
                                <strong className="text-[#1d2a43]">{note.author}</strong>
                                <p className="mt-2 text-sm leading-7 text-[#5c6577]">{note.text}</p>
                                <small className="mt-3 block text-xs text-[#8b94a7]">{note.createdAt}</small>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <Card className="bg-[#fcfaf7]">
                            <CardContent className="p-5 text-sm text-[#5c6577]">لا توجد ملاحظات بعد.</CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="communication">
                    <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
                      <Card className="bg-[#fcfaf7]">
                        <CardHeader>
                          <CardTitle>إضافة سجل تواصل</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                          <label className="grid gap-2 text-sm font-medium text-[#1d2a43]">
                            القناة
                            <select
                              className={selectClassName()}
                              value={communicationForm.channel}
                              onChange={(event) =>
                                setCommunicationForm((current) => ({
                                  ...current,
                                  channel: event.target.value as CommunicationForm["channel"],
                                }))
                              }
                            >
                              <option value="Phone">Phone</option>
                              <option value="WhatsApp">WhatsApp</option>
                              <option value="Email">Email</option>
                            </select>
                          </label>

                          <label className="grid gap-2 text-sm font-medium text-[#1d2a43]">
                            النتيجة
                            <Input
                              value={communicationForm.result}
                              onChange={(event) => setCommunicationForm((current) => ({ ...current, result: event.target.value }))}
                            />
                          </label>

                          <label className="grid gap-2 text-sm font-medium text-[#1d2a43]">
                            متابعة لاحقة
                            <Input
                              type="date"
                              value={communicationForm.followUp}
                              onChange={(event) => setCommunicationForm((current) => ({ ...current, followUp: event.target.value }))}
                            />
                          </label>

                          <label className="grid gap-2 text-sm font-medium text-[#1d2a43]">
                            ملخص
                            <Textarea
                              rows={4}
                              value={communicationForm.summary}
                              onChange={(event) => setCommunicationForm((current) => ({ ...current, summary: event.target.value }))}
                            />
                          </label>

                          <Button onClick={saveCommunication} disabled={saving}>
                            حفظ سجل التواصل
                          </Button>
                        </CardContent>
                      </Card>

                      <div className="grid gap-3">
                        {selectedApplicant.communication.length ? (
                          selectedApplicant.communication.map((item) => (
                            <Card key={item.id} className="bg-[#fcfaf7]">
                              <CardContent className="p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge>{item.channel}</Badge>
                                  <Badge variant="success">{item.result}</Badge>
                                </div>
                                <strong className="mt-4 block text-sm text-[#1d2a43]">{item.author}</strong>
                                <p className="mt-3 text-sm leading-7 text-[#5c6577]">{item.summary || "بدون ملخص"}</p>
                                <small className="mt-3 block text-xs text-[#8b94a7]">
                                  {item.createdAt}
                                  {item.followUp ? ` · متابعة ${item.followUp}` : ""}
                                </small>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <Card className="bg-[#fcfaf7]">
                            <CardContent className="p-5 text-sm text-[#5c6577]">لا توجد سجلات تواصل بعد.</CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

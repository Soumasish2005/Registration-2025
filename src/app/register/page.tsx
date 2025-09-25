"use client";

import { useEffect, useState } from "react";

type EventDto = { id: string; name: string };
type TeamDto = { id: string; name: string };

type EventsResponse = {
  soloEvents: EventDto[];
  teamEvents: (EventDto & { teams: TeamDto[] })[];
};

type Step = 1 | 2 | 3;

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [governmentId, setGovernmentId] = useState("");
  const [governmentIdType, setGovernmentIdType] = useState("AADHAAR");
  const [email, setEmail] = useState("");

  const [participationType, setParticipationType] = useState<"SOLO" | "TEAM" | "">("");
  const [soloEventId, setSoloEventId] = useState("");
  const [teamEventId, setTeamEventId] = useState("");
  const [teamId, setTeamId] = useState("");

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data: EventsResponse) => setEvents(data))
      .catch(() => setError("Failed to load events"));
  }, []);

  const validateStep1 = () => {
    if (!fullName.trim()) return "Full Name is required";
    if (!/^\d{10}$/.test(phoneNumber)) return "Phone must be 10 digits";
    if (!governmentId.trim()) return "Government ID Number is required";
    return null;
  };

  const nextFromStep1 = () => {
    const v = validateStep1();
    if (v) return setError(v);
    setError(null);
    setStep(2);
  };

  const nextFromStep2 = () => {
    if (participationType === "SOLO" && !soloEventId) return setError("Select a Solo Event");
    if (participationType === "TEAM") {
      if (!teamEventId) return setError("Select a Team Event");
      if (!teamId) return setError("Select a Team Name");
    }
    setError(null);
    setStep(3);
  };

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          governmentId,
          governmentIdType,
          email: email || undefined,
          participationType: participationType as "SOLO" | "TEAM",
          soloEventId: participationType === "SOLO" ? soloEventId : undefined,
          teamId: participationType === "TEAM" ? teamId : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSuccessId(data.id);
      setStep(3);
    } catch (e: any) {
      setError(e.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-white to-neutral-100 text-neutral-800">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="p-6 border-b border-neutral-200">
          <h1 className="text-xl font-semibold">Calcutta Youth Meet – Chapter 9</h1>
          <p className="text-sm text-neutral-600 mt-1">26th & 27th September • Venue: Gyan Manch</p>
          <p className="mt-4 font-medium">Participant Registration</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 text-sm">
            <span className={"h-7 w-7 rounded-full flex items-center justify-center " + (step >= 1 ? "bg-black text-white" : "bg-neutral-200")}>1</span>
            <span>Details</span>
            <span className="mx-2 text-neutral-400">—</span>
            <span className={"h-7 w-7 rounded-full flex items-center justify-center " + (step >= 2 ? "bg-black text-white" : "bg-neutral-200")}>2</span>
            <span>Selection</span>
            <span className="mx-2 text-neutral-400">—</span>
            <span className={"h-7 w-7 rounded-full flex items-center justify-center " + (step >= 3 ? "bg-black text-white" : "bg-neutral-200")}>3</span>
            <span>Review</span>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 text-red-700 text-sm p-3 border border-red-200">{error}</div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm">Full Name</label>
                <input className="mt-1 w-full rounded-md border p-2" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Phone Number</label>
                <input inputMode="numeric" pattern="[0-9]*" className="mt-1 w-full rounded-md border p-2" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} />
              </div>
              <div>
                <label className="text-sm">Government ID Number</label>
                <input className="mt-1 w-full rounded-md border p-2" value={governmentId} onChange={(e) => setGovernmentId(e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Government ID Type</label>
                <select className="mt-1 w-full rounded-md border p-2" value={governmentIdType} onChange={(e) => setGovernmentIdType(e.target.value)}>
                  <option value="AADHAAR">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="VOTER_ID">Voter ID</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Email (optional)</label>
                <input className="mt-1 w-full rounded-md border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex justify-end">
                <button className="rounded-md bg-black text-white px-4 py-2" onClick={nextFromStep1}>Next</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm">Participation Type</label>
                <div className="mt-2 flex gap-2">
                  <button className={"px-3 py-2 rounded-md border " + (participationType === "SOLO" ? "bg-black text-white" : "bg-white")} onClick={() => { setParticipationType("SOLO"); setTeamEventId(""); setTeamId(""); }}>
                    Solo Event
                  </button>
                  <button className={"px-3 py-2 rounded-md border " + (participationType === "TEAM" ? "bg-black text-white" : "bg-white")} onClick={() => { setParticipationType("TEAM"); setSoloEventId(""); }}>
                    Team Event
                  </button>
                </div>
              </div>

              {participationType === "SOLO" && (
                <div>
                  <label className="text-sm">Solo Event</label>
                  <select className="mt-1 w-full rounded-md border p-2" value={soloEventId} onChange={(e) => setSoloEventId(e.target.value)}>
                    <option value="">Select a solo event</option>
                    {events?.soloEvents.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {participationType === "TEAM" && (
                <>
                  <div>
                    <label className="text-sm">Team Event</label>
                    <select className="mt-1 w-full rounded-md border p-2" value={teamEventId} onChange={(e) => { setTeamEventId(e.target.value); setTeamId(""); }}>
                      <option value="">Select a team event</option>
                      {events?.teamEvents.map((ev) => (
                        <option key={ev.id} value={ev.id}>{ev.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm">Team Name</label>
                    <select className="mt-1 w-full rounded-md border p-2" value={teamId} onChange={(e) => setTeamId(e.target.value)} disabled={!teamEventId}>
                      <option value="">Select a team</option>
                      {events?.teamEvents.find((e) => e.id === teamEventId)?.teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-between">
                <button className="rounded-md border px-4 py-2" onClick={() => setStep(1)}>Back</button>
                <button className="rounded-md bg-black text-white px-4 py-2" onClick={nextFromStep2}>Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {successId ? (
                <div className="rounded-md bg-green-50 text-green-800 p-3 border border-green-200 text-sm">
                  Registration submitted. Status: Pending Admin Approval.
                </div>
              ) : (
                <>
                  <div className="rounded-md border p-4">
                    <p className="font-medium">Review</p>
                    <div className="mt-2 text-sm space-y-1">
                      <p>Full Name: {fullName}</p>
                      <p>Phone: {phoneNumber}</p>
                      <p>ID: {governmentId} ({governmentIdType})</p>
                      {email && <p>Email: {email}</p>}
                      <p>Type: {participationType || "-"}</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button className="rounded-md border px-4 py-2" onClick={() => setStep(2)}>Back</button>
                    <button className="rounded-md bg-black text-white px-4 py-2" onClick={submit} disabled={loading}>
                      {loading ? "Submitting..." : "Submit Registration"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



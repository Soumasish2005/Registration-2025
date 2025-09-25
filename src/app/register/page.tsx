
"use client";
import { useEffect, useState } from "react";
import styles from "./register.module.css";

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
      console.log("Registration response:", { res, data });
      if (!res.ok) {
        let errorMsg = data.error || "Submission failed";
        if (data.details) errorMsg += `\nDetails: ${data.details}`;
        throw new Error(errorMsg);
      }
      setSuccessId(data.id);
      setStep(3);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message || "Submission failed");
      } else {
        setError("Submission failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Calcutta Youth Meet – Chapter 9</h1>
          <p className={styles.subtitle}>26th & 27th September • Venue: Gyan Manch</p>
          <p className={styles.subtitle} style={{marginTop: 8}}>Participant Registration</p>
        </div>
        <div>
          <div className={styles.steps}>
            <span className={styles.step + (step >= 1 ? " " + styles.active : "")}>1</span>
            <span>Details</span>
            <span className={styles.separator}>—</span>
            <span className={styles.step + (step >= 2 ? " " + styles.active : "")}>2</span>
            <span>Selection</span>
            <span className={styles.separator}>—</span>
            <span className={styles.step + (step >= 3 ? " " + styles.active : "")}>3</span>
            <span>Review</span>
          </div>

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          {step === 1 && (
            <form className={styles.form}>
              <div>
                <label className={styles.label}>Full Name</label>
                <input className={styles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <label className={styles.label}>Phone Number</label>
                <input inputMode="numeric" pattern="[0-9]*" className={styles.input} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} />
              </div>
              <div>
                <label className={styles.label}>Government ID Number</label>
                <input className={styles.input} value={governmentId} onChange={(e) => setGovernmentId(e.target.value)} />
              </div>
              <div>
                <label className={styles.label}>Government ID Type</label>
                <select className={styles.select} value={governmentIdType} onChange={(e) => setGovernmentIdType(e.target.value)}>
                  <option value="AADHAAR">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="VOTER_ID">Voter ID</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className={styles.label}>Email (optional)</label>
                <input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div style={{textAlign: "right"}}>
                <button type="button" className={styles.button} onClick={nextFromStep1}>Next</button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className={styles.form}>
              <div>
                <label className={styles.label}>Participation Type</label>
                <div style={{marginTop: 8, display: "flex", gap: 8}}>
                  <button type="button" className={styles.button + (participationType === "SOLO" ? "" : " outline outline-1 outline-gray-300 bg-white text-indigo-700")} onClick={() => { setParticipationType("SOLO"); setTeamEventId(""); setTeamId(""); }}>
                    Solo Event
                  </button>
                  <button type="button" className={styles.button + (participationType === "TEAM" ? "" : " outline outline-1 outline-gray-300 bg-white text-indigo-700")} onClick={() => { setParticipationType("TEAM"); setSoloEventId(""); }}>
                    Team Event
                  </button>
                </div>
              </div>

              {participationType === "SOLO" && (
                <div>
                  <label className={styles.label}>Solo Event</label>
                  {/* <pre style={{color: 'red', fontSize: '0.8em', marginBottom: '0.5em'}}>{JSON.stringify(events?.soloEvents, null, 2)}</pre> */}
                  <select className={styles.select} value={soloEventId} onChange={(e) => setSoloEventId(e.target.value)}>
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
                    <label className={styles.label}>Team Event</label>
                    <select className={styles.select} value={teamEventId} onChange={(e) => { setTeamEventId(e.target.value); setTeamId(""); }}>
                      <option value="">Select a team event</option>
                      {events?.teamEvents.map((ev) => (
                        <option key={ev.id} value={ev.id}>{ev.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={styles.label}>Team Name</label>
                    <select className={styles.select} value={teamId} onChange={(e) => setTeamId(e.target.value)} disabled={!teamEventId}>
                      <option value="">Select a team</option>
                      {events?.teamEvents.find((e) => e.id === teamEventId)?.teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div style={{display: "flex", justifyContent: "space-between"}}>
                <button type="button" className={styles.button + " outline outline-1 outline-gray-300 bg-white text-indigo-700"} onClick={() => setStep(1)}>Back</button>
                <button type="button" className={styles.button} onClick={nextFromStep2}>Next</button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className={styles.form}>
              {successId ? (
                <div className={styles.success}>
                  Registration submitted. Status: Pending Admin Approval.
                </div>
              ) : (
                <>
                  <div className={styles.card} style={{boxShadow: "none", border: "1px solid #e5e7eb", padding: "1rem"}}>
                    <p className={styles.label}>Review</p>
                    <div style={{marginTop: 8, fontSize: "1rem"}}>
                      <p>Full Name: {fullName}</p>
                      <p>Phone: {phoneNumber}</p>
                      <p>ID: {governmentId} ({governmentIdType})</p>
                      {email && <p>Email: {email}</p>}
                      <p>Type: {participationType || "-"}</p>
                    </div>
                  </div>
                  <div style={{display: "flex", justifyContent: "space-between", marginTop: 16}}>
                    <button type="button" className={styles.button + " outline outline-1 outline-gray-300 bg-white text-indigo-700"} onClick={() => setStep(2)}>Back</button>
                    <button type="button" className={styles.button} onClick={submit} disabled={loading}>
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



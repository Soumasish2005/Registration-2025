"use client";

import { useEffect, useState } from "react";
import styles from "./admin.module.css";
import AdminLogin from "./login";
import AdminSidebar from "./sidebar";
import EventsManager from "./events";

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [section, setSection] = useState("events");
  const [pending, setPending] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    if (!loggedIn) return;
    if (section === "pending") {
      fetch("/api/admin/pending")
        .then(r => r.json())
        .then(data => setPending(data.registrations))
        .catch(() => setError("Failed to load pending registrations"));
    } else if (section === "approved") {
      fetch("/api/admin/approved")
        .then(r => r.json())
        .then(data => setApproved(data.registrations))
        .catch(() => setError("Failed to load approved registrations"));
    }
  }, [loggedIn, section]);

  const approve = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve");
      setPending(pending.filter(r => r.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to approve");
    } finally {
      setLoading(false);
    }
  };

  const reject = async (id: string, remarks: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, remarks })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject");
      setPending(pending.filter(r => r.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to reject");
    } finally {
      setLoading(false);
    }
  };

  const [expanded, setExpanded] = useState<string|null>(null);
  const [remarks, setRemarks] = useState<string>("");

  if (!loggedIn) {
    return <AdminLogin onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar section={section} setSection={setSection} />
      <div style={{ flex: 1, marginLeft: 180 }}>
        {section === "events" && <EventsManager />}
        {section === "pending" && (
          <div className={styles.wrapper}>
            <h1 className={styles.title}>Pending Registrations</h1>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.list}>
              {pending.length === 0 ? (
                <div>No pending registrations.</div>
              ) : (
                pending.map(reg => {
                  const maskedId = reg.participant.governmentId.replace(/.(?=.{4})/g, "*");
                  return (
                    <div key={reg.id} className={styles.card}>
                      <div><b>Name:</b> {reg.participant.fullName}</div>
                      <div><b>Phone:</b> {reg.participant.phoneNumber}</div>
                      <div><b>Govt ID:</b> {maskedId} ({reg.participant.governmentIdType})</div>
                      <div><b>Email:</b> {reg.participant.email || "-"}</div>
                      <div><b>Type:</b> {reg.soloEventId ? "SOLO" : "TEAM"}</div>
                      <div><b>Event:</b> {reg.soloEvent?.name || reg.team?.event.name}</div>
                      {reg.team && <div><b>Team:</b> {reg.team.name}</div>}
                      <div style={{marginTop:8}}>
                        <button className={styles.button} disabled={loading} onClick={() => approve(reg.id)}>Approve</button>
                        <button className={styles.button} style={{marginLeft:8,background:'#c00'}} disabled={loading} onClick={() => setExpanded(expanded === reg.id ? null : reg.id)}>Reject</button>
                        <button className={styles.button} style={{marginLeft:8,background:'#888'}} onClick={() => setExpanded(expanded === reg.id ? null : reg.id)}>View Details</button>
                      </div>
                      {expanded === reg.id && (
                        <div style={{marginTop:12}}>
                          <div><b>Full Details:</b></div>
                          <pre style={{background:'#f4f4f4',padding:8,borderRadius:4}}>{JSON.stringify(reg,null,2)}</pre>
                          <div style={{marginTop:8}}>
                            <input className={styles.input} placeholder="Remarks for rejection" value={remarks} onChange={e => setRemarks(e.target.value)} />
                            <button className={styles.button} style={{marginLeft:8,background:'#c00'}} disabled={loading || !remarks.trim()} onClick={() => { reject(reg.id, remarks); setRemarks(""); setExpanded(null); }}>Confirm Reject</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        {section === "approved" && (
          <div className={styles.wrapper}>
            <h1 className={styles.title}>Approved Registrations</h1>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.list}>
              {approved.length === 0 ? (
                <div>No approved registrations.</div>
              ) : (
                approved.map(reg => {
                  const maskedId = reg.participant.governmentId.replace(/.(?=.{4})/g, "*");
                  const downloadPDF = async () => {
                    const res = await fetch("/api/admin/pdf", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: reg.id })
                    });
                    if (!res.ok) return alert("Failed to generate PDF");
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `registration_${reg.id}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  };
                  return (
                    <div key={reg.id} className={styles.card}>
                      <div><b>Name:</b> {reg.participant.fullName}</div>
                      {reg.team && <div><b>Team Name:</b> {reg.team.name}</div>}
                      <div><b>Event:</b> {reg.soloEvent?.name || reg.team?.event.name}</div>
                      <div><b>Govt ID Type:</b> {reg.participant.governmentIdType}</div>
                      <div><b>Govt ID Number:</b> {maskedId}</div>
                      <div><b>Approval Date:</b> {new Date(reg.updatedAt).toLocaleString()}</div>
                      <button className={styles.button} style={{marginTop:8}} onClick={downloadPDF}>Download PDF</button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

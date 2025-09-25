import { useState, useEffect } from "react";
import styles from "./admin.module.css";

type EventType = "SOLO" | "TEAM";
type EventStatus = "Draft" | "Published";

export default function EventsManager() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [form, setForm] = useState({ name: "", type: "SOLO", status: "Draft", teams: [""] });

  useEffect(() => {
    fetch("/api/admin/events")
      .then(r => r.json())
      .then(data => setEvents(data.events))
      .catch(() => setError("Failed to load events"));
  }, []);

  const handleFormChange = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleTeamChange = (idx: number, value: string) => {
    setForm(f => ({ ...f, teams: f.teams.map((t, i) => i === idx ? value : t) }));
  };

  const addTeam = () => setForm(f => ({ ...f, teams: [...f.teams, ""] }));
  const removeTeam = (idx: number) => setForm(f => ({ ...f, teams: f.teams.filter((_, i) => i !== idx) }));

  const submitEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");
      setEvents([data.event, ...events]);
      setForm({ name: "", type: "SOLO", status: "Draft", teams: [""] });
    } catch (e: any) {
      setError(e.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  // Edit state
  const [editId, setEditId] = useState<string|null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  const startEdit = (ev: any) => {
    setEditId(ev.id);
    setEditForm({
      name: ev.name,
      type: ev.type,
      status: ev.isActive ? "Published" : "Draft",
      teams: ev.teams?.map((t: any) => t.name) || [""]
    });
  };
  const handleEditChange = (field: string, value: any) => {
    setEditForm((f: any) => ({ ...f, [field]: value }));
  };
  const handleEditTeamChange = (idx: number, value: string) => {
    setEditForm((f: any) => ({ ...f, teams: f.teams.map((t: string, i: number) => i === idx ? value : t) }));
  };
  const addEditTeam = () => setEditForm((f: any) => ({ ...f, teams: [...f.teams, ""] }));
  const removeEditTeam = (idx: number) => setEditForm((f: any) => ({ ...f, teams: f.teams.filter((_: any, i: number) => i !== idx) }));

  const submitEdit = async () => {
    if (!editId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/events/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update event");
      setEvents(events.map(ev => ev.id === editId ? { ...ev, ...data.event, teams: editForm.teams.map((name: string) => ({ name })) } : ev));
      setEditId(null);
      setEditForm(null);
    } catch (e: any) {
      setError(e.message || "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!window.confirm("Delete this event?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete event");
      setEvents(events.filter(ev => ev.id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Event Management</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form className={styles.form} onSubmit={e => { e.preventDefault(); submitEvent(); }}>
        <div>
          <label className={styles.label}>Event Name</label>
          <input className={styles.input} value={form.name} onChange={e => handleFormChange("name", e.target.value)} required />
        </div>
        <div>
          <label className={styles.label}>Event Type</label>
          <select className={styles.select} value={form.type} onChange={e => handleFormChange("type", e.target.value)}>
            <option value="SOLO">Solo</option>
            <option value="TEAM">Team</option>
          </select>
        </div>
        <div>
          <label className={styles.label}>Status</label>
          <select className={styles.select} value={form.status} onChange={e => handleFormChange("status", e.target.value)}>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
        </div>
        {form.type === "TEAM" && (
          <div>
            <label className={styles.label}>Team Names</label>
            {form.teams.map((team, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <input className={styles.input} value={team} onChange={e => handleTeamChange(idx, e.target.value)} required />
                <button type="button" className={styles.button} onClick={() => removeTeam(idx)} disabled={form.teams.length === 1}>Remove</button>
              </div>
            ))}
            <button type="button" className={styles.button} onClick={addTeam}>Add Team</button>
          </div>
        )}
        <div style={{ textAlign: "right" }}>
          <button className={styles.button} type="submit" disabled={loading}>Submit Event</button>
        </div>
      </form>
      <h3 style={{ marginTop: 32 }}>Existing Events</h3>
      <div className={styles.list}>
        {events.length === 0 ? (
          <div>No events found.</div>
        ) : (
          events.map(ev => (
            <div key={ev.id} className={styles.card}>
              {editId === ev.id ? (
                <form className={styles.form} onSubmit={e => { e.preventDefault(); submitEdit(); }}>
                  <div>
                    <label className={styles.label}>Event Name</label>
                    <input className={styles.input} value={editForm.name} onChange={e => handleEditChange("name", e.target.value)} required />
                  </div>
                  <div>
                    <label className={styles.label}>Event Type</label>
                    <select className={styles.select} value={editForm.type} onChange={e => handleEditChange("type", e.target.value)}>
                      <option value="SOLO">Solo</option>
                      <option value="TEAM">Team</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.label}>Status</label>
                    <select className={styles.select} value={editForm.status} onChange={e => handleEditChange("status", e.target.value)}>
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                  {editForm.type === "TEAM" && (
                    <div>
                      <label className={styles.label}>Team Names</label>
                      {editForm.teams.map((team: string, idx: number) => (
                        <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                          <input className={styles.input} value={team} onChange={e => handleEditTeamChange(idx, e.target.value)} required />
                          <button type="button" className={styles.button} onClick={() => removeEditTeam(idx)} disabled={editForm.teams.length === 1}>Remove</button>
                        </div>
                      ))}
                      <button type="button" className={styles.button} onClick={addEditTeam}>Add Team</button>
                    </div>
                  )}
                  <div style={{ textAlign: "right" }}>
                    <button className={styles.button} type="submit" disabled={loading}>Save</button>
                    <button type="button" className={styles.button} style={{marginLeft:8,background:'#888'}} onClick={() => { setEditId(null); setEditForm(null); }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div><b>Name:</b> {ev.name}</div>
                  <div><b>Type:</b> {ev.type}</div>
                  <div><b>Status:</b> {ev.isActive ? "Published" : "Draft"}</div>
                  {ev.teams && ev.teams.length > 0 && (
                    <div><b>Teams:</b> {ev.teams.map((t: any) => t.name).join(", ")}</div>
                  )}
                  <div style={{marginTop:8}}>
                    <button className={styles.button} onClick={() => startEdit(ev)}>Edit</button>
                    <button className={styles.button} style={{marginLeft:8,background:'#c00'}} onClick={() => deleteEvent(ev.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

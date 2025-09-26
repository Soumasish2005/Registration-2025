

import { useState, useEffect } from "react";
import styles from "./admin.module.css";

type Team = { name: string };
type Event = {
  id: string;
  name: string;
  type: "SOLO" | "TEAM";
  isActive: boolean;
  teams?: Team[];
};
type EventForm = {
  name: string;
  type: "SOLO" | "TEAM";
  status: "Draft" | "Published";
  teams: string[];
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [form, setForm] = useState<EventForm>({ name: "", type: "SOLO", status: "Draft", teams: [""] });

  useEffect(() => {
    fetch("/api/admin/events")
      .then(r => r.json())
      .then(data => setEvents(data.events as Event[]))
      .catch(() => setError("Failed to load events"));
  }, []);

  const handleFormChange = (field: keyof EventForm, value: string) => {
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
      setEvents([data.event as Event, ...events]);
      setForm({ name: "", type: "SOLO", status: "Draft", teams: [""] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  // Edit state
  const [editId, setEditId] = useState<string|null>(null);
  const [editForm, setEditForm] = useState<EventForm|null>(null);

  const startEdit = (ev: Event) => {
    setEditId(ev.id);
    setEditForm({
      name: ev.name,
      type: ev.type,
      status: ev.isActive ? "Published" : "Draft",
      teams: ev.teams?.map((t) => t.name) || [""]
    });
  };
  const handleEditChange = (field: keyof EventForm, value: string) => {
    setEditForm((f) => f ? { ...f, [field]: value } : null);
  };
  const handleEditTeamChange = (idx: number, value: string) => {
    setEditForm((f) => f ? { ...f, teams: f.teams.map((t, i) => i === idx ? value : t) } : null);
  };
  const addEditTeam = () => setEditForm((f) => f ? { ...f, teams: [...f.teams, ""] } : null);
  const removeEditTeam = (idx: number) => setEditForm((f) => f ? { ...f, teams: f.teams.filter((_, i) => i !== idx) } : null);

  const submitEdit = async () => {
    if (!editId || !editForm) return;
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
      setEvents(events.map(ev => ev.id === editId ? { ...ev, ...data.event, teams: editForm.teams.map((name) => ({ name })) } : ev));
      setEditId(null);
      setEditForm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update event");
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete event");
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
              {editId === ev.id && editForm ? (
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
                    <div><b>Teams:</b> {ev.teams.map((t: Team) => t.name).join(", ")}</div>
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

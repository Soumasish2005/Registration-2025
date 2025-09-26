
"use client";
import Link from "next/link";
import styles from "./page.module.css";
import { useEffect, useState } from "react";

type EventDto = { id: string; name: string };
type TeamDto = { id: string; name: string };
type EventsResponse = {
  soloEvents: EventDto[];
  teamEvents: (EventDto & { teams: TeamDto[] })[];
};


  export default function Home() {
    const [events, setEvents] = useState<EventsResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
      fetch("/api/events")
        .then((r) => r.json())
        .then((data: EventsResponse) => setEvents(data))
        .catch(() => setError("Failed to load events"));
    }, []);

    return (
      <div className={styles.landingWrapper}>
        <div className={styles.landingCard}>
          <div className={styles.landingHeader}>
            <h1 className={styles.landingTitle}>Calcutta Youth Meet – Chapter 9</h1>
            <p className={styles.landingSubtitle}>26th & 27th September • Venue: Gyan Manch</p>
            <p className={styles.landingMainText}>Welcome to the official registration portal!</p>
          </div>
          <div>
            <p className={styles.landingMainText}>
              Register to participate in a variety of solo and team events.<br />All registrations are subject to admin approval.
            </p>
            <Link href="/register">
              <button className={styles.landingButton}>Register Now</button>
            </Link>
          </div>
          <div className={styles.landingEvents}>
            <div className={styles.landingEventCard}>
              <div className={styles.landingEventTitle}>Solo Events</div>
              <ul className={styles.landingEventList}>
                {Array.isArray(events?.soloEvents) && events.soloEvents.length > 0
                  ? events.soloEvents.map((ev) => <li key={ev.id}>{ev.name}</li>)
                  : <li className={styles.landingNoEvents}>No solo events available</li>}
              </ul>
            </div>
            <div className={styles.landingEventCard}>
              <div className={styles.landingEventTitle}>Team Events</div>
              <ul className={styles.landingEventList}>
                {Array.isArray(events?.teamEvents) && events.teamEvents.length > 0
                  ? events.teamEvents.map((ev) => (
                      <li key={ev.id}>
                        {ev.name}
                        {Array.isArray(ev.teams) && ev.teams.length > 0 && (
                          <ul style={{ marginLeft: "1rem", fontSize: "0.95em", color: "#6366f1" }}>
                            {ev.teams.map((team) => (
                              <li key={team.id}>{team.name}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))
                  : <li className={styles.landingNoEvents}>No team events available</li>}
              </ul>
            </div>
          </div>
          {error && <div style={{ color: "#b91c1c", marginTop: "1.5rem", fontSize: "1rem" }}>{error}</div>}
        </div>
      </div>
    );
  }
  

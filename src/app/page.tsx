
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
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.ctas + " w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white shadow-sm"}>
            <div className="p-6 border-b border-neutral-200">
              <h1 className="text-2xl font-bold">Calcutta Youth Meet – Chapter 9</h1>
              <p className="text-sm text-neutral-600 mt-1">26th & 27th September • Venue: Gyan Manch</p>
              <p className="mt-4 font-medium">Welcome to the official registration portal!</p>
            </div>
            <div className="p-6">
              <div className={styles.ctas}>
                <p>
                  Register to participate in a variety of solo and team events. All registrations are subject to admin approval.
                </p>
                <Link href="/register">
                  <button className="rounded-md bg-black text-white px-6 py-2 text-lg font-semibold">Register Now</button>
                </Link>
              </div>
              <div style={{marginTop: 32}}>
                <h2 className="text-lg font-semibold mb-2">Available Events</h2>
                {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
                <div className={styles.ctas + " grid grid-cols-1 md:grid-cols-2 gap-4"}>
                  <div>
                    <h3 className="font-medium mb-1">Solo Events</h3>
                    <ul className="list-disc ml-5 text-sm">
                      {events?.soloEvents.length
                        ? events.soloEvents.map((ev) => <li key={ev.id}>{ev.name}</li>)
                        : <li className="text-neutral-400">No solo events available</li>}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Team Events</h3>
                    <ul className="list-disc ml-5 text-sm">
                      {events?.teamEvents.length
                        ? events.teamEvents.map((ev) => (
                            <li key={ev.id}>
                              {ev.name}
                              {ev.teams.length > 0 && (
                                <ul className="list-circle ml-4 text-xs text-neutral-600">
                                  {ev.teams.map((team) => (
                                    <li key={team.id}>{team.name}</li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))
                        : <li className="text-neutral-400">No team events available</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  

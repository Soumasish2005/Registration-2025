import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Create sample events and teams
    const soloNames = [
      "Classical Vocals",
      "Kathak Solo",
      "Tabla Solo"
    ];
    const teamNames = [
      { event: "Group Dance", teams: ["Nritya Crew", "Rhythm Squad", "Dance Collective"] },
      { event: "Band Performance", teams: ["The Cal Beats", "Gyan Rockers"] }
    ];

    for (const name of soloNames) {
      await prisma.event.upsert({
        where: { name_type: { name, type: "SOLO" } },
        create: { name, type: "SOLO" },
        update: {}
      });
    }

    for (const { event, teams } of teamNames) {
      const ev = await prisma.event.upsert({
        where: { name_type: { name: event, type: "TEAM" } },
        create: { name: event, type: "TEAM" },
        update: {}
      });
      for (const t of teams) {
        await prisma.team.upsert({
          where: { name_eventId: { name: t, eventId: ev.id } },
          create: { name: t, eventId: ev.id },
          update: {}
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Seeding failed" }, { status: 500 });
  }
}



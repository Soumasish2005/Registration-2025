import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.event.findMany({
    include: { teams: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, teams, status } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Event name required" }, { status: 400 });
    if (!type) return NextResponse.json({ error: "Event type required" }, { status: 400 });
    // Create event
    const event = await prisma.event.create({
      data: {
        name,
        type,
        isActive: status === "Published",
        teams: type === "TEAM" && Array.isArray(teams) ? {
          create: teams.map((t: string) => ({ name: t }))
        } : undefined
      }
    });
    return NextResponse.json({ event });
  } catch (error: unknown) {
    let details = "";
    if (error instanceof Error) details = error.message;
    else if (typeof error === "string") details = error;
    else details = JSON.stringify(error);
    return NextResponse.json({ error: "Failed to create event", details }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const soloEvents = await prisma.event.findMany({
      where: { isActive: true, type: "SOLO" },
      orderBy: { name: "asc" }
    });
    const teamEvents = await prisma.event.findMany({
      where: { isActive: true, type: "TEAM" },
      include: { teams: { where: { isActive: true }, orderBy: { name: "asc" } } },
      orderBy: { name: "asc" }
    });
    return NextResponse.json({ soloEvents, teamEvents });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}



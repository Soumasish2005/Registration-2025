
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const { name, type, status, teams } = await request.json();
    const event = await prisma.event.update({
      where: { id },
      data: {
        name,
        type,
        isActive: status === "Published",
      }
    });
    // Update teams for TEAM events
    if (type === "TEAM" && Array.isArray(teams)) {
      // Remove old teams and add new ones
      await prisma.team.deleteMany({ where: { eventId: id } });
      await prisma.team.createMany({
        data: teams.map((t: string) => ({ name: t, eventId: id }))
      });
    }
  return NextResponse.json({ event });
  } catch (error: unknown) {
    let details = "";
    if (error instanceof Error) details = error.message;
    else if (typeof error === "string") details = error;
    else details = JSON.stringify(error);
    return NextResponse.json({ error: "Failed to update event", details }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await prisma.team.deleteMany({ where: { eventId: id } });
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    let details = "";
    if (error instanceof Error) details = error.message;
    else if (typeof error === "string") details = error;
    else details = JSON.stringify(error);
    return NextResponse.json({ error: "Failed to delete event", details }, { status: 500 });
  }
}

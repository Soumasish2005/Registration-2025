import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const registrations = await prisma.registration.findMany({
    where: { status: "PENDING" },
    include: {
      participant: true,
      soloEvent: true,
      team: { include: { event: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ registrations });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RegistrationBody = {
  fullName: string;
  phoneNumber: string;
  governmentId: string;
  governmentIdType: "AADHAAR" | "PAN" | "VOTER_ID" | "DRIVING_LICENSE" | "PASSPORT" | "OTHER";
  email?: string;
  participationType: "SOLO" | "TEAM";
  soloEventId?: string;
  teamId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegistrationBody;

    if (!body.fullName?.trim()) return NextResponse.json({ error: "Full Name is required" }, { status: 400 });
    if (!/^\d{10}$/.test(body.phoneNumber)) return NextResponse.json({ error: "Phone must be 10 digits" }, { status: 400 });
    if (!body.governmentId?.trim()) return NextResponse.json({ error: "Government ID Number is required" }, { status: 400 });
    if (!body.governmentIdType) return NextResponse.json({ error: "Government ID Type is required" }, { status: 400 });
    if (body.participationType === "SOLO" && !body.soloEventId) return NextResponse.json({ error: "Solo Event is required" }, { status: 400 });
    if (body.participationType === "TEAM" && !body.teamId) return NextResponse.json({ error: "Team selection is required" }, { status: 400 });

    const participant = await prisma.participant.upsert({
      where: { phoneNumber: body.phoneNumber },
      create: {
        fullName: body.fullName,
        phoneNumber: body.phoneNumber,
        governmentId: body.governmentId,
        governmentIdType: body.governmentIdType,
        email: body.email ?? null
      },
      update: {
        fullName: body.fullName,
        governmentId: body.governmentId,
        governmentIdType: body.governmentIdType,
        email: body.email ?? null
      }
    });

    const registration = await prisma.registration.create({
      data: {
        participantId: participant.id,
        status: "PENDING",
        soloEventId: body.participationType === "SOLO" ? body.soloEventId : null,
        teamId: body.participationType === "TEAM" ? body.teamId : null
      }
    });

    return NextResponse.json({ id: registration.id, status: registration.status });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to submit registration", details: error?.message || error?.toString() }, { status: 500 });
  }
}



import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsPDF } from "jspdf";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing registration id" }, { status: 400 });
    const reg = await prisma.registration.findUnique({
      where: { id },
      include: {
        participant: true,
        soloEvent: true,
        team: { include: { event: true } }
      }
    });
    if (!reg) return NextResponse.json({ error: "Registration not found" }, { status: 404 });

    // PDF content
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Calcutta Youth Meet – Chapter 9", 20, 20);
    doc.setFontSize(12);
    doc.text(`26th & 27th September\nVenue: Gyan Manch`, 20, 30);
    doc.text("Approval Confirmation", 20, 40);
    doc.text(`Approval Date: ${new Date(reg.updatedAt).toLocaleString()}`, 20, 50);
    doc.text("Participant/Team Details:", 20, 60);
    doc.text(`Name: ${reg.participant.fullName}`, 20, 70);
    if (reg.team) doc.text(`Team Name: ${reg.team.name}`, 20, 80);
    doc.text(`Event: ${reg.soloEvent?.name || reg.team?.event.name}`, 20, 90);
    doc.text(`Govt ID Type: ${reg.participant.governmentIdType}`, 20, 100);
    doc.text(`Govt ID Number: ${reg.participant.governmentId.replace(/.(?=.{4})/g, "*")}`, 20, 110);
    doc.text("Thank you for registering!", 20, 130);

    const pdf = doc.output("arraybuffer");
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=registration_${reg.id}.pdf`
      }
    });
  } catch (error: unknown) {
    let details = "";
    if (error instanceof Error) details = error.message;
    else if (typeof error === "string") details = error;
    else details = JSON.stringify(error);
    return NextResponse.json({ error: "Failed to generate PDF", details }, { status: 500 });
  }
}

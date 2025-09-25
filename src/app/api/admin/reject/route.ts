import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing registration id" }, { status: 400 });
    await prisma.registration.update({
      where: { id },
      data: { status: "REJECTED" }
    });
    // Optionally, store remarks in a new field or a log table
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    let details = "";
    if (error instanceof Error) details = error.message;
    else if (typeof error === "string") details = error;
    else details = JSON.stringify(error);
    return NextResponse.json({ error: "Failed to reject registration", details }, { status: 500 });
  }
}

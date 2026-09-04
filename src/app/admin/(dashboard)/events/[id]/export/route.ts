import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { signupsToCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  await requireAdmin();

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      signups: { orderBy: { createdAt: "asc" }, include: { member: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const csv = signupsToCsv(
    event.signups.map((s) => ({
      name: s.member.name,
      email: s.member.email,
      createdAt: s.createdAt,
    }))
  );
  const filename = `${event.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-signups.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

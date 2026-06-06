import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase().trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      username: { contains: q },
      NOT: { id: session.user.id },
    },
    select: { id: true, username: true, displayName: true, avatarColor: true },
    take: 8,
  });

  return NextResponse.json({ users });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  const userId = user.id;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      participantA: {
        select: { id: true, username: true, displayName: true, avatarColor: true },
      },
      participantB: {
        select: { id: true, username: true, displayName: true, avatarColor: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: { select: { username: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  const userId = user.id;

  const { username } = await req.json();

  const targetUser = await prisma.user.findUnique({
    where: { username: username.toLowerCase().trim() },
    select: { id: true, username: true, displayName: true, avatarColor: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.id === userId) {
    return NextResponse.json(
      { error: "Cannot message yourself" },
      { status: 400 }
    );
  }

  // Canonical ordering (smaller id first) to prevent duplicates
  const [userAId, userBId] =
    userId < targetUser.id
      ? [userId, targetUser.id]
      : [targetUser.id, userId];

  const conversation = await prisma.conversation.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    update: {},
    create: { userAId, userBId },
    include: {
      participantA: {
        select: { id: true, username: true, displayName: true, avatarColor: true },
      },
      participantB: {
        select: { id: true, username: true, displayName: true, avatarColor: true },
      },
      messages: { take: 0 },
    },
  });

  return NextResponse.json({ conversation }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getUsers() {
  try {
    const SHEET_ID = "1DeO6gNvnD-UhRfD2jMr_5T1LhfEWZXJi3byVOHWa0Fo";
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
    const response = await fetch(url);
    const csv = await response.text();
    
    const lines = csv.split("\n").slice(1);
    const users = lines
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split(",");
        return {
          id: `user-${parts[0]?.trim()}`,
          username: parts[0]?.trim().toLowerCase() || "",
          displayName: parts[2]?.trim() || parts[0]?.trim() || "",
          avatarColor: parts[3]?.trim() || "#6366f1",
        };
      });
    
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUsername = (session.user as any).username;
  const allUsers = await getUsers();
  const currentUser = allUsers.find(u => u.username === currentUsername);

  if (!currentUser) {
    return NextResponse.json({ conversations: [] });
  }

  const otherUsers = allUsers.filter(u => u.username !== currentUsername);

  const conversations = otherUsers.map(other => ({
    id: `conv-${currentUser.id}-${other.id}`,
    participantA: currentUser,
    participantB: other,
    messages: [],
    updatedAt: new Date().toISOString(),
  }));

  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await req.json();
  const currentUsername = (session.user as any).username;

  const allUsers = await getUsers();
  const targetUser = allUsers.find(u => u.username === username.toLowerCase().trim());
  const currentUser = allUsers.find(u => u.username === currentUsername);

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.username === currentUsername) {
    return NextResponse.json(
      { error: "Cannot message yourself" },
      { status: 400 }
    );
  }

  const conversation = {
    id: `conv-${currentUser?.id}-${targetUser.id}`,
    participantA: currentUser,
    participantB: targetUser,
    messages: [],
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ conversation }, { status: 201 });
}

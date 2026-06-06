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
          password: parts[1]?.trim() || "",
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

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase().trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ users: [] });
  }

  const allUsers = await getUsers();
  const currentUsername = (session.user as any).username;

  const results = allUsers
    .filter(user => 
      user.username.includes(q) && 
      user.username !== currentUsername
    )
    .map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarColor: user.avatarColor,
    }))
    .slice(0, 8);

  return NextResponse.json({ users: results });
}

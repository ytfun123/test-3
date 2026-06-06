import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#0ea5e9", "#3b82f6",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.username || !body.password || !body.confirmPassword) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    // Validate username length
    if (body.username.length < 3 || body.username.length > 20) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters" },
        { status: 400 }
      );
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(body.username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, underscores" },
        { status: 400 }
      );
    }

    // Validate password length
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Validate passwords match
    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const usernameLower = body.username.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(body.password, 12);
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    // For testing without database - create user in memory
    const user = {
      id: "user-" + Date.now(),
      username: usernameLower,
      displayName: body.displayName || body.username,
      avatarColor,
    };

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

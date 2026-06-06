import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations";

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#0ea5e9", "#3b82f6",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Simple validation - make recovery optional
    if (!body.username || !body.password || !body.confirmPassword) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    if (body.username.length < 3 || body.username.length > 20) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(body.username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, underscores" },
        { status: 400 }
      );
    }

    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
  // For testing without database - just create user in memory
    const user = {
      id: "test-" + Date.now(),
      username: usernameLower,
      displayName: body.displayName || body.username,
    };

    return NextResponse.json({ user }, { status: 201 });
          avatarColor,
        },
        select: { id: true, username: true, displayName: true },
      });

      return NextResponse.json({ user }, { status: 201 });
    } catch (dbError) {
      console.error("Signup error:", dbError);
      return NextResponse.json(
        { error: "Failed to create account - database connection issue" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

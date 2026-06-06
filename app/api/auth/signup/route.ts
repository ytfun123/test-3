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
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { username, displayName, password, recoveryType, email, phone } =
      parsed.data;

    const usernameLower = username.toLowerCase().trim();

    // Check username exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: usernameLower },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Check email/phone uniqueness
    if (recoveryType === "email" && email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 }
        );
      }
    }

    if (recoveryType === "phone" && phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        return NextResponse.json(
          { error: "Phone number already registered" },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const avatarColor =
      AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const user = await prisma.user.create({
      data: {
        username: usernameLower,
        displayName: displayName || username,
        passwordHash,
        email: recoveryType === "email" ? email : null,
        phone: recoveryType === "phone" ? phone : null,
        avatarColor,
      },
      select: { id: true, username: true, displayName: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

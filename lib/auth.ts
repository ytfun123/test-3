import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username: string;
      avatarColor: string;
    };
  }

  interface User {
    id: string;
    username: string;
    avatarColor: string;
  }
}

// Mock users for testing (no database needed)
const mockUsers = [
  {
    id: "user-1",
    username: "testuser",
    displayName: "Test User",
    passwordHash: "$2a$12$R9h7cIPz0gi.URNNGHQ1GO3ng8KwuCnWM1p3pDRB1.X8bHdSxLBG",
    avatarColor: "#6366f1",
  },
  {
    id: "user-2",
    username: "testuser2",
    displayName: "Test User 2",
    passwordHash: "$2a$12$R9h7cIPz0gi.URNNGHQ1GO3ng8KwuCnWM1p3pDRB1.X8bHdSxLBG",
    avatarColor: "#8b5cf6",
  },
];

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = mockUsers.find(
          (u) => u.username === credentials.username.toLowerCase().trim()
        );

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.displayName || user.username,
          username: user.username,
          avatarColor: user.avatarColor,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.avatarColor = (user as any).avatarColor;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.avatarColor = token.avatarColor as string;
      }
      return session;
    },
  },
};

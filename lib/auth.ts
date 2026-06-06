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

async function getUsers() {
  try {
   const SHEET_ID = "1DeO6gNvnD-UhRfD2jMr_5T1LhfEWZXJi3byVOHWa0Fo";
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
    const response = await fetch(url);
    const csv = await response.text();
    
    const lines = csv.split("\n").slice(1); // Skip header
    const users = lines
      .filter(line => line.trim())
      .map(line => {
        const [username, password, displayName, avatarColor] = line.split(",");
        return {
          id: `user-${username}`,
          username: username.trim().toLowerCase(),
          password: password.trim(),
          displayName: displayName.trim(),
          avatarColor: avatarColor.trim() || "#6366f1",
        };
      });
    
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

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

        const users = await getUsers();
        const user = users.find(
          (u) => u.username === credentials.username.toLowerCase().trim()
        );

        if (!user) return null;

        // For Google Sheets: plain text comparison (or use bcrypt if you store hashes)
        if (credentials.password !== user.password) return null;

        return {
          id: user.id,
          name: user.displayName,
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

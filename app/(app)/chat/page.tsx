import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatShell } from "@/components/chat/ChatShell";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  return (
    <ChatShell
      currentUser={{
        id: session!.user.id,
        username: (session!.user as any).username,
        displayName: session!.user.name ?? "",
        avatarColor: (session!.user as any).avatarColor ?? "#6366f1",
      }}
    />
  );
}

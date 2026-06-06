import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChatShell } from "@/components/chat/ChatShell";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;

  return (
    <ChatShell
      currentUser={{
        id: user.id,
        username: user.username,
        displayName: user.name ?? "",
        avatarColor: user.avatarColor ?? "#6366f1",
      }}
    />
  );
}

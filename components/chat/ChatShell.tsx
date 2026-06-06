"use client";
import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import { ConversationList } from "./ConversationList";
import { MessagePane } from "./MessagePane";
import { NewConversationModal } from "./NewConversationModal";

export type UserInfo = {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
};

export type Conversation = {
  id: string;
  participantA: UserInfo;
  participantB: UserInfo;
  messages: { id: string; content: string; createdAt: string; sender: { username: string } }[];
  updatedAt: string;
};

export function ChatShell({ currentUser }: { currentUser: UserInfo }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    setMobileShowChat(true);
  };

  const handleNewConversation = (conv: Conversation) => {
    setConversations((prev) => {
      const exists = prev.find((c) => c.id === conv.id);
      if (exists) return prev;
      return [conv, ...prev];
    });
    setActiveConvId(conv.id);
    setShowNew(false);
    setMobileShowChat(true);
  };

  const getOtherUser = (conv: Conversation) =>
    conv.participantA.id === currentUser.id
      ? conv.participantB
      : conv.participantA;

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileShowChat ? "sidebar-hidden-mobile" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-logo">TW</span>
            <span className="brand-name">TextWave</span>
          </div>
          <button
            className="new-chat-btn"
            onClick={() => setShowNew(true)}
            title="New conversation"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="sidebar-user">
          <div
            className="avatar-sm"
            style={{ background: currentUser.avatarColor }}
          >
            {(currentUser.displayName || currentUser.username)[0].toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-display">{currentUser.displayName || currentUser.username}</span>
            <span className="user-handle">@{currentUser.username}</span>
          </div>
          <button
            className="signout-btn"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M5 1H2a1 1 0 00-1 1v11a1 1 0 001 1h3M10 10l4-3-4-3M14 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="sidebar-title">Messages</div>

        <ConversationList
          conversations={conversations}
          currentUserId={currentUser.id}
          activeId={activeConvId}
          loading={loadingConvs}
          onSelect={handleSelectConv}
          getOtherUser={getOtherUser}
        />
      </aside>

      {/* Message pane */}
      <main className={`main ${!mobileShowChat ? "main-hidden-mobile" : ""}`}>
        {activeConversation ? (
          <MessagePane
            conversation={activeConversation}
            currentUser={currentUser}
            otherUser={getOtherUser(activeConversation)}
            onBack={() => setMobileShowChat(false)}
            onUpdate={(conv) => {
              setConversations((prev) =>
                prev.map((c) => (c.id === conv.id ? { ...c, ...conv } : c))
              );
            }}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h2>Your messages</h2>
            <p>Send a message to start a conversation</p>
            <button className="btn-start" onClick={() => setShowNew(true)}>
              New conversation
            </button>
          </div>
        )}
      </main>

      {showNew && (
        <NewConversationModal
          onClose={() => setShowNew(false)}
          onCreated={handleNewConversation}
        />
      )}

      <style jsx>{shellStyles}</style>
    </div>
  );
}

const shellStyles = `
  .shell {
    display: flex;
    height: 100vh;
    height: 100dvh;
    background: var(--bg-primary);
    overflow: hidden;
  }

  .sidebar {
    width: 300px;
    flex-shrink: 0;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 12px;
    border-bottom: 1px solid var(--border);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .brand-logo {
    width: 30px;
    height: 30px;
    background: var(--accent);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    color: white;
  }

  .brand-name {
    font-weight: 600;
    font-size: 16px;
    color: var(--text-primary);
  }

  .new-chat-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--bg-hover);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .new-chat-btn:hover {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .sidebar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
  }

  .avatar-sm {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    color: white;
    flex-shrink: 0;
  }

  .user-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .user-display {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-handle {
    font-size: 11px;
    color: var(--text-muted);
  }

  .signout-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: color 0.15s;
  }
  .signout-btn:hover { color: var(--text-secondary); }

  .sidebar-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    padding: 14px 16px 6px;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--text-secondary);
    padding: 24px;
    text-align: center;
  }

  .empty-icon { font-size: 48px; margin-bottom: 8px; }

  .empty-state h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .empty-state p {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .btn-start {
    margin-top: 8px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }

  .btn-start:hover {
    background: var(--accent-hover);
    box-shadow: 0 4px 12px var(--accent-glow);
  }

  @media (max-width: 680px) {
    .sidebar-hidden-mobile { display: none; }
    .main-hidden-mobile { display: none; }
    .sidebar { width: 100%; }
    .main { width: 100%; }
  }
`;

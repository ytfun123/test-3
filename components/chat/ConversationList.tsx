"use client";
import { formatDistanceToNow } from "date-fns";
import type { Conversation, UserInfo } from "./ChatShell";

type Props = {
  conversations: Conversation[];
  currentUserId: string;
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  getOtherUser: (c: Conversation) => UserInfo;
};

export function ConversationList({
  conversations,
  activeId,
  loading,
  onSelect,
  getOtherUser,
}: Props) {
  if (loading) {
    return (
      <div className="conv-list">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="conv-skeleton">
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="skeleton" style={{ height: 13, width: "60%" }} />
              <div className="skeleton" style={{ height: 11, width: "80%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="conv-empty">
        <p>No conversations yet</p>
        <span>Start a new one!</span>
      </div>
    );
  }

  return (
    <div className="conv-list">
      {conversations.map((conv) => {
        const other = getOtherUser(conv);
        const lastMsg = conv.messages[0];
        const isActive = conv.id === activeId;

        return (
          <button
            key={conv.id}
            className={`conv-item ${isActive ? "conv-item-active" : ""}`}
            onClick={() => onSelect(conv.id)}
          >
            <div
              className="avatar"
              style={{ background: other.avatarColor }}
            >
              {(other.displayName || other.username)[0].toUpperCase()}
            </div>
            <div className="conv-body">
              <div className="conv-top">
                <span className="conv-name">
                  {other.displayName || other.username}
                </span>
                {lastMsg && (
                  <span className="conv-time">
                    {formatDistanceToNow(new Date(lastMsg.createdAt), {
                      addSuffix: false,
                    })}
                  </span>
                )}
              </div>
              <div className="conv-preview">
                {lastMsg
                  ? `${lastMsg.sender.username}: ${lastMsg.content}`
                  : "Start a conversation"}
              </div>
            </div>
          </button>
        );
      })}

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .conv-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 8px 16px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .conv-skeleton {
    display: flex;
    gap: 10px;
    padding: 10px 8px;
    align-items: center;
  }

  .conv-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--text-muted);
    font-size: 14px;
    padding: 32px;
    text-align: center;
  }

  .conv-empty span { font-size: 12px; }

  .conv-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 8px;
    border-radius: 10px;
    border: none;
    background: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: background 0.12s;
  }

  .conv-item:hover { background: var(--bg-hover); }
  .conv-item-active { background: var(--bg-hover); }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
    color: white;
    flex-shrink: 0;
  }

  .conv-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .conv-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .conv-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conv-time {
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .conv-preview {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

"use client";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
} from "react";
import { format } from "date-fns";
import { getPusherClient } from "@/lib/pusher";
import type { Conversation, UserInfo } from "./ChatShell";

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; username: string; displayName: string; avatarColor: string };
};

type Props = {
  conversation: Conversation;
  currentUser: UserInfo;
  otherUser: UserInfo;
  onBack: () => void;
  onUpdate: (partial: Partial<Conversation> & { id: string }) => void;
};

export function MessagePane({
  conversation,
  currentUser,
  otherUser,
  onBack,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((smooth = false) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
  }, []);

  // Load messages
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetch(`/api/messages?conversationId=${conversation.id}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || []);
        setLoading(false);
        setTimeout(() => scrollToBottom(false), 50);
      });
  }, [conversation.id, scrollToBottom]);

  // Pusher real-time
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`conversation-${conversation.id}`);
    channel.bind("new-message", (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => scrollToBottom(true), 50);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`conversation-${conversation.id}`);
    };
  }, [conversation.id, scrollToBottom]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (!loading) scrollToBottom(true);
  }, [messages.length, loading, scrollToBottom]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;

    setInput("");
    setSending(true);

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      content,
      senderId: currentUser.id,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarColor: currentUser.avatarColor,
      },
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => scrollToBottom(true), 30);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, conversationId: conversation.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? data.message : m))
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const grouped: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const date = format(new Date(msg.createdAt), "MMMM d, yyyy");
    const last = grouped[grouped.length - 1];
    if (last?.date === date) {
      last.messages.push(msg);
    } else {
      grouped.push({ date, messages: [msg] });
    }
  });

  return (
    <div className="pane">
      {/* Header */}
      <div className="pane-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div
          className="header-avatar"
          style={{ background: otherUser.avatarColor }}
        >
          {(otherUser.displayName || otherUser.username)[0].toUpperCase()}
        </div>
        <div className="header-info">
          <span className="header-name">
            {otherUser.displayName || otherUser.username}
          </span>
          <span className="header-handle">@{otherUser.username}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area">
        {loading ? (
          <div className="loading-msgs">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        ) : messages.length === 0 ? (
          <div className="no-msgs">
            <div
              className="nm-avatar"
              style={{ background: otherUser.avatarColor }}
            >
              {(otherUser.displayName || otherUser.username)[0].toUpperCase()}
            </div>
            <p>
              This is the beginning of your conversation with{" "}
              <strong>{otherUser.displayName || otherUser.username}</strong>
            </p>
          </div>
        ) : (
          grouped.map(({ date, messages: dayMsgs }) => (
            <div key={date}>
              <div className="date-divider">
                <span>{date}</span>
              </div>
              {dayMsgs.map((msg, i) => {
                const isMine = msg.senderId === currentUser.id;
                const prevMsg = dayMsgs[i - 1];
                const isConsecutive =
                  prevMsg && prevMsg.senderId === msg.senderId;
                return (
                  <div
                    key={msg.id}
                    className={`msg-row ${isMine ? "msg-mine" : "msg-theirs"} ${isConsecutive ? "msg-consecutive" : ""} message-bubble`}
                  >
                    {!isMine && !isConsecutive && (
                      <div
                        className="msg-avatar"
                        style={{ background: msg.sender.avatarColor }}
                      >
                        {(msg.sender.displayName || msg.sender.username)[0].toUpperCase()}
                      </div>
                    )}
                    {!isMine && isConsecutive && (
                      <div className="msg-avatar-spacer" />
                    )}
                    <div className="msg-content-wrap">
                      {!isMine && !isConsecutive && (
                        <span className="msg-sender">
                          {msg.sender.displayName || msg.sender.username}
                        </span>
                      )}
                      <div className={`bubble ${isMine ? "bubble-mine" : "bubble-theirs"} ${msg.id.startsWith("temp-") ? "bubble-sending" : ""}`}>
                        {msg.content}
                      </div>
                      {!isConsecutive && (
                        <span className="msg-time">
                          {format(new Date(msg.createdAt), "h:mm a")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="input-area">
        <textarea
          ref={textareaRef}
          className="msg-input"
          placeholder={`Message @${otherUser.username}…`}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={2000}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim() || sending}
          aria-label="Send"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 8L2 2l3 6-3 6 12-6z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <style jsx>{paneStyles}</style>
    </div>
  );
}

const paneStyles = `
  .pane {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-primary);
  }

  .pane-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-secondary);
  }

  .back-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px 6px 4px 0;
    display: flex;
    align-items: center;
    transition: color 0.15s;
  }
  .back-btn:hover { color: var(--text-primary); }

  @media (min-width: 681px) {
    .back-btn { display: none; }
  }

  .header-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: white;
    flex-shrink: 0;
  }

  .header-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .header-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .header-handle {
    font-size: 12px;
    color: var(--text-muted);
  }

  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 16px 0;
    display: flex;
    flex-direction: column;
  }

  .loading-msgs {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .no-msgs {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px;
    text-align: center;
  }

  .nm-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 600;
    color: white;
    margin-bottom: 4px;
  }

  .no-msgs p {
    font-size: 14px;
    color: var(--text-secondary);
    max-width: 280px;
    line-height: 1.5;
  }

  .date-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
  }

  .date-divider::before,
  .date-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .date-divider span {
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
    font-weight: 500;
  }

  .msg-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 2px 16px;
  }

  .msg-consecutive { padding-top: 1px; }

  .msg-mine {
    flex-direction: row-reverse;
  }

  .msg-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: white;
    flex-shrink: 0;
    margin-bottom: 16px;
  }

  .msg-avatar-spacer {
    width: 28px;
    flex-shrink: 0;
  }

  .msg-content-wrap {
    display: flex;
    flex-direction: column;
    max-width: 65%;
    gap: 2px;
  }

  .msg-mine .msg-content-wrap { align-items: flex-end; }

  .msg-sender {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 500;
    padding: 0 4px;
  }

  .bubble {
    padding: 9px 14px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .bubble-mine {
    background: var(--sent-bg);
    color: var(--text-primary);
    border-bottom-right-radius: 4px;
  }

  .bubble-theirs {
    background: var(--received-bg);
    border: 1px solid var(--border);
    color: var(--text-primary);
    border-bottom-left-radius: 4px;
  }

  .bubble-sending { opacity: 0.6; }

  .msg-time {
    font-size: 10px;
    color: var(--text-muted);
    padding: 0 4px;
  }

  .input-area {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--border);
    background: var(--bg-secondary);
  }

  .msg-input {
    flex: 1;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px 14px;
    color: var(--text-primary);
    font-size: 14px;
    outline: none;
    resize: none;
    line-height: 1.5;
    max-height: 120px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .msg-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-glow);
  }

  .msg-input::placeholder { color: var(--text-muted); }

  .send-btn {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: var(--accent);
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s, transform 0.1s;
  }

  .send-btn:hover:not(:disabled) { background: var(--accent-hover); }
  .send-btn:active:not(:disabled) { transform: scale(0.93); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
`;

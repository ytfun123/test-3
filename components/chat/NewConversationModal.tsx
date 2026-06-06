"use client";
import { useState, useRef, useEffect } from "react";
import type { Conversation } from "./ChatShell";

type Props = {
  onClose: () => void;
  onCreated: (conv: Conversation) => void;
};

export function NewConversationModal({ onClose, onCreated }: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState
    { id: string; username: string; displayName: string; avatarColor: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(search)}`
        );
        const data = await res.json();
        setResults(data.users || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutRef.current);
  }, [search]);

  const handleSelectUser = async (username: string) => {
    setCreating(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) {
        onCreated(data.conversation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Start a conversation</h2>
          <button className="close-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div className="modal-search-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="results">
          {loading && search && <div className="result-loading">Searching...</div>}
          {!loading && search && results.length === 0 && (
            <div className="result-empty">No users found matching "{search}"</div>
          )}
          {!search && (
            <div className="result-empty">Type a username to start chatting</div>
          )}
          {results.map((user) => (
            <button
              key={user.id}
              className="result-item"
              onClick={() => handleSelectUser(user.username)}
              disabled={creating}
            >
              <div
                className="result-avatar"
                style={{ background: user.avatarColor }}
              >
                {(user.displayName || user.username)[0].toUpperCase()}
              </div>
              <div className="result-info">
                <span className="result-name">
                  {user.displayName}
                </span>
                <span className="result-handle">@{user.username}</span>
              </div>
              <div className="result-arrow">→</div>
            </button>
          ))}
        </div>

        <style jsx>{modalStyles}</style>
      </div>
    </div>
  );
}

const modalStyles = `
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
    animation: fadeIn 0.2s ease-out;
  }

  .modal-content {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 20px;
    width: 100%;
    max-width: 450px;
    max-height: 600px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-secondary);
  }

  .modal-header h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.15s;
  }

  .close-btn:hover {
    background: var(--bg-hover);
    color: var(--text-secondary);
  }

  .modal-search-wrapper {
    position: relative;
    padding: 16px;
    border-bottom: 1px solid var(--border);
  }

  .search-icon {
    position: absolute;
    left: 28px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 16px 12px 40px;
    color: var(--text-primary);
    font-size: 15px;
    outline: none;
    transition: all 0.15s;
  }

  .search-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }

  .search-input::placeholder {
    color: var(--text-muted);
  }

  .results {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .result-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: 14px;
    padding: 32px;
    text-align: center;
  }

  .result-loading {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border: none;
    background: none;
    cursor: pointer;
    transition: background 0.12s;
    text-align: left;
    width: 100%;
    border-bottom: 1px solid var(--border);
  }

  .result-item:last-child {
    border-bottom: none;
  }

  .result-item:hover {
    background: var(--bg-hover);
  }

  .result-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .result-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
    color: white;
    flex-shrink: 0;
  }

  .result-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .result-name {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-handle {
    font-size: 13px;
    color: var(--text-muted);
  }

  .result-arrow {
    color: var(--accent);
    font-size: 16px;
    flex-shrink: 0;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

"use client";
import { useState, useRef, useEffect } from "react";
import type { Conversation } from "./ChatShell";

type Props = {
  onClose: () => void;
  onCreated: (conv: Conversation) => void;
};

export function NewConversationModal({ onClose, onCreated }: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<
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
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="Search username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="results">
          {loading && <div className="result-empty">Searching...</div>}
          {!loading && search && results.length === 0 && (
            <div className="result-empty">No users found</div>
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
                  {user.displayName || user.username}
                </span>
                <span className="result-handle">@{user.username}</span>
              </div>
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
    animation: fadeIn 0.15s ease-out;
  }

  .modal-content {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 16px;
    width: 100%;
    max-width: 400px;
    max-height: 600px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid var(--border);
  }

  .modal-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.15s;
  }

  .close-btn:hover {
    background: var(--bg-hover);
    color: var(--text-secondary);
  }

  .search-input {
    margin: 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 14px;
    color: var(--text-primary);
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .search-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-glow);
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
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 12px;
    border: none;
    background: none;
    cursor: pointer;
    transition: background 0.12s;
    text-align: left;
    width: 100%;
  }

  .result-item:hover {
    background: var(--bg-hover);
  }

  .result-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .result-avatar {
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

  .result-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .result-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-handle {
    font-size: 12px;
    color: var(--text-muted);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

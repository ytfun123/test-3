"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      username: form.username,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid username or password");
    } else {
      router.push("/chat");
      router.refresh();
    }
  };

  return (
    <div className="auth-card animate-fade-in">
      <div className="auth-header">
        <div className="logo-mark">TW</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to TextWave</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="field-group">
          <label className="field-label">Username</label>
          <input
            className="field-input"
            type="text"
            placeholder="your_username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
            autoFocus
          />
        </div>

        <div className="field-group">
          <label className="field-label">Password</label>
          <input
            className="field-input"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
          />
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <span className="btn-loading">Signing in…</span> : "Sign in"}
        </button>
      </form>

      <p className="auth-footer">
        Don't have an account?{" "}
        <Link href="/signup" className="auth-link">
          Create one
        </Link>
      </p>

      <style jsx>{authStyles}</style>
    </div>
  );
}

const authStyles = `
  .auth-card {
    width: 100%;
    max-width: 420px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 40px;
  }

  .auth-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .logo-mark {
    width: 52px;
    height: 52px;
    background: var(--accent);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 15px;
    color: white;
    margin: 0 auto 16px;
    box-shadow: 0 0 24px var(--accent-glow);
  }

  .auth-title {
    font-size: 26px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .auth-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .field-input {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 11px 14px;
    color: var(--text-primary);
    font-size: 15px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .field-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }

  .field-input::placeholder { color: var(--text-muted); }

  .error-msg {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
    font-size: 13px;
    padding: 10px 14px;
    border-radius: 8px;
  }

  .btn-primary {
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
    margin-top: 4px;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--accent-hover);
    box-shadow: 0 4px 16px var(--accent-glow);
  }

  .btn-primary:active:not(:disabled) { transform: scale(0.98); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-loading { opacity: 0.8; }

  .auth-footer {
    text-align: center;
    margin-top: 24px;
    font-size: 14px;
    color: var(--text-secondary);
  }

  .auth-link {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
  }
  .auth-link:hover { color: var(--accent-hover); text-decoration: underline; }
`;

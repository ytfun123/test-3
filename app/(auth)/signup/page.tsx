"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type RecoveryType = "email" | "phone";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    password: "",
    confirmPassword: "",
    recoveryType: "email" as RecoveryType,
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.username) e.username = "Required";
    else if (form.username.length < 3) e.username = "At least 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      e.username = "Letters, numbers, underscores only";
    if (!form.password) e.password = "Required";
    else if (form.password.length < 8) e.password = "At least 8 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (form.recoveryType === "email") {
      if (!form.email) e.email = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Invalid email";
    } else {
      if (!form.phone) e.phone = "Required";
      else if (!/^\+?[1-9]\d{6,14}$/.test(form.phone.replace(/\s/g, "")))
        e.phone = "Invalid phone number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Auto sign in
      await signIn("credentials", {
        username: form.username,
        password: form.password,
        redirect: false,
      });

      router.push("/chat");
      router.refresh();
    } catch {
      setServerError("Network error — please try again");
      setLoading(false);
    }
  };

  const field = (name: string) => ({
    error: errors[name],
  });

  return (
    <div className="auth-card animate-fade-in">
      <div className="auth-header">
        <div className="logo-mark">TW</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join TextWave</p>
      </div>

      {/* Step indicator */}
      <div className="steps">
        <div className={`step ${step >= 1 ? "active" : ""}`}>
          <div className="step-dot">1</div>
          <span>Account</span>
        </div>
        <div className="step-line" />
        <div className={`step ${step >= 2 ? "active" : ""}`}>
          <div className="step-dot">2</div>
          <span>Recovery</span>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleNext} className="auth-form" noValidate>
          <div className="field-group">
            <label className="field-label">Username *</label>
            <input
              className={`field-input ${errors.username ? "error" : ""}`}
              type="text"
              placeholder="cool_username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoFocus
            />
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
            <span className="field-hint">
              This is your unique @handle
            </span>
          </div>

          <div className="field-group">
            <label className="field-label">Display Name</label>
            <input
              className="field-input"
              type="text"
              placeholder="Your Name (optional)"
              value={form.displayName}
              onChange={(e) =>
                setForm({ ...form, displayName: e.target.value })
              }
            />
          </div>

          <div className="field-group">
            <label className="field-label">Password *</label>
            <input
              className={`field-input ${errors.password ? "error" : ""}`}
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          <div className="field-group">
            <label className="field-label">Confirm Password *</label>
            <input
              className={`field-input ${errors.confirmPassword ? "error" : ""}`}
              type="password"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="btn-primary">
            Continue →
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="recovery-info">
            <span className="info-icon">🔐</span>
            <p>
              Add a recovery contact so you can regain access if you forget
              your password.
            </p>
          </div>

          <div className="field-group">
            <label className="field-label">Recovery method</label>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${
                  form.recoveryType === "email" ? "selected" : ""
                }`}
                onClick={() =>
                  setForm({ ...form, recoveryType: "email", phone: "" })
                }
              >
                📧 Email
              </button>
              <button
                type="button"
                className={`toggle-btn ${
                  form.recoveryType === "phone" ? "selected" : ""
                }`}
                onClick={() =>
                  setForm({ ...form, recoveryType: "phone", email: "" })
                }
              >
                📱 Phone
              </button>
            </div>
          </div>

          {form.recoveryType === "email" ? (
            <div className="field-group">
              <label className="field-label">Email Address *</label>
              <input
                className={`field-input ${errors.email ? "error" : ""}`}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoFocus
                autoComplete="email"
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>
          ) : (
            <div className="field-group">
              <label className="field-label">Phone Number *</label>
              <input
                className={`field-input ${errors.phone ? "error" : ""}`}
                type="tel"
                placeholder="+1 555 000 0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                autoFocus
                autoComplete="tel"
              />
              {errors.phone && (
                <span className="field-error">{errors.phone}</span>
              )}
              <span className="field-hint">Include country code (e.g. +1)</span>
            </div>
          )}

          {serverError && <div className="error-msg">{serverError}</div>}

          <div className="btn-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </button>
          </div>
        </form>
      )}

      <p className="auth-footer">
        Already have an account?{" "}
        <Link href="/login" className="auth-link">
          Sign in
        </Link>
      </p>

      <style jsx>{authStyles}</style>
    </div>
  );
}

const authStyles = `
  .auth-card {
    width: 100%;
    max-width: 440px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 40px;
  }

  .auth-header {
    text-align: center;
    margin-bottom: 28px;
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

  .steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 28px;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-muted);
    transition: color 0.2s;
  }

  .step.active { color: var(--text-primary); }

  .step-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--bg-hover);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    transition: background 0.2s, border-color 0.2s;
  }

  .step.active .step-dot {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
    box-shadow: 0 0 8px var(--accent-glow);
  }

  .step-line {
    flex: 1;
    height: 1px;
    background: var(--border);
    max-width: 60px;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
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

  .field-input.error { border-color: #f87171; }
  .field-input::placeholder { color: var(--text-muted); }

  .field-error {
    font-size: 12px;
    color: #f87171;
  }

  .field-hint {
    font-size: 12px;
    color: var(--text-muted);
  }

  .recovery-info {
    display: flex;
    gap: 10px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 14px;
  }

  .info-icon { font-size: 16px; flex-shrink: 0; }

  .recovery-info p {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .toggle-group {
    display: flex;
    gap: 8px;
  }

  .toggle-btn {
    flex: 1;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px;
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .toggle-btn:hover { border-color: var(--border-light); color: var(--text-primary); }

  .toggle-btn.selected {
    background: var(--accent-glow);
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .error-msg {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
    font-size: 13px;
    padding: 10px 14px;
    border-radius: 8px;
  }

  .btn-row {
    display: flex;
    gap: 10px;
    margin-top: 4px;
  }

  .btn-primary {
    flex: 1;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--accent-hover);
    box-shadow: 0 4px 16px var(--accent-glow);
  }

  .btn-primary:active:not(:disabled) { transform: scale(0.98); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-secondary:hover { border-color: var(--border-light); color: var(--text-primary); }

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

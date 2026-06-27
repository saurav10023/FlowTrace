import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

// ── Shared tiny components ────────────────────────────────────────────────────

function Spinner() {
  return (
    <span style={{
      display: "inline-block", width: 14, height: 14,
      border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
      borderRadius: "50%", animation: "spin 0.6s linear infinite",
    }} />
  );
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div role="alert" style={{
      fontSize: 13, color: "var(--text-danger)", background: "var(--bg-danger)",
      border: "0.5px solid var(--border-danger)", borderRadius: "var(--radius)",
      padding: "8px 12px", marginBottom: "1rem",
    }}>{msg}</div>
  );
}

function PrimaryBtn({ onClick, loading, disabled, children }) {
  return (
    <button onClick={onClick} disabled={loading || disabled} style={{
      width: "100%", height: 36,
      background: "var(--fill-primary,#1a1a18)", color: "#fff",
      border: "none", borderRadius: "var(--radius)",
      fontSize: 14, fontWeight: 500, fontFamily: "inherit",
      cursor: loading || disabled ? "not-allowed" : "pointer",
      opacity: loading || disabled ? 0.5 : 1,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      marginTop: "1.1rem", transition: "opacity 0.15s",
    }}>
      {loading ? <Spinner /> : children}
    </button>
  );
}

function StepDots({ current }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: "1.5rem" }}>
      {[0, 1].map((i) => (
        <div key={i} style={{
          width: 20, height: 3, borderRadius: 2,
          background: i === current
            ? "var(--fill-primary,#1a1a18)"
            : "var(--border-strong)",
          transition: "background 0.2s",
        }} />
      ))}
    </div>
  );
}

function initials(name, username) {
  const str = name || username || "?";
  return str.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const s = {
  h1:    { fontSize: 18, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 },
  sub:   { fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "1.5rem" },
  field: { marginBottom: "0.9rem" },
  label: { fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 5 },
  input: {
    width: "100%", height: 36,
    border: "0.5px solid var(--border-strong)", borderRadius: "var(--radius)",
    background: "var(--surface-1)", color: "var(--text-primary)",
    padding: "0 12px", fontSize: 14, fontFamily: "inherit", outline: "none",
  },
  hint: { fontSize: 12, color: "var(--text-muted)", marginTop: 4 },
  hr:   { border: "none", borderTop: "0.5px solid var(--border)", margin: "1rem 0" },
};

// ── Step 1 — Login ────────────────────────────────────────────────────────────

function StepLogin({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [err, setErr]           = useState("");
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();

  const submit = async () => {
    setErr("");
    const val = username.trim().toLowerCase();
    if (!val) return setErr("Enter a username to continue.");
    if (!/^[a-z0-9_]{3,30}$/.test(val))
      return setErr("3–30 characters: lowercase letters, numbers, underscores only.");

    setLoading(true);
    try {
      // API instance already has baseURL: "http://localhost:8000"
      const res = await API.post("/api/v1/users/login", { username: val });
      const data = res.data.data;

      // login() in AuthContext handles setUser + localStorage
      login({ user: data, accessToken: data.accessToken });

      onSuccess(data);
    } catch (e) {
      setErr(e.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StepDots current={0} />
      <h1 style={s.h1}>Welcome</h1>
      <p style={s.sub}>Enter a username to continue</p>

      <ErrBox msg={err} />

      <div style={s.field}>
        <label style={s.label} htmlFor="username">Username</label>
        <input
          id="username"
          style={s.input}
          type="text"
          placeholder="e.g. john_doe"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={30}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <p style={s.hint}>3–30 chars · lowercase, numbers, underscores</p>
      </div>

      <PrimaryBtn onClick={submit} loading={loading}>Continue</PrimaryBtn>
    </>
  );
}

// ── Step 2 — Complete Profile ─────────────────────────────────────────────────

function StepProfile({ user }) {
  const [name,     setName]     = useState(user.name    || "");
  const [email,    setEmail]    = useState(user.email   || "");
  const [role,     setRole]     = useState(user.role    || "other");
  const [college,  setCollege]  = useState(user.college || "");
  const [err,      setErr]      = useState("");
  const [loading,  setLoading]  = useState(false);
  const [skipping, setSkipping] = useState(false);

  const { setUser } = useAuth();
  const navigate    = useNavigate();

  const save = async () => {
    setErr("");
    setLoading(true);
    try {
      // API instance handles auth header + withCredentials automatically
      const res = await API.post("/api/v1/users/me/complete-profile", {
        name, email, role, college,
      });
      const updated = res.data.data;
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      navigate("/");
    } catch (e) {
      setErr(e.response?.data?.message || "Could not save profile.");
    } finally {
      setLoading(false);
    }
  };

  const skip = async () => {
    setSkipping(true);
    try {
      await API.post("/api/v1/users/me/skip-profile");
    } catch { /* non-blocking */ }
    navigate("/dashboard");
  };

  return (
    <>
      <StepDots current={1} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "var(--bg-accent)", color: "var(--text-accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 500, flexShrink: 0,
        }}>
          {initials(user.name, user.username)}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>
            Hey, {user.name || user.username}!
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>@{user.username}</div>
        </div>
      </div>

      <h1 style={s.h1}>Complete your profile</h1>
      <p style={{ ...s.sub, marginBottom: "1.25rem" }}>
        Takes 30 seconds. Helps us personalise your experience.
      </p>

      <ErrBox msg={err} />

      <div style={s.field}>
        <label style={s.label} htmlFor="pName">Full name</label>
        <input id="pName" style={s.input} type="text" placeholder="Ada Lovelace"
          value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div style={s.field}>
        <label style={s.label} htmlFor="pEmail">Email</label>
        <input id="pEmail" style={s.input} type="email" placeholder="ada@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={s.field}>
          <label style={s.label} htmlFor="pRole">Role</label>
          <select id="pRole" style={s.input} value={role}
            onChange={(e) => setRole(e.target.value)}>
            <option value="other">Select…</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="researcher">Researcher</option>
            <option value="professional">Professional</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label} htmlFor="pCollege">College / Org</label>
          <input id="pCollege" style={s.input} type="text" placeholder="MIT"
            value={college} onChange={(e) => setCollege(e.target.value)} />
        </div>
      </div>

      <PrimaryBtn onClick={save} loading={loading}>Save profile</PrimaryBtn>

      <hr style={s.hr} />

      <button onClick={skip} disabled={skipping} style={{
        width: "100%", background: "none", border: "none",
        fontSize: 13, color: "var(--text-muted)",
        cursor: skipping ? "not-allowed" : "pointer",
        padding: "6px 0 2px", fontFamily: "inherit", transition: "color 0.15s",
      }}>
        {skipping ? "Redirecting…" : "Skip for now — I'll do this later"}
      </button>
    </>
  );
}

// ── Brand ─────────────────────────────────────────────────────────────────────

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.75rem" }}>
      <div style={{
        width: 30, height: 30, background: "#c96442", borderRadius: 7,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
      <span style={{ fontSize: 16, fontWeight: 500, color: "var(--text-primary)" }}>
        Your App
      </span>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function AuthFlow() {
  const [step, setStep] = useState("login");
  const [user, setUser] = useState(null);

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "2rem 1rem",
        background: "var(--surface-0)",
      }}>
        <div style={{
          background: "var(--surface-2)", border: "0.5px solid var(--border)",
          borderRadius: 12, padding: "2rem 2rem 1.75rem",
          width: "100%", maxWidth: 390,
        }}>
          <Brand />
          {step === "login" && (
            <StepLogin onSuccess={(u) => { setUser(u); setStep("profile"); }} />
          )}
          {step === "profile" && user && (
            <StepProfile user={user} />
          )}
        </div>
      </div>
    </>
  );
}
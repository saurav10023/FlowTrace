import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { label: "Methods",    href: "#methods" },
  { label: "Playground", href: "#playground" },
  { label: "Compare",   href: "#compare" },
  { label: "My Journey", href: "#journey" },
];

function AdminIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  const isAdmin     = user?.userType === "admin";
  const displayName = user?.name?.trim() || user?.username || "User";
  const initials    = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // Scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Click-outside dropdown
  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Close drawer on resize
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const closeAll = () => { setMenuOpen(false); setDropdownOpen(false); };

  return (
    <>
      <style>{`
        .nav-link {
          font-size: 13.5px; font-weight: 500; color: #7b7b9a;
          text-decoration: none; padding: 6px 12px; border-radius: 8px;
          transition: color 0.15s, background 0.15s; white-space: nowrap;
        }
        .nav-link:hover { color: #e8e8f0; background: rgba(255,255,255,0.05); }
        .nav-link-admin { color: #fbbf24; }
        .nav-link-admin:hover { color: #fcd34d; background: rgba(245,158,11,0.08); }
        .btn-demo {
          font-size: 13px; font-weight: 600; color: #fff;
          background: #6366f1; text-decoration: none;
          padding: 7px 16px; border-radius: 8px;
          transition: opacity 0.15s, transform 0.15s; white-space: nowrap;
        }
        .btn-demo:hover { opacity: 0.88; transform: translateY(-1px); }
        .dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 16px; font-size: 13px; color: #7b7b9a;
          text-decoration: none; transition: color 0.15s, background 0.15s;
          cursor: pointer; background: none; border: none; width: 100%; text-align: left;
          font-family: inherit;
        }
        .dropdown-item:hover { color: #e8e8f0; background: rgba(255,255,255,0.05); }
        .dropdown-item-danger:hover { color: #f87171; background: rgba(239,68,68,0.06); }
        .dropdown-item-admin { color: #fbbf24; }
        .dropdown-item-admin:hover { color: #fcd34d; background: rgba(245,158,11,0.06); }
        .avatar {
          width: 28px; height: 28px; border-radius: 7px;
          background: #6366f1; display: flex; align-items: center;
          justify-content: center; font-size: 11px; font-weight: 700;
          color: #fff; flex-shrink: 0; letter-spacing: 0.02em;
        }
        .avatar-lg {
          width: 38px; height: 38px; border-radius: 9px;
          background: #6366f1; display: flex; align-items: center;
          justify-content: center; font-size: 14px; font-weight: 700;
          color: #fff; flex-shrink: 0;
        }
        .badge-admin {
          font-size: 9px; font-weight: 700; font-family: monospace;
          background: rgba(245,158,11,0.15); color: #fbbf24;
          border: 1px solid rgba(245,158,11,0.25);
          border-radius: 4px; padding: 2px 5px;
          text-transform: uppercase; letter-spacing: 0.08em; line-height: 1;
        }
        .badge-warn {
          font-size: 10px; color: #fbbf24; text-decoration: none;
          display: inline-flex; align-items: center; gap: 4px;
          margin-top: 5px; transition: color 0.15s;
        }
        .badge-warn:hover { color: #fcd34d; }
        .ham-bar {
          display: block; width: 20px; height: 1.5px;
          background: #7b7b9a; border-radius: 2px;
          transition: all 0.22s;
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
        background: scrolled ? "rgba(10,10,15,0.82)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
      }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto", padding: "0 24px",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
        }}>

          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: "#6366f1",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#fff",
            }}>₹</div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#e8e8f0", letterSpacing: "-0.02em" }}>
              payment<span style={{ color: "#818cf8" }}>lab</span>
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, fontFamily: "monospace",
              background: "rgba(99,102,241,0.15)", color: "#818cf8",
              border: "1px solid rgba(99,102,241,0.25)", borderRadius: 4,
              padding: "2px 6px", textTransform: "uppercase", letterSpacing: "0.1em",
            }}>India</span>
          </a>

          {/* Desktop center nav */}
          <ul style={{ display: "flex", alignItems: "center", gap: 2, listStyle: "none", margin: 0, padding: 0 }}
            className="hidden-mobile">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="nav-link">{l.label}</a>
              </li>
            ))}
            {isAdmin && (
              <li>
                <a href="/admin" className="nav-link nav-link-admin" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <AdminIcon className="w-3.5 h-3.5" style={{ width: 14, height: 14 }} />
                  Admin
                </a>
              </li>
            )}
          </ul>

          {/* Desktop right */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
            className="hidden-mobile">
            <a href="#journey" className="nav-link">Case study</a>
            <a href="#playground" className="btn-demo">Try live demo →</a>

            {user ? (
              <div style={{ position: "relative" }} ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 9, padding: "5px 10px 5px 6px",
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                >
                  <div className="avatar">{initials}</div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#e8e8f0", maxWidth: 88, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {displayName}
                  </span>
                  {isAdmin && <span className="badge-admin">Admin</span>}
                  <svg style={{
                    width: 12, height: 12, color: "#7b7b9a", flexShrink: 0,
                    transform: dropdownOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                    width: 220, background: "#0d0d18",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12, overflow: "hidden",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                    zIndex: 50,
                  }}>
                    {/* User info header */}
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#e8e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {displayName}
                        </span>
                        {isAdmin && <span className="badge-admin">Admin</span>}
                      </div>
                      <span style={{ fontSize: 11, color: "#7b7b9a" }}>@{user.username}</span>
                      {user.email && (
                        <div style={{ fontSize: 11, color: "#7b7b9a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user.email}
                        </div>
                      )}
                      {!user.profileCompleted && (
                        <a href="/complete-profile" onClick={closeAll} className="badge-warn">
                          <svg style={{ width: 11, height: 11, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                          </svg>
                          Complete your profile
                        </a>
                      )}
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: "4px 0" }}>
                      <a href="/profile" onClick={closeAll} className="dropdown-item">
                        <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My profile
                      </a>
                      <a href="/transactions" onClick={closeAll} className="dropdown-item">
                        <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        My transactions
                      </a>
                      {isAdmin && (
                        <a href="/admin" onClick={closeAll} className="dropdown-item dropdown-item-admin">
                          <AdminIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
                          Admin dashboard
                        </a>
                      )}
                    </div>

                    {/* Logout */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "4px 0" }}>
                      <button onClick={() => { closeAll(); logout(); }} className="dropdown-item dropdown-item-danger">
                        <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a href="/login" className="btn-demo">Login →</a>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="show-mobile"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", flexDirection: "column", gap: 5 }}
          >
            <span className="ham-bar" style={{ transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none" }} />
            <span className="ham-bar" style={{ opacity: menuOpen ? 0 : 1 }} />
            <span className="ham-bar" style={{ transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div
        className="show-mobile"
        style={{
          position: "fixed", top: 60, left: 0, right: 0, zIndex: 40,
          background: "rgba(10,10,15,0.97)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          maxHeight: menuOpen ? "calc(100vh - 60px)" : 0,
          overflow: "hidden",
          transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div style={{ padding: "16px 20px 24px", overflowY: "auto", maxHeight: "calc(100vh - 60px)" }}>

          {/* Mobile user block */}
          {user && (
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 0 16px", borderBottom: "1px solid rgba(255,255,255,0.07)",
              marginBottom: 8,
            }}>
              <div className="avatar-lg">{initials}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0" }}>{displayName}</span>
                  {isAdmin && <span className="badge-admin">Admin</span>}
                </div>
                <span style={{ fontSize: 12, color: "#7b7b9a" }}>
                  @{user.username}{user.email ? ` · ${user.email}` : ""}
                </span>
                {!user.profileCompleted && (
                  <a href="/complete-profile" onClick={closeAll} className="badge-warn" style={{ display: "flex" }}>
                    <svg style={{ width: 11, height: 11 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                    </svg>
                    Complete your profile
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Nav links */}
          <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={closeAll} style={{
                fontSize: 15, fontWeight: 500, color: "#7b7b9a",
                textDecoration: "none", padding: "11px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                transition: "color 0.15s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#e8e8f0"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#7b7b9a"}
              >{l.label}</a>
            ))}
            {isAdmin && (
              <a href="/admin" onClick={closeAll} style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 15, fontWeight: 500, color: "#fbbf24",
                textDecoration: "none", padding: "11px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <AdminIcon style={{ width: 16, height: 16 }} />
                Admin dashboard
              </a>
            )}
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a href="#journey" onClick={closeAll} style={{
              fontSize: 14, fontWeight: 500, color: "#7b7b9a",
              textDecoration: "none", padding: "10px 16px", borderRadius: 9,
              background: "rgba(255,255,255,0.05)", textAlign: "center", transition: "color 0.15s",
            }}>Case study</a>
            <a href="#playground" onClick={closeAll} className="btn-demo" style={{ textAlign: "center", padding: "10px 16px", borderRadius: 9 }}>
              Try live demo →
            </a>

            {user ? (
              <>
                <a href="/profile" onClick={closeAll} style={{
                  fontSize: 14, fontWeight: 500, color: "#7b7b9a", textDecoration: "none",
                  padding: "10px 16px", borderRadius: 9, background: "rgba(255,255,255,0.05)",
                  textAlign: "center",
                }}>My profile</a>
                <a href="/transactions" onClick={closeAll} style={{
                  fontSize: 14, fontWeight: 500, color: "#7b7b9a", textDecoration: "none",
                  padding: "10px 16px", borderRadius: 9, background: "rgba(255,255,255,0.05)",
                  textAlign: "center",
                }}>My transactions</a>
                <button onClick={() => { closeAll(); logout(); }} style={{
                  fontSize: 14, fontWeight: 500, color: "#f87171",
                  background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)",
                  borderRadius: 9, padding: "10px 16px", cursor: "pointer",
                  fontFamily: "inherit", transition: "background 0.15s",
                }}>Sign out</button>
              </>
            ) : (
              <a href="/login" onClick={closeAll} className="btn-demo" style={{ textAlign: "center", padding: "10px 16px", borderRadius: 9 }}>
                Login →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Responsive helpers */}
      <style>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile   { display: none  !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none  !important; }
          .show-mobile   { display: flex  !important; }
        }
      `}</style>
    </>
  );
}
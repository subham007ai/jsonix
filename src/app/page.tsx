"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { TOOLS, Tool } from "@/components/tools-data";
import ProNotifySection from "@/components/ProNotifySection";

/* ─── Helpers ─────────────────────────────────────────────── */
function syntaxHighlight(json: string): string {
    const e = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return e.replace(
        /("(?:\\.|[^"\\])*")(\s*:)?|(\btrue\b|\bfalse\b)|(\bnull\b)|([-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
        (_m, str, colon, bool, nil, num) => {
            if (str && colon) return `<span style="color:var(--blue)">${str}</span>${colon}`;
            if (str) return `<span style="color:var(--green)">${str}</span>`;
            if (bool) return `<span style="color:var(--red)">${bool}</span>`;
            if (nil) return `<span style="color:var(--text-3)">${nil}</span>`;
            if (num) return `<span style="color:var(--yellow)">${num}</span>`;
            return _m;
        }
    );
}

function useHover() {
    const [hov, setHov] = useState(false);
    return { hov, onMouseEnter: () => setHov(true), onMouseLeave: () => setHov(false) };
}

/* ─── Nav ─────────────────────────────────────────────────── */
function Nav() {
    const [scrolled, setScrolled] = useState(false);
    const gh = useHover();
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);

    return (
        <nav style={{
            position: "fixed", top: 0, left: 0, right: 0, height: "52px", zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px",
            background: scrolled ? "rgba(10,10,10,0.9)" : "rgba(10,10,10,0.6)",
            borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
            backdropFilter: "blur(16px)", transition: "all 0.3s ease",
        }}>
            {/* Left */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                    width: "28px", height: "28px", background: "var(--surface-el)",
                    border: "1px solid var(--border)",
                    borderBottom: "2px solid var(--green)",
                    borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "glow-pulse 3s ease infinite",
                }}>
                    <span style={{ fontSize: "11px", color: "var(--text-1)", fontFamily: "var(--mono)", fontWeight: 500, letterSpacing: "-0.5px" }}>{'</>'}</span>
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: "14px", fontWeight: 600 }}>
                    json<span style={{ color: "var(--green)" }}>ix</span>
                </span>
                <div style={{
                    display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px",
                    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px",
                    fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-2)",
                    marginLeft: "12px"
                }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--green)", animation: "pulse 2s ease infinite" }} />
                    client-side
                </div>
            </div>
            {/* Right */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <button
                    suppressHydrationWarning
                    className="nav-search-pill"
                    onClick={() => {
                        document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' });
                        setTimeout(() => { document.getElementById('tool-search')?.focus(); }, 300);
                    }}
                    style={{
                        display: "flex", alignItems: "center", gap: "6px", color: "var(--text-3)", fontSize: "12px",
                        background: "none", border: "none", cursor: "pointer", padding: 0,
                    }}
                >
                    <kbd style={{ padding: "2px 5px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px", fontFamily: "var(--mono)", fontSize: "11px" }}>⌘K</kbd>
                    <span>search</span>
                </button>
                <a href="https://github.com/subham007ai/jsonix" target="_blank" rel="noopener noreferrer" onMouseEnter={gh.onMouseEnter} onMouseLeave={gh.onMouseLeave} style={{
                    padding: "5px 12px", background: "transparent",
                    border: `1px solid ${gh.hov ? "var(--border-hover)" : "var(--border)"}`,
                    borderRadius: "6px", fontSize: "12px", color: gh.hov ? "var(--text-1)" : "var(--text-2)",
                    cursor: "pointer", textDecoration: "none", transition: "all 0.15s ease",
                    transform: gh.hov ? "translateY(-1px)" : "none", display: "inline-block",
                }}>
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-label="GitHub"
                        style={{
                            color: gh.hov ? "var(--green)" : "var(--text-1)",
                            transition: "color 0.15s ease",
                            display: "block"
                        }}
                    >
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                </a>
            </div>
        </nav>
    );
}

/* ─── HeroPreview ─────────────────────────────────────────── */
const INPUT_STR = '{"id":1,"name":"Subham","role":"admin","active":true}';
const OUTPUT_STR = `{
  "id": 1,
  "name": "Subham",
  "role": "admin",
  "active": true
}`;

function HeroPreview() {
    const [typed, setTyped] = useState("");         // empty for SSR safety
    const [showOutput, setShowOutput] = useState(false);

    useEffect(() => {
        let i = 0;
        const iv = setInterval(() => {
            i++;
            setTyped(INPUT_STR.slice(0, i));
            if (i >= INPUT_STR.length) { clearInterval(iv); setTimeout(() => setShowOutput(true), 400); }
        }, 35);
        return () => clearInterval(iv);
    }, []);

    return (
        <div style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px",
            overflow: "hidden", maxWidth: "540px", width: "100%", animation: "float 6s ease-in-out infinite",
        }}>
            {/* Chrome bar */}
            <div style={{
                height: "38px", display: "flex", alignItems: "center", padding: "0 14px", gap: "6px",
                borderBottom: "1px solid var(--border)", background: "var(--surface-el)",
            }}>
                {["#ef4444", "#eab308", "#22c55e"].map(c => (
                    <span key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, display: "block" }} />
                ))}
                <span style={{ marginLeft: "8px", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)" }}>input.json</span>
            </div>
            {/* Columns */}
            <div style={{ display: "flex", minHeight: "130px" }}>
                <div style={{ flex: 1, padding: "14px 16px", borderRight: "1px solid var(--border)", fontFamily: "var(--mono)", fontSize: "12px", lineHeight: 1.7 }}>
                    <div style={{ color: "var(--text-3)", fontSize: "10px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>input</div>
                    <span style={{ color: "var(--text-2)", wordBreak: "break-all" }}>{typed}</span>
                    <span style={{ display: "inline-block", width: "1px", height: "13px", background: "var(--green)", animation: "pulse 1s ease infinite", verticalAlign: "middle", marginLeft: "1px" }} />
                </div>
                <div style={{ flex: 1, padding: "14px 16px", fontFamily: "var(--mono)", fontSize: "12px", lineHeight: 1.7, opacity: showOutput ? 1 : 0, transition: "opacity 0.4s ease" }}>
                    <div style={{ color: "var(--text-3)", fontSize: "10px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>output</div>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }} dangerouslySetInnerHTML={{ __html: syntaxHighlight(OUTPUT_STR) }} />
                </div>
            </div>
            {/* Status bar */}
            <div style={{
                height: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px",
                borderTop: "1px solid var(--border)", background: "var(--surface-el)", fontFamily: "var(--mono)", fontSize: "11px",
            }}>
                <span style={{ color: "var(--green)" }}>✓ Valid JSON</span>
                <span style={{ color: "var(--text-3)" }}>52 chars · 1 line → 6 lines</span>
            </div>
        </div>
    );
}

/* ─── ToolCard ────────────────────────────────────────────── */
function ToolCard({ tool, index, onClick }: { tool: Tool; index: number; onClick: () => void }) {
    const { hov, onMouseEnter, onMouseLeave } = useHover();
    const [pressed, setPressed] = useState(false);
    const delay = `${(index * 0.06).toFixed(2)}s`;

    return (
        <div
            suppressHydrationWarning
            role="button" tabIndex={0}
            onClick={onClick} onKeyDown={e => e.key === "Enter" && onClick()}
            onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
            onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
            style={{
                background: hov ? "var(--surface-el)" : "var(--surface)",
                border: `1px solid ${hov ? "var(--border-hover)" : "var(--border)"}`,
                borderTop: hov
                    ? `2px solid color-mix(in srgb, var(${tool.color}) 60%, transparent)`
                    : "2px solid transparent",
                borderRadius: "10px", padding: "28px", cursor: "pointer",
                transition: "all 0.15s ease", transform: pressed ? "scale(0.99)" : "scale(1)",
                animation: `fadeUp 0.5s ease ${delay} both`,
                display: "flex", flexDirection: "column", gap: "10px", outline: "none",
                boxShadow: hov
                    ? `0 8px 32px -8px color-mix(in srgb, var(${tool.color}) 30%, transparent)`
                    : "none",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                        width: "32px", height: "32px", borderRadius: "6px", flexShrink: 0,
                        background: `color-mix(in srgb, var(${tool.color}) 10%, transparent)`,
                        border: `1px solid color-mix(in srgb, var(${tool.color}) 22%, transparent)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--mono)", fontSize: "12px", color: `var(${tool.color})`,
                    }}>{tool.icon}</div>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-1)" }}>{tool.name}</span>
                </div>
                <span style={{
                    fontFamily: "var(--mono)", fontSize: "10px", padding: "3px 8px", borderRadius: "20px",
                    background: `color-mix(in srgb, var(${tool.color}) 8%, transparent)`,
                    border: `1px solid color-mix(in srgb, var(${tool.color}) 18%, transparent)`,
                    color: `var(${tool.color})`,
                }}>{tool.tag}</span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-3)", lineHeight: 1.6, margin: 0 }}>{tool.desc}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: hov ? `var(${tool.color})` : "var(--text-3)", transition: "color 0.15s ease", marginTop: "4px" }}>
                Open tool <span style={{ transform: hov ? "translateX(4px)" : "translateX(0)", transition: "transform 0.15s ease", display: "inline-block" }}>→</span>
            </div>
        </div>
    );
}

/* ─── Buttons ─────────────────────────────────────────────── */
function PrimaryBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    const { hov, onMouseEnter, onMouseLeave } = useHover();
    const [active, setActive] = useState(false);
    return (
        <button 
            suppressHydrationWarning 
            onClick={onClick} 
            onMouseEnter={onMouseEnter} 
            onMouseLeave={() => { onMouseLeave(); setActive(false); }}
            onMouseDown={() => setActive(true)}
            onMouseUp={() => setActive(false)}
            style={{
                padding: "10px 20px", background: hov ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.1)",
                border: "1px solid var(--green-border)", borderRadius: "8px", color: "var(--green)",
                fontSize: "14px", cursor: "pointer", transition: "opacity 0.15s ease, transform 0.05s ease",
                transform: active ? "scale(0.97)" : hov ? "translateY(-1px)" : "none",
            }}
        >{children}</button>
    );
}
function SecondaryBtn({ href, children }: { href: string; children: React.ReactNode }) {
    const { hov, onMouseEnter, onMouseLeave } = useHover();
    const [active, setActive] = useState(false);
    return (
        <a 
            suppressHydrationWarning 
            href={href} target="_blank" rel="noopener noreferrer" 
            onMouseEnter={onMouseEnter} 
            onMouseLeave={() => { onMouseLeave(); setActive(false); }}
            onMouseDown={() => setActive(true)}
            onMouseUp={() => setActive(false)}
            style={{
                padding: "10px 20px", background: "transparent",
                border: `1px solid ${hov ? "var(--border-hover)" : "var(--border)"}`,
                borderRadius: "8px", color: hov ? "var(--text-1)" : "var(--text-2)",
                fontSize: "14px", cursor: "pointer", transition: "opacity 0.15s ease, transform 0.05s ease",
                textDecoration: "none", display: "inline-block", 
                transform: active ? "scale(0.97)" : hov ? "translateY(-1px)" : "none",
            }}
        >{children}</a>
    );
}
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    const { hov, onMouseEnter, onMouseLeave } = useHover();
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={{
            color: hov ? "var(--text-1)" : "var(--text-3)", fontSize: "12px", textDecoration: "none", transition: "color 0.15s ease",
            display: "inline-flex", alignItems: "center"
        }}>{children}</a>
    );
}

/* ─── SearchInput ─────────────────────────────────────────── */
function SearchInput({ value, onChange, inputRef }: { value: string; onChange: (v: string) => void; inputRef?: React.RefObject<HTMLInputElement> }) {
    const [focused, setFocused] = useState(false);
    const [shortcutGlow, setShortcutGlow] = useState(false);
    return (
        <div style={{ position: "relative", width: "260px", display: "flex", alignItems: "center" }}>
            <span style={{ position: "absolute", left: "12px", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)", pointerEvents: "none" }}>⌘</span>
            <input
                ref={inputRef}
                id="tool-search"
                suppressHydrationWarning
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                type="text" placeholder="Search tools..." value={value} onChange={e => onChange(e.target.value)}
                onFocus={() => { setFocused(true); setShortcutGlow(true); setTimeout(() => setShortcutGlow(false), 1500); }}
                onBlur={() => setFocused(false)}
                style={{
                    width: "100%", padding: "8px 12px 8px 28px", background: "var(--surface)",
                    border: `1px solid ${focused ? "var(--border-focus)" : "var(--border)"}`,
                    borderRadius: "8px", color: "var(--text-1)", fontSize: "13px", transition: "border-color 0.15s ease, outline 0.15s ease",
                    outline: shortcutGlow ? "2px solid var(--green)" : "none",
                    outlineOffset: shortcutGlow ? "2px" : "0",
                    animation: shortcutGlow ? "glow-pulse 1s ease" : "none",
                }}
            />
        </div>
    );
}

/* ─── Static data ─────────────────────────────────────────── */
const FEATURES = [
    { icon: "🔒", title: "100% Private", desc: "No data ever leaves your browser. Everything runs client-side." },
    { icon: "⚡", title: "Instant Results", desc: "Zero server round-trips. Output appears as you type." },
    { icon: "🎯", title: "Smart Errors", desc: "Plain English error messages with exact position hints." },
    { icon: "🔗", title: "Shareable URLs", desc: "Share your JSON state via URL — no backend needed." },
];
const STATS = [
    { val: "7", label: "Tools" },
    { val: "0ms", label: "Server latency" },
    { val: "0", label: "Data collected" },
    { val: "Free", label: "forever" },
];
const PILLS = ["✓ Zero API calls", "✓ No localStorage", "✓ No cookies", "✓ Open source"];
const FOOTER_LINKS = [
    { label: "GitHub", href: "https://github.com" },
    { label: "Twitter", href: "https://twitter.com" },
    { label: "RSS", href: "/rss" },
];

/* ─── Page ────────────────────────────────────────────────── */
export default function Home() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    const fuse = useMemo(() => new Fuse(TOOLS, { keys: ["name", "desc", "tag"], threshold: 0.35 }), []);
    const filtered = useMemo(() => {
        if (!query.trim()) return TOOLS;
        return fuse.search(query).map(r => r.item);
    }, [query, fuse]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => { searchInputRef.current?.focus(); }, 300);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <div style={{ position: 'relative' }}>
            <div
                aria-hidden={true}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 0,
                    backgroundImage: `radial-gradient(
                      circle,
                      rgba(255, 255, 255, 0.07) 1px,
                      transparent 1px
                    )`,
                    backgroundSize: '28px 28px',
                    pointerEvents: 'none'
                }}
            />
            <Nav />

            {/* ── Background grid ── */}
            <div aria-hidden style={{
                position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
                backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                backgroundSize: "56px 56px", opacity: 0.25,
                WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 80%)",
                maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 80%)",
            }} />
            {/* Green glow */}
            <div aria-hidden style={{
                position: "fixed", top: "-200px", left: "50%", transform: "translateX(-50%)",
                width: "600px", height: "600px", borderRadius: "50%", background: "rgba(34,197,94,0.06)",
                zIndex: 0, pointerEvents: "none",
            }} />

            {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════ */}
            <section style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", minHeight: "100vh", padding: "80px 32px 32px", maxWidth: "1200px", margin: "0 auto", gap: "64px", flexWrap: "wrap" }}>
                {/* Left */}
                <div style={{ flex: "1 1 420px", display: "flex", flexDirection: "column", gap: "28px" }}>
                    {/* H1 */}
                    <h1 className="fu-2" style={{ fontSize: "clamp(32px, 5.5vw, 72px)", fontWeight: 600, letterSpacing: "-2.5px", lineHeight: 1.05, color: "var(--text-1)" }}>
                        JSON tools that<br />
                        <span style={{ position: "relative", color: "var(--green)", display: "inline-block" }}>
                            actually explain
                            <svg style={{ position: "absolute", bottom: "-4px", left: 0, width: "100%", height: "8px" }} viewBox="0 0 200 8" preserveAspectRatio="none">
                                <path d="M0,5 Q25,1 50,5 Q75,9 100,5 Q125,1 150,5 Q175,9 200,5" stroke="var(--green)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
                            </svg>
                        </span><br />
                        themselves
                    </h1>

                    {/* Subtext */}
                    <p className="fu-3" style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.75, fontWeight: 300, maxWidth: "440px" }}>
                        Seven precision tools for JSON formatting, validation, diffing, and more.
                        All computation stays <em>in your browser</em> — no server, no tracking, no friction.
                    </p>

                    {/* CTAs */}
                    <div className="fu-4" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <PrimaryBtn onClick={() => document.getElementById("tools-section")?.scrollIntoView({ behavior: "smooth" })}>
                            Explore tools ↓
                        </PrimaryBtn>
                        <SecondaryBtn href="https://github.com/subham007ai/jsonix">⑂ View on GitHub</SecondaryBtn>
                    </div>

                    {/* Stats */}
                    <div className="fu-5" style={{ display: "flex", gap: "28px", borderTop: "1px solid var(--border)", paddingTop: "20px", flexWrap: "wrap" }}>
                        {STATS.map(s => (
                            <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span style={{ fontFamily: "var(--mono)", fontWeight: 600, fontSize: "16px", color: "var(--text-1)" }}>{s.val}</span>
                                <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right */}
                <div style={{ flex: "1 1 340px", display: "flex", justifyContent: "center" }}>
                    <HeroPreview />
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
          SECTION 2 — FEATURE STRIP
      ══════════════════════════════════════════════════════ */}
            <section style={{ width: "100%", background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
                <div className="feature-strip-grid" style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
                    {FEATURES.map((f, i) => (
                        <div key={f.title} style={{ padding: "28px 24px", borderRight: i < 3 ? "1px solid var(--border)" : "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "20px" }}>{f.icon}</span>
                            <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-1)" }}>{f.title}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: 1.6 }}>{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
          SECTION 3 — HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
            <section id="how-it-works" style={{
                width: "100%", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
                background: "var(--bg)", padding: "72px 32px", position: "relative", zIndex: 1,
            }}>
                <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                    {/* Section header */}
                    <div style={{ marginBottom: "48px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "3px", height: "16px", background: "var(--green)", borderRadius: "2px" }} />
                            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)", letterSpacing: "0.08em" }}>HOW IT WORKS</span>
                        </div>
                        <h2 style={{ fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 600, color: "var(--text-1)" }}>Simple by design</h2>
                    </div>
                    {/* Steps */}
                    <div className="hiw-steps">
                        {[
                            { num: "01", title: "Paste your JSON", desc: "Drop any JSON — raw, minified, broken, or massive. No size limits, no account needed.", delay: "0.05s" },
                            { num: "02", title: "Pick your tool", desc: "Format, validate, diff, convert, query. Seven tools built for the problems developers actually have.", delay: "0.12s" },
                            { num: "03", title: "Copy and ship", desc: "Instant output, shareable URL, zero data leaving your browser. Done in seconds.", delay: "0.19s" },
                        ].map((step, i, arr) => (
                            <div key={step.num} className="hiw-step" style={{
                                flex: "1 1 280px", padding: "32px",
                                borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                                animation: `fadeUp 0.5s ease ${step.delay} both`,
                            }}>
                                <span style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--green)", letterSpacing: "0.12em", marginBottom: "16px", display: "block" }}>{step.num}</span>
                                <div style={{ fontSize: "18px", fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--text-1)", marginBottom: "10px" }}>{step.title}</div>
                                <div style={{ fontSize: "14px", color: "var(--text-3)", lineHeight: 1.7, fontWeight: 300 }}>{step.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
          SECTION 4 — TOOLS
      ══════════════════════════════════════════════════════ */}
            <section id="tools-section" style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 32px", position: "relative", zIndex: 1 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "40px", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "3px", height: "16px", background: "var(--green)", borderRadius: "2px" }} />
                            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)", letterSpacing: "0.08em" }}>TOOLKIT</span>
                        </div>
                        <h2 style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-0.5px", color: "var(--text-1)" }}>Every JSON tool you need</h2>
                    </div>
                    <SearchInput value={query} onChange={setQuery} inputRef={searchInputRef} />
                </div>

                {/* Grid */}
                {filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "var(--mono)", fontSize: "13px", color: "var(--text-3)" }}>
                        No tools match &ldquo;{query}&rdquo;
                    </div>
                ) : (
                    <div className="tools-grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "10px" }}>
                        {filtered.map((tool, i) => (
                            <ToolCard key={tool.id} tool={tool} index={i} onClick={() => router.push(tool.route)} />
                        ))}
                    </div>
                )}
            </section>

            <ProNotifySection />

            {/* ══════════════════════════════════════════════════════
          SECTION 4 — PRIVACY
      ══════════════════════════════════════════════════════ */}
            <section style={{ borderTop: "1px solid var(--border)", background: "var(--surface)", padding: "80px 32px", position: "relative", zIndex: 1 }}>
                <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
                    <div style={{ padding: "6px 14px", background: "var(--green-dim)", border: "1px solid var(--green-border)", borderRadius: "20px", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--green)", letterSpacing: "0.08em", animation: "borderGlow 3s ease infinite" }}>
                        🔒 PRIVACY BY DESIGN
                    </div>
                    <h2 style={{ fontSize: "28px", fontWeight: 600, color: "var(--text-1)", letterSpacing: "-0.5px" }}>Your data never leaves your browser</h2>
                    <p style={{ fontSize: "15px", color: "var(--text-2)", lineHeight: 1.75, fontWeight: 300 }}>
                        Every computation happens locally. We don&apos;t have a backend to send data to.
                        No cookies, no analytics, no fingerprinting. The source is open and auditable.
                    </p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                        {PILLS.map(p => (
                            <span key={p} style={{ padding: "6px 14px", background: "var(--surface-el)", border: "1px solid var(--border)", borderRadius: "20px", fontFamily: "var(--mono)", fontSize: "12px", color: "var(--green)" }}>{p}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
          SECTION 5 — FOOTER
      ══════════════════════════════════════════════════════ */}
            <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1, gap: "16px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "13px", fontWeight: 500 }}>json<span style={{ color: "var(--green)" }}>ix</span></span>
                        <span style={{ color: "var(--text-3)", fontSize: "12px" }}>MIT License</span>
                    </div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)", marginTop: "4px" }}>
                        © {new Date().getFullYear()} JSONix — Built for developers who care about their data.
                    </span>
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-3)" }}>no data leaves your machine</span>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <FooterLink href="https://github.com/subham007ai/jsonix">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-label="GitHub">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                    </FooterLink>
                    <FooterLink href="https://twitter.com">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-label="Twitter">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </FooterLink>
                    <FooterLink href="https://linkedin.com">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-label="LinkedIn">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                    </FooterLink>
                </div>
            </footer>
        </div>
    );
}

import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./Login";
import Members from "./Members";
import Projects from "./Projects";

const TABS = [
  { key: "projects", label: "프로젝트 관리" },
  { key: "members", label: "회원 관리" },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("projects");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a4d5e", fontFamily: "'Noto Sans KR', sans-serif" }}>
      로딩 중...
    </div>
  );

  if (!session) return <Login />;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", fontFamily: "'Noto Sans KR', sans-serif", color: "#e8eaf0" }}>
      {/* Header */}
      <div style={{ background: "#11141c", borderBottom: "1px solid #1e2130", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg,#7c5cfc,#4a9eff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            메뉴잇 Super Admin
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ background: "none", border: "none", padding: "0 14px", height: 56, color: tab === t.key ? "#7c5cfc" : "#4a4d5e", fontSize: 14, fontWeight: tab === t.key ? 700 : 400, borderBottom: tab === t.key ? "2px solid #7c5cfc" : "2px solid transparent", cursor: "pointer", fontFamily: "inherit" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => supabase.auth.signOut()}
          style={{ background: "transparent", border: "1px solid #1e2130", color: "#4a4d5e", borderRadius: 7, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>
          로그아웃
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "projects" && <Projects />}
        {tab === "members" && <Members />}
      </div>
    </div>
  );
}

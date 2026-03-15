import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./Login";
import Projects from "./Projects";
import Dashboard from "./Dashboard";

const TABS = [
  { key: "dashboard", label: "대시보드" },
  { key: "projects", label: "ERP" },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [showPwModal, setShowPwModal] = useState(false);
  const [pw, setPw] = useState({ new: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  async function changePassword() {
    if (pw.new.length < 6) { setPwMsg("비밀번호는 6자 이상이어야 합니다."); return; }
    if (pw.new !== pw.confirm) { setPwMsg("비밀번호가 일치하지 않습니다."); return; }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw.new });
    if (error) { setPwMsg(error.message); }
    else { setPwMsg("✓ 비밀번호가 변경됐습니다."); setPw({ new: "", confirm: "" }); setTimeout(() => setShowPwModal(false), 1200); }
    setPwSaving(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a4d5e", fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" }}>
      로딩 중...
    </div>
  );

  if (!session) return <Login />;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif", color: "#e8eaf0" }}>
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
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setShowPwModal(true); setPwMsg(""); }}
            style={{ background: "transparent", border: "1px solid #1e2130", color: "#8890a4", borderRadius: 7, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>
            비밀번호 변경
          </button>
          <button onClick={() => supabase.auth.signOut()}
            style={{ background: "transparent", border: "1px solid #1e2130", color: "#4a4d5e", borderRadius: 7, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>
            로그아웃
          </button>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {showPwModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setShowPwModal(false)}>
          <div style={{ background: "#11141c", border: "1px solid #1e2130", borderRadius: 14, padding: "32px 28px", width: 340, boxSizing: "border-box" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#e8eaf0", marginBottom: 20 }}>비밀번호 변경</div>
            {pwMsg && (
              <div style={{ background: pwMsg.startsWith("✓") ? "rgba(0,200,100,0.1)" : "rgba(255,80,80,0.1)", border: `1px solid ${pwMsg.startsWith("✓") ? "rgba(0,200,100,0.3)" : "rgba(255,80,80,0.3)"}`, color: pwMsg.startsWith("✓") ? "#00c864" : "#ff5050", borderRadius: 8, padding: "9px 12px", fontSize: 13, marginBottom: 14 }}>
                {pwMsg}
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#8890a4", marginBottom: 6 }}>새 비밀번호</div>
              <input type="password" value={pw.new} onChange={e => setPw(p => ({ ...p, new: e.target.value }))} placeholder="6자 이상"
                style={{ width: "100%", boxSizing: "border-box", background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 8, padding: "10px 12px", color: "#e8eaf0", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#8890a4", marginBottom: 6 }}>비밀번호 확인</div>
              <input type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} placeholder="동일하게 입력"
                style={{ width: "100%", boxSizing: "border-box", background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 8, padding: "10px 12px", color: "#e8eaf0", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowPwModal(false)} style={{ background: "transparent", border: "1px solid #1e2130", color: "#4a4d5e", borderRadius: 7, padding: "9px 16px", fontSize: 13, cursor: "pointer" }}>취소</button>
              <button onClick={changePassword} disabled={pwSaving}
                style={{ background: "linear-gradient(135deg,#7c5cfc,#4a9eff)", border: "none", borderRadius: 7, padding: "9px 20px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {pwSaving ? "변경 중..." : "변경"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "dashboard" && <Dashboard />}
        {tab === "projects" && <Projects />}
      </div>
    </div>
  );
}

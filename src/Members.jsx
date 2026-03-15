import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "member" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: m }, { data: p }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("projects").select("*").order("name"),
    ]);
    setMembers(m || []);
    setProjects(p || []);
    setLoading(false);
  }

  async function invite() {
    if (!form.email.trim()) return;
    setSaving(true);
    setError("");
    const { error } = await supabase.auth.admin.inviteUserByEmail(form.email.trim());
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    setForm({ email: "", name: "", role: "member" });
    setShowInvite(false);
    setSaving(false);
    load();
  }

  async function changeRole(id, role) {
    await supabase.from("profiles").update({ role }).eq("id", id);
    load();
  }

  async function removeMember(id) {
    if (!confirm("이 회원을 삭제하시겠습니까?")) return;
    await supabase.auth.admin.deleteUser(id);
    load();
  }

  const roleLabel = { super_admin: "총관리자", admin: "관리자", member: "멤버" };
  const roleColor = { super_admin: "#7c5cfc", admin: "#4a9eff", member: "#8890a4" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#e8eaf0" }}>회원 관리</div>
          <div style={{ fontSize: 13, color: "#4a4d5e", marginTop: 4 }}>총 {members.length}명</div>
        </div>
        <button onClick={() => setShowInvite(v => !v)}
          style={{ background: showInvite ? "#2a2d3a" : "linear-gradient(135deg,#7c5cfc,#4a9eff)", border: "none", borderRadius: 8, padding: "9px 18px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {showInvite ? "취소" : "+ 이메일 초대"}
        </button>
      </div>

      {showInvite && (
        <div style={{ background: "#11141c", border: "1px solid #1e2130", borderRadius: 10, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#8890a4", marginBottom: 14 }}>이메일 초대</div>
          {error && <div style={{ color: "#ff5050", fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="이메일 주소" type="email"
              style={{ background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 7, padding: "9px 12px", color: "#e8eaf0", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="이름 (선택)"
              style={{ background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 7, padding: "9px 12px", color: "#e8eaf0", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              style={{ background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 7, padding: "9px 12px", color: "#e8eaf0", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
              <option value="member">멤버</option>
              <option value="admin">관리자</option>
              <option value="super_admin">총관리자</option>
            </select>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={invite} disabled={saving || !form.email.trim()}
              style={{ background: form.email.trim() ? "linear-gradient(135deg,#7c5cfc,#4a9eff)" : "#2a2d3a", border: "none", borderRadius: 7, padding: "9px 20px", color: form.email.trim() ? "#fff" : "#4a4d5e", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {saving ? "초대 중..." : "초대 발송"}
            </button>
          </div>
        </div>
      )}

      <div style={{ background: "#11141c", border: "1px solid #1e2130", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr auto", padding: "12px 16px", borderBottom: "1px solid #1e2130", fontSize: 12, color: "#4a4d5e", fontWeight: 700 }}>
          <div>이메일</div><div>이름</div><div>권한</div><div>프로젝트 담당</div><div></div>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "#4a4d5e", fontSize: 13 }}>불러오는 중...</div>
        ) : members.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#4a4d5e", fontSize: 13 }}>회원이 없습니다</div>
        ) : members.map(m => {
          const myProjects = projects.filter(p =>
            p.members?.some?.(pm => pm.id === m.id) || false
          );
          return (
            <div key={m.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr auto", padding: "14px 16px", borderBottom: "1px solid #1e2130", alignItems: "center", fontSize: 13 }}>
              <div style={{ color: "#e8eaf0" }}>{m.email}</div>
              <div style={{ color: "#8890a4" }}>{m.name || "—"}</div>
              <div>
                <select value={m.role || "member"} onChange={e => changeRole(m.id, e.target.value)}
                  style={{ background: "transparent", border: `1px solid ${roleColor[m.role] || "#4a4d5e"}`, borderRadius: 5, padding: "4px 8px", color: roleColor[m.role] || "#4a4d5e", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  <option value="member">멤버</option>
                  <option value="admin">관리자</option>
                  <option value="super_admin">총관리자</option>
                </select>
              </div>
              <div style={{ color: "#4a4d5e", fontSize: 12 }}>—</div>
              <button onClick={() => removeMember(m.id)}
                style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff5050", borderRadius: 5, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                삭제
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

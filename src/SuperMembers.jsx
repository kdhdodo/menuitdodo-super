import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const roleColor = { admin: "#7c5cfc", admin_user: "#4a9eff", user: "#4a9eff", external: "#10b981", agency_admin: "#f59e0b", agency_user: "#fb923c", store_admin: "#10b981" };

export default function SuperMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "admin" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setMembers(data || []);
    setLoading(false);
  }

  async function invite() {
    if (!form.email.trim()) return;
    setSaving(true); setError("");
    const { error: err } = await supabase.auth.admin.inviteUserByEmail(form.email.trim());
    if (err) { setError(err.message); setSaving(false); return; }
    setForm({ email: "", name: "", role: "admin" });
    setShowInvite(false); setSaving(false);
    setTimeout(load, 1000);
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

  const filtered = members.filter(m => !search || m.email?.includes(search) || m.name?.includes(search));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#8890a4" }}>
          회원 목록 <span style={{ fontWeight: 400, color: "#4a4d5e" }}>총 {members.length}명</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검색"
            style={{ background: "#11141c", border: "1px solid #1e2130", borderRadius: 6, padding: "6px 10px", color: "#e8eaf0", fontSize: 12, outline: "none", fontFamily: "inherit", width: 140 }} />
          <button onClick={() => { setShowInvite(v => !v); setError(""); }}
            style={{ background: showInvite ? "#2a2d3a" : "linear-gradient(135deg,#7c5cfc,#4a9eff)", border: "none", borderRadius: 6, padding: "6px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {showInvite ? "취소" : "+ 초대"}
          </button>
        </div>
      </div>

      {showInvite && (
        <div style={{ background: "#11141c", border: "1px solid #1e2130", borderRadius: 8, padding: "14px 16px", marginBottom: 12 }}>
          {error && <div style={{ color: "#ff5050", fontSize: 12, marginBottom: 8 }}>{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 8 }}>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="이메일"
              style={{ background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 6, padding: "7px 10px", color: "#e8eaf0", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="이름"
              style={{ background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 6, padding: "7px 10px", color: "#e8eaf0", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              style={{ background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 6, padding: "7px 10px", color: "#e8eaf0", fontSize: 12, outline: "none", fontFamily: "inherit" }}>
              <option value="admin">관리자</option>
              <option value="admin_user">운영자</option>
              <option value="user">사용자</option>
              <option value="external">외부팀</option>
            </select>
            <button onClick={invite} disabled={saving || !form.email.trim()}
              style={{ background: form.email.trim() ? "linear-gradient(135deg,#7c5cfc,#4a9eff)" : "#2a2d3a", border: "none", borderRadius: 6, padding: "7px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {saving ? "..." : "초대"}
            </button>
          </div>
        </div>
      )}

      <div style={{ background: "#11141c", border: "1px solid #1e2130", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", padding: "8px 14px", borderBottom: "1px solid #1e2130", fontSize: 11, color: "#4a4d5e", fontWeight: 700 }}>
          <div>이메일</div><div>이름</div><div>권한</div><div></div>
        </div>
        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "#4a4d5e", fontSize: 12 }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#4a4d5e", fontSize: 12 }}>회원이 없습니다</div>
        ) : filtered.map(m => (
          <div key={m.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", padding: "10px 14px", borderBottom: "1px solid #1e2130", alignItems: "center", fontSize: 12 }}>
            <div style={{ color: "#e8eaf0" }}>{m.email}</div>
            <div style={{ color: "#8890a4" }}>{m.name || "—"}</div>
            <div>
              <select value={m.role || "admin"} onChange={e => changeRole(m.id, e.target.value)}
                style={{ background: "transparent", border: `1px solid ${roleColor[m.role] || "#4a4d5e"}`, borderRadius: 4, padding: "2px 7px", color: roleColor[m.role] || "#4a4d5e", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                <option value="admin">관리자</option>
                <option value="admin_user">운영자</option>
                <option value="user">사용자</option>
                <option value="external">외부팀</option>
              </select>
            </div>
            <button onClick={() => removeMember(m.id)}
              style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff5050", borderRadius: 4, padding: "2px 8px", fontSize: 11, cursor: "pointer" }}>
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

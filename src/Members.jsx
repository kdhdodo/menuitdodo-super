import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const BYTES = [
  { key: "ip",    name: "특허",     color: "#7c5cfc" },
  { key: "fi",    name: "파이낸스", color: "#4a9eff" },
  { key: "fn",    name: "마케팅",   color: "#f59e0b" },
  { key: "scm",   name: "공급망",   color: "#10b981" },
  { key: "sales", name: "영업",     color: "#ff5050" },
];

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "member" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [byteMap, setByteMap] = useState({}); // { userId: Set<byteKey> }

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: m }, { data: bm }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("byte_members").select("*"),
    ]);
    setMembers(m || []);
    const map = {};
    for (const row of (bm || [])) {
      if (!map[row.user_id]) map[row.user_id] = new Set();
      map[row.user_id].add(row.byte_key);
    }
    setByteMap(map);
    setLoading(false);
  }

  async function toggleByte(userId, byteKey, currentlyOn) {
    if (currentlyOn) {
      await supabase.from("byte_members").delete().eq("user_id", userId).eq("byte_key", byteKey);
    } else {
      await supabase.from("byte_members").insert({ user_id: userId, byte_key: byteKey });
    }
    setByteMap(prev => {
      const next = { ...prev, [userId]: new Set(prev[userId] || []) };
      currentlyOn ? next[userId].delete(byteKey) : next[userId].add(byteKey);
      return next;
    });
  }

  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqbnNid3NndXFpcnNraW11a3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1Njg3MzEsImV4cCI6MjA4OTE0NDczMX0.PkHZQsAUVzOj6c6NaEgvyfPcF6e1m7JbnNTta7ZaNjQ";

  async function invite() {
    if (!form.email.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("https://djnsbwsguqirskimukxh.supabase.co/functions/v1/invite-user", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": ANON_KEY, "Authorization": `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ action: "invite", email: form.email.trim(), name: form.name.trim() || undefined, role: form.role }),
    });
    const json = await res.json();
    if (json.error) { setError(json.error); setSaving(false); return; }
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
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 3fr auto", padding: "12px 16px", borderBottom: "1px solid #1e2130", fontSize: 12, color: "#4a4d5e", fontWeight: 700 }}>
          <div>이메일</div><div>이름</div><div>권한</div><div>바이트</div><div></div>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "#4a4d5e", fontSize: 13 }}>불러오는 중...</div>
        ) : members.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#4a4d5e", fontSize: 13 }}>회원이 없습니다</div>
        ) : members.map(m => {
          const memberBytes = byteMap[m.id] || new Set();
          return (
            <div key={m.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 3fr auto", padding: "14px 16px", borderBottom: "1px solid #1e2130", alignItems: "center", fontSize: 13 }}>
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
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {BYTES.map(b => {
                  const on = memberBytes.has(b.key);
                  return (
                    <button key={b.key} onClick={() => toggleByte(m.id, b.key, on)}
                      style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 5, cursor: "pointer", border: `1px solid ${on ? b.color : "#1e2130"}`, background: on ? b.color + "22" : "transparent", color: on ? b.color : "#4a4d5e" }}>
                      {b.name}
                    </button>
                  );
                })}
              </div>
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

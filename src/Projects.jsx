import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", url: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [assignEmail, setAssignEmail] = useState({});
  const [assignRole, setAssignRole] = useState({});
  const [projectMembers, setProjectMembers] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: p }, { data: m }, { data: pm }] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("email"),
      supabase.from("project_members").select("*"),
    ]);
    setProjects(p || []);
    setMembers(m || []);
    setProjectMembers(pm || []);
    setLoading(false);
  }

  async function saveProject() {
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);
    await supabase.from("projects").insert({
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      url: form.url.trim() || null,
      description: form.description.trim() || null,
    });
    setForm({ name: "", slug: "", url: "", description: "" });
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function deleteProject(id) {
    if (!confirm("프로젝트를 삭제하시겠습니까?")) return;
    await supabase.from("projects").delete().eq("id", id);
    load();
  }

  async function assignMember(projectId) {
    const email = assignEmail[projectId]?.trim();
    if (!email) return;
    await supabase.from("project_members").insert({
      project_id: projectId,
      email,
      role: assignRole[projectId] || "admin",
    });
    setAssignEmail(v => ({ ...v, [projectId]: "" }));
    load();
  }

  async function removePM(id) {
    await supabase.from("project_members").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#e8eaf0" }}>프로젝트 관리</div>
          <div style={{ fontSize: 13, color: "#4a4d5e", marginTop: 4 }}>총 {projects.length}개</div>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          style={{ background: showForm ? "#2a2d3a" : "linear-gradient(135deg,#7c5cfc,#4a9eff)", border: "none", borderRadius: 8, padding: "9px 18px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {showForm ? "취소" : "+ 프로젝트 추가"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#11141c", border: "1px solid #1e2130", borderRadius: 10, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#8890a4", marginBottom: 14 }}>새 프로젝트</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="프로젝트 이름 (예: 매장 운영)"
              style={{ background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 7, padding: "9px 12px", color: "#e8eaf0", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="슬러그 (예: menuit-admin)"
              style={{ background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 7, padding: "9px 12px", color: "#e8eaf0", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="URL (예: https://menuit-admin.vercel.app)"
              style={{ background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 7, padding: "9px 12px", color: "#e8eaf0", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="설명 (선택)"
              style={{ background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 7, padding: "9px 12px", color: "#e8eaf0", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={saveProject} disabled={saving || !form.name.trim() || !form.slug.trim()}
              style={{ background: form.name.trim() && form.slug.trim() ? "linear-gradient(135deg,#7c5cfc,#4a9eff)" : "#2a2d3a", border: "none", borderRadius: 7, padding: "9px 20px", color: form.name.trim() ? "#fff" : "#4a4d5e", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", color: "#4a4d5e", fontSize: 13, padding: 40 }}>불러오는 중...</div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: "center", color: "#4a4d5e", fontSize: 13, padding: 40 }}>등록된 프로젝트가 없습니다</div>
      ) : projects.map(p => {
        const pms = projectMembers.filter(pm => pm.project_id === p.id);
        const isOpen = expandedId === p.id;
        return (
          <div key={p.id} style={{ background: "#11141c", border: "1px solid #1e2130", borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer" }} onClick={() => setExpandedId(isOpen ? null : p.id)}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#4a4d5e", marginTop: 3 }}>
                  {p.url ? <a href={p.url} target="_blank" rel="noreferrer" style={{ color: "#4a9eff", textDecoration: "none" }} onClick={e => e.stopPropagation()}>{p.url}</a> : "URL 미등록"}
                  {p.description && <span style={{ marginLeft: 10 }}>{p.description}</span>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ background: "rgba(124,92,252,0.15)", color: "#7c5cfc", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>담당 {pms.length}명</span>
                <span style={{ color: "#4a4d5e", fontSize: 18 }}>{isOpen ? "▲" : "▼"}</span>
              </div>
            </div>

            {isOpen && (
              <div style={{ borderTop: "1px solid #1e2130", padding: "16px 20px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#8890a4", marginBottom: 12 }}>담당자 목록</div>
                {pms.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#4a4d5e", marginBottom: 12 }}>담당자가 없습니다</div>
                ) : pms.map(pm => (
                  <div key={pm.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e2130" }}>
                    <div>
                      <span style={{ color: "#e8eaf0", fontSize: 13 }}>{pm.email}</span>
                      <span style={{ marginLeft: 10, background: "rgba(74,158,255,0.15)", color: "#4a9eff", borderRadius: 4, padding: "2px 8px", fontSize: 11 }}>{pm.role}</span>
                    </div>
                    <button onClick={() => removePM(pm.id)}
                      style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff5050", borderRadius: 5, padding: "3px 10px", fontSize: 12, cursor: "pointer" }}>
                      제거
                    </button>
                  </div>
                ))}

                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <input value={assignEmail[p.id] || ""} onChange={e => setAssignEmail(v => ({ ...v, [p.id]: e.target.value }))}
                    placeholder="이메일로 담당자 추가"
                    style={{ flex: 1, background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 7, padding: "8px 12px", color: "#e8eaf0", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
                  <select value={assignRole[p.id] || "admin"} onChange={e => setAssignRole(v => ({ ...v, [p.id]: e.target.value }))}
                    style={{ background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 7, padding: "8px 12px", color: "#e8eaf0", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
                    <option value="admin">관리자</option>
                    <option value="viewer">뷰어</option>
                  </select>
                  <button onClick={() => assignMember(p.id)}
                    style={{ background: "linear-gradient(135deg,#7c5cfc,#4a9eff)", border: "none", borderRadius: 7, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    추가
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                  <button onClick={() => deleteProject(p.id)}
                    style={{ background: "transparent", border: "1px solid rgba(255,80,80,0.3)", color: "#ff5050", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
                    프로젝트 삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, members: 0, projectMembers: 0 });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: p }, { data: m }, { data: pm }] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id"),
      supabase.from("project_members").select("*"),
    ]);
    setProjects(p || []);
    setStats({ projects: (p || []).length, members: (m || []).length, projectMembers: (pm || []).length });
    setLoading(false);
  }

  const cards = [
    { label: "등록된 프로젝트", value: stats.projects, color: "#7c5cfc" },
    { label: "전체 회원", value: stats.members, color: "#4a9eff" },
    { label: "프로젝트 담당자", value: stats.projectMembers, color: "#00c864" },
  ];

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#e8eaf0", marginBottom: 24 }}>대시보드</div>

      {/* 통계 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: "#11141c", border: `1px solid ${c.color}30`, borderRadius: 12, padding: "24px 20px" }}>
            <div style={{ fontSize: 13, color: "#8890a4", marginBottom: 10 }}>{c.label}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: c.color }}>{loading ? "—" : c.value}</div>
          </div>
        ))}
      </div>

      {/* 프로젝트 목록 */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "#8890a4", marginBottom: 12 }}>프로젝트 현황</div>
      <div style={{ display: "grid", gap: 10 }}>
        {loading ? (
          <div style={{ color: "#4a4d5e", fontSize: 13 }}>불러오는 중...</div>
        ) : projects.map(p => (
          <div key={p.id} style={{ background: "#11141c", border: "1px solid #1e2130", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0" }}>{p.name}</div>
              {p.url && <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#4a9eff", textDecoration: "none" }}>{p.url}</a>}
            </div>
            <div style={{ background: "rgba(124,92,252,0.15)", color: "#7c5cfc", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>운영 중</div>
          </div>
        ))}
      </div>
    </div>
  );
}

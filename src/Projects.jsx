import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import AuMembers from "./AuMembers";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: p } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(p || []);
    setLoading(false);
  }

  // slug 기준으로 어떤 회원 컴포넌트를 쓸지 결정 (나중에 확장)
  function renderMembers(project) {
    if (project.slug === "menuit-admin") return <AuMembers />;
    return <div style={{ color: "#4a4d5e", fontSize: 13, padding: "16px 0" }}>연결된 회원 DB가 없습니다</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "#4a4d5e" }}>총 {projects.length}개</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#4a4d5e", fontSize: 13, padding: 40 }}>불러오는 중...</div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: "center", color: "#4a4d5e", fontSize: 13, padding: 40 }}>등록된 프로젝트가 없습니다</div>
      ) : projects.map(p => {
        const isOpen = expandedId === p.id;
        return (
          <div key={p.id} style={{ background: "#11141c", border: "1px solid #1e2130", borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: p.slug === "menuit-admin" ? "pointer" : "default" }} onClick={() => p.slug === "menuit-admin" && setExpandedId(isOpen ? null : p.id)}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0" }}>{p.slug === "menuit-admin" ? "호주 매장운영" : p.name}</div>
                <div style={{ fontSize: 12, color: "#4a4d5e", marginTop: 3 }}>
                  {p.url ? <a href={p.url} target="_blank" rel="noreferrer" style={{ color: "#4a9eff", textDecoration: "none" }} onClick={e => e.stopPropagation()}>{p.url}</a> : "URL 미등록"}
                  {p.description && <span style={{ marginLeft: 10 }}>{p.description}</span>}
                </div>
              </div>
              {p.slug === "menuit-admin"
                ? <span style={{ color: "#4a4d5e", fontSize: 18 }}>{isOpen ? "▲" : "▼"}</span>
                : <span style={{ background: "rgba(139,139,139,0.15)", color: "#8890a4", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>준비중</span>
              }
            </div>

            {isOpen && (
              <div style={{ borderTop: "1px solid #1e2130", padding: "16px 20px" }}>
                {renderMembers(p)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

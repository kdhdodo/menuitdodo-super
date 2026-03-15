import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import AuMembers from "./AuMembers";
import SuperMembers from "./SuperMembers";

const PROJECT_CONFIG = {
  "menuit-admin":  { officialDomain: "au.menuit.io",    tempDomain: "menuitdodo-admin.vercel.app",  dnsName: "au",    active: true },
  "menuit-ip":     { officialDomain: "ip.menuit.io",    tempDomain: "menuitdodo-ip.vercel.app",     dnsName: "ip" },
  "menuit-fi":     { officialDomain: "fi.menuit.io",    tempDomain: "menuitdodo-fi.vercel.app",     dnsName: "fi" },
  "menuit-scm":    { officialDomain: "scm.menuit.io",   tempDomain: "menuitdodo-scm.vercel.app",    dnsName: "scm" },
  "menuit-sales":  { officialDomain: "sales.menuit.io", tempDomain: "menuitdodo-sales.vercel.app",  dnsName: "sales" },
  "menuit-fn":     { officialDomain: "fn.menuit.io",    tempDomain: "menuitdodo-fn.vercel.app",     dnsName: "fn" },
};

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

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "#4a4d5e" }}>총 {projects.length}개</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#4a4d5e", fontSize: 13, padding: 40 }}>불러오는 중...</div>
      ) : projects.map(p => {
        const cfg = PROJECT_CONFIG[p.slug] || {};
        const isOpen = expandedId === p.id;

        return (
          <div key={p.id} style={{ background: "#11141c", border: "1px solid #1e2130", borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
            {/* 헤더 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer" }}
              onClick={() => setExpandedId(isOpen ? null : p.id)}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0" }}>
                  {p.slug === "menuit-admin" ? "호주 매장운영" : p.name}
                </div>
                <div style={{ fontSize: 12, color: "#4a4d5e", marginTop: 3 }}>
                  {cfg.officialDomain && <span style={{ color: "#7c5cfc", marginRight: 10 }}>{cfg.officialDomain}</span>}
                  {p.description}
                </div>
              </div>
              <span style={{ color: "#4a4d5e", fontSize: 18 }}>{isOpen ? "▲" : "▼"}</span>
            </div>

            {/* 펼침 패널 */}
            {isOpen && (
              <div style={{ borderTop: "1px solid #1e2130", padding: "18px 20px" }}>

                {/* 도메인 정보 */}
                <div style={{ background: "#0d0f14", border: "1px solid #1e2130", borderRadius: 8, padding: "14px 16px", marginBottom: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#4a4d5e", fontWeight: 700, marginBottom: 6 }}>정식 도메인</div>
                      <div style={{ fontSize: 13, color: "#7c5cfc", fontWeight: 600 }}>{cfg.officialDomain || "—"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#4a4d5e", fontWeight: 700, marginBottom: 6 }}>임시 도메인</div>
                      <a href={`https://${cfg.tempDomain}`} target="_blank" rel="noreferrer"
                        style={{ fontSize: 13, color: "#4a9eff", textDecoration: "none" }}>{cfg.tempDomain || "—"}</a>
                    </div>
                  </div>
                  {!cfg.active && cfg.dnsName && (
                    <div style={{ marginTop: 14, borderTop: "1px solid #1e2130", paddingTop: 12 }}>
                      <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, marginBottom: 8 }}>⚠ CTO DNS 등록 필요</div>
                      <div style={{ background: "#11141c", borderRadius: 6, padding: "10px 14px", fontFamily: "monospace", fontSize: 12 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "80px 80px 1fr", gap: 16, color: "#4a4d5e", fontSize: 11, marginBottom: 6 }}>
                          <span>타입</span><span>호스트</span><span>값</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "80px 80px 1fr", gap: 16, color: "#e8eaf0" }}>
                          <span style={{ color: "#4a9eff" }}>CNAME</span>
                          <span style={{ color: "#00c864" }}>{cfg.dnsName}</span>
                          <span style={{ color: "#f59e0b" }}>cname.vercel-dns.com</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 회원 관리 */}
                {p.slug === "menuit-admin" ? <AuMembers /> : <SuperMembers />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

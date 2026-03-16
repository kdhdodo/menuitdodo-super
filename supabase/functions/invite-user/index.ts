import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { action, email, role, userId, redirectTo } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── 초대 ──────────────────────────────────────────────────────
    if (action === "invite" || !action) {
      if (!email) throw new Error("이메일이 필요합니다");

      const { data, error } = await supabase.auth.admin.generateLink({
        type: "invite",
        email,
        options: { redirectTo: redirectTo || "https://a-ip.menuit.io" },
      });
      if (error) throw error;

      const inviteUrl = data.properties.action_link;

      // profiles 저장
      if (data?.user?.id) {
        await supabase.from("profiles").upsert({
          id:    data.user.id,
          email: email,
          role:  role || "user",
        }, { onConflict: "id" });
      }

      // Resend 이메일 발송
      const resendKey  = Deno.env.get("RESEND_API_KEY");
      const fromEmail  = Deno.env.get("RESEND_FROM") || "MenuIt <no-reply@aumail.menuit.io>";
      if (resendKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: fromEmail,
            to: [email],
            subject: "[MenuIt IP] 초대 안내",
            html: `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Apple SD Gothic Neo',sans-serif">
  <div style="max-width:480px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#1a1d26,#2a2d3a);padding:28px 32px;text-align:center">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:linear-gradient(135deg,#4a9eff,#7c5cfc);border-radius:10px;font-size:20px;font-weight:700;color:#fff;margin-bottom:10px">M</div>
      <div style="color:#fff;font-size:20px;font-weight:700">메뉴잇 IP 관리</div>
    </div>
    <div style="padding:28px 32px">
      <p style="font-size:15px;color:#222;margin:0 0 8px">안녕하세요!</p>
      <p style="font-size:13px;color:#666;line-height:1.6;margin:0 0 24px">
        메뉴잇 IP 관리 시스템에 초대되었습니다.<br>
        아래 버튼을 클릭하여 계정을 활성화해 주세요.
      </p>
      <a href="${inviteUrl}" style="display:block;background:linear-gradient(135deg,#4a9eff,#7c5cfc);color:#fff;text-align:center;padding:14px 24px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:700;margin-bottom:16px">
        초대 수락하기
      </a>
      <p style="font-size:11px;color:#aaa;text-align:center;margin:0">링크는 24시간 후 만료됩니다</p>
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eee">
      <p style="font-size:11px;color:#aaa;margin:0">MenuIt · 본 이메일은 자동발송입니다</p>
    </div>
  </div>
</body>
</html>`,
          }),
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 삭제 ──────────────────────────────────────────────────────
    if (action === "delete") {
      if (!userId) throw new Error("userId가 필요합니다");
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("알 수 없는 action");
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

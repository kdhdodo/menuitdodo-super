const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ACCESS_KEY = "QEDDAZ91GezYIdxE45uFjMJ3LuBtAA64E/nXXKfvbok=";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = `http://plus.kipris.or.kr/openapi/rest/patUtiModInfoSearchSevice/applicantNameSearchInfo?applicant=%EB%A9%94%EB%89%B4%EC%9E%87&accessKey=${encodeURIComponent(ACCESS_KEY)}&numOfRows=100&pageNo=1`;

    const res = await fetch(url);
    const xml = await res.text();

    // XML 파싱
    const patents: object[] = [];
    const items = xml.match(/<PatentUtilityInfo>([\s\S]*?)<\/PatentUtilityInfo>/g) || [];

    for (const item of items) {
      const get = (tag: string) => {
        const m = item.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`));
        return m ? m[1].trim() : "";
      };
      patents.push({
        inventionName:      get("InventionName"),
        applicationNumber:  get("ApplicationNumber"),
        applicationDate:    get("ApplicationDate"),
        registrationNumber: get("RegistrationNumber"),
        registrationDate:   get("RegistrationDate"),
        registrationStatus: get("RegistrationStatus"),
        openingDate:        get("OpeningDate"),
        abstract:           get("Abstract"),
        applicant:          get("Applicant"),
      });
    }

    const total = xml.match(/<TotalSearchCount>(\d+)<\/TotalSearchCount>/)?.[1] || "0";

    return new Response(
      JSON.stringify({ patents, total: Number(total) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

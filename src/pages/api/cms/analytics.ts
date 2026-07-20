import type { APIRoute } from "astro";
import { createSign } from "node:crypto";

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

const base64url = (value: string | Buffer) => Buffer.from(value).toString("base64url");

function getGoogleAccessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !privateKey) return null;

  const now = Math.floor(Date.now() / 1000);
  const unsignedToken = `${base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64url(JSON.stringify({
    iss: email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const assertion = `${unsignedToken}.${signer.sign(privateKey).toString("base64url")}`;

  return fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  }).then(async (response) => {
    if (!response.ok) throw new Error("Não foi possível autenticar no Google Analytics.");
    return (await response.json()).access_token as string;
  });
}

async function isCMSUser(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.PUBLIC_SUPABASE_URL;
  const key = process.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return false;

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, authorization: `Bearer ${token}` },
  });
  return response.ok;
}

async function getProjectTitles() {
  const url = process.env.PUBLIC_SUPABASE_URL;
  const key = process.env.PUBLIC_SUPABASE_ANON_KEY;
  const titles = new Map<string, string>();
  if (!url || !key) return titles;

  const response = await fetch(`${url}/rest/v1/projects?select=id,slug,title,title_en&published=eq.true`, {
    headers: { apikey: key, authorization: `Bearer ${key}` },
  });
  if (!response.ok) return titles;

  for (const project of await response.json()) {
    const title = project.title || project.title_en || "Projeto sem título";
    for (const identifier of [project.id, project.slug]) {
      if (identifier) titles.set(String(identifier), title);
    }
  }
  return titles;
}

function projectIdentifierFromPath(path: string) {
  const match = path.match(/^\/(?:en\/)?project\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]) : "";
}

export const GET: APIRoute = async ({ request }) => {
  if (!(await isCMSUser(request))) return json({ error: "Não autorizado." }, 401);

  const propertyId = process.env.GA4_PROPERTY_ID;
  const accessTokenRequest = getGoogleAccessToken();
  if (!propertyId || !accessTokenRequest) return json({ configured: false });

  try {
    const accessToken = await accessTokenRequest;
    const api = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}`;
    const call = async (path: string, body: object) => {
      const response = await fetch(`${api}:${path}`, {
        method: "POST",
        headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("O Google Analytics não respondeu a uma das consultas.");
      return response.json();
    };
    const rows = (report: any) => report.rows ?? [];
    const value = (report: any, index = 0) => Number(rows(report)[0]?.metricValues?.[index]?.value ?? 0);

    const projectTitlesRequest = getProjectTitles();
    const [realtime, today, total, audience, scroll, channels, projectViews, clicks] = await Promise.all([
      call("runRealtimeReport", { metrics: [{ name: "activeUsers" }] }),
      call("runReport", { dateRanges: [{ startDate: "today", endDate: "today" }], metrics: [{ name: "totalUsers" }] }),
      call("runReport", { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], metrics: [{ name: "totalUsers" }] }),
      call("runReport", { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], dimensions: [{ name: "newVsReturning" }], metrics: [{ name: "totalUsers" }] }),
      call("runReport", { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "scroll" } } } }),
      call("runReport", { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }], limit: 6, orderBys: [{ metric: { metricName: "sessions" }, desc: true }] }),
      call("runReport", { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }], dimensionFilter: { orGroup: { expressions: [{ filter: { fieldName: "pagePath", stringFilter: { matchType: "BEGINS_WITH", value: "/projeto/" } } }, { filter: { fieldName: "pagePath", stringFilter: { matchType: "BEGINS_WITH", value: "/en/project/" } } }] } }, limit: 100, orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }] }),
      call("runReport", { dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "portfolio_click" } } } }),
    ]);

    const audienceRows = rows(audience);
    const audienceValue = (label: string) => Number(audienceRows.find((row: any) => row.dimensionValues?.[0]?.value === label)?.metricValues?.[0]?.value ?? 0);
    const projectTitles = await projectTitlesRequest;
    const groupedProjectViews = new Map<string, { title: string; views: number }>();
    for (const row of rows(projectViews)) {
      const identifier = projectIdentifierFromPath(row.dimensionValues?.[0]?.value ?? "");
      if (!identifier) continue;
      const project = groupedProjectViews.get(identifier);
      groupedProjectViews.set(identifier, {
        title: projectTitles.get(identifier) ?? "Projeto sem título",
        views: (project?.views ?? 0) + Number(row.metricValues?.[0]?.value ?? 0),
      });
    }
    return json({
      configured: true,
      updatedAt: new Date().toISOString(),
      activeNow: value(realtime),
      visitorsToday: value(today),
      visitors30Days: value(total),
      newUsers: audienceValue("new"),
      returningUsers: audienceValue("returning"),
      scrollEvents: value(scroll),
      clickEvents: value(clicks),
      channels: rows(channels).map((row: any) => ({ name: row.dimensionValues?.[0]?.value ?? "Não definido", value: Number(row.metricValues?.[0]?.value ?? 0) })),
      projects: [...groupedProjectViews.values()].sort((first, second) => second.views - first.views).slice(0, 10),
    });
  } catch (error) {
    return json({ configured: true, error: error instanceof Error ? error.message : "Não foi possível consultar o Google Analytics." }, 502);
  }
};

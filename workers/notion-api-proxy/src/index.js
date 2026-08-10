/**
 * 将请求反代到 Notion 匿名私有接口 https://www.notion.so/api/v3/*
 * 供 next-blog-web 的 notion-client（NOTION_API_BASE_URL）使用。
 *
 * 约定：对外路径保持 /api/v3/<endpoint>
 * 例如 POST /api/v3/loadPageChunk → https://www.notion.so/api/v3/loadPageChunk
 *
 * 重要：不要把来自 Vercel/ofetch 的请求头原样转给 Notion。
 * Notion 前置 Cloudflare，乱传 x-forwarded-* / 异常 UA 容易直接 403。
 */

const NOTION_API_ORIGIN = "https://www.notion.so";
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function buildTargetUrl(requestUrl) {
  const incoming = new URL(requestUrl);
  let path = incoming.pathname;

  if (!path.startsWith("/api/v3")) {
    path = `/api/v3${path.startsWith("/") ? path : `/${path}`}`;
  }

  return `${NOTION_API_ORIGIN}${path}${incoming.search}`;
}

function isCloudflareChallenge(status, contentType, bodyText) {
  if (status !== 403 && status !== 503) return false;
  const ct = (contentType || "").toLowerCase();
  if (ct.includes("text/html")) return true;
  const sample = bodyText.slice(0, 2000).toLowerCase();
  return (
    sample.includes("just a moment") ||
    sample.includes("cf-browser-verification") ||
    sample.includes("attention required") ||
    sample.includes("cloudflare")
  );
}

function buildUpstreamHeaders(request) {
  const headers = new Headers({
    accept: "application/json, text/plain, */*",
    "content-type": request.headers.get("content-type") || "application/json",
    "user-agent": BROWSER_UA,
    // 模拟从 notion 站点发起，降低风控误伤
    origin: NOTION_API_ORIGIN,
    referer: `${NOTION_API_ORIGIN}/`,
  });

  // 仅透传 Notion 相关头（若调用方带了）
  const passThrough = [
    "notion-version",
    "x-notion-active-user-header",
    "x-notion-space-id",
    "cookie",
  ];
  for (const name of passThrough) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  return headers;
}

async function proxyToNotion(request) {
  const target = buildTargetUrl(request.url);
  const method = request.method.toUpperCase();

  /** @type {RequestInit} */
  const init = {
    method,
    headers: buildUpstreamHeaders(request),
    redirect: "follow",
  };

  if (method !== "GET" && method !== "HEAD") {
    // 缓冲 body，避免 stream/duplex 在部分运行时出问题
    init.body = await request.text();
  }

  const upstream = await fetch(target, init);
  const contentType = upstream.headers.get("content-type") || "";
  const bodyText = await upstream.text();

  if (isCloudflareChallenge(upstream.status, contentType, bodyText)) {
    return Response.json(
      {
        ok: false,
        error: "upstream_cloudflare_challenge",
        message:
          "Notion 前置 Cloudflare 拦截了 Worker 出口请求（403 challenge）。请改用非 Cloudflare IP 的反代（如海外 VPS），或改走官方 API 渲染。",
        target,
        upstreamStatus: upstream.status,
        bodyPreview: bodyText.slice(0, 240),
      },
      {
        status: 502,
        headers: {
          "cache-control": "no-store",
          "x-notion-proxy-upstream-status": String(upstream.status),
          "x-notion-proxy-challenge": "1",
        },
      },
    );
  }

  const responseHeaders = new Headers();
  // 只回传对客户端有用的头，避免把 CF 挑战页相关头搅乱缓存
  if (contentType) responseHeaders.set("content-type", contentType);
  responseHeaders.set("access-control-allow-origin", "*");
  responseHeaders.set("cache-control", "no-store");
  responseHeaders.set(
    "x-notion-proxy-upstream-status",
    String(upstream.status),
  );

  return new Response(bodyText, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers":
            "content-type,notion-version,cookie,x-notion-active-user-header",
          "access-control-max-age": "86400",
        },
      });
    }

    const url = new URL(request.url);

    if (
      request.method === "GET" &&
      (url.pathname === "/" || url.pathname === "/health")
    ) {
      return Response.json({
        ok: true,
        service: "notion-api-proxy",
        version: 2,
        target: `${NOTION_API_ORIGIN}/api/v3`,
      });
    }

    // 自检：Worker 内直接打 Notion，便于区分「入口 403」还是「上游 403」
    if (request.method === "GET" && url.pathname === "/selftest") {
      const pageId =
        url.searchParams.get("pageId") ||
        "ce8a73f5-3641-460c-b4ba-5f92596ae14b";
      const target = `${NOTION_API_ORIGIN}/api/v3/loadCachedPageChunk`;
      try {
        const upstream = await fetch(target, {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "user-agent": BROWSER_UA,
            origin: NOTION_API_ORIGIN,
            referer: `${NOTION_API_ORIGIN}/`,
          },
          body: JSON.stringify({
            page: { id: pageId },
            limit: 5,
            cursor: { stack: [] },
            chunkNumber: 0,
            verticalColumns: false,
          }),
        });
        const contentType = upstream.headers.get("content-type") || "";
        const bodyText = await upstream.text();
        const challenge = isCloudflareChallenge(
          upstream.status,
          contentType,
          bodyText,
        );
        return Response.json({
          ok: upstream.ok && !challenge,
          upstreamStatus: upstream.status,
          challenge,
          contentType,
          bodyPreview: bodyText.slice(0, 400),
        });
      } catch (err) {
        return Response.json(
          {
            ok: false,
            error: "selftest_fetch_failed",
            message: err instanceof Error ? err.message : String(err),
          },
          { status: 502 },
        );
      }
    }

    try {
      return await proxyToNotion(request);
    } catch (err) {
      return Response.json(
        {
          ok: false,
          error: "upstream_fetch_failed",
          message: err instanceof Error ? err.message : String(err),
        },
        { status: 502 },
      );
    }
  },
};

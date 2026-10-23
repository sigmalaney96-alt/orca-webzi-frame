// Accepts "example.com" or "https://example.com"; returns a normalized http(s) URL or null.
function normalizeSite(input) {
    if (!input) return null;
    input = input.trim();
    if (!input) return null;
    if (!/^https?:\/\//i.test(input)) {
        if (/^[a-z][a-z0-9+.-]*:/i.test(input) && !/^[^/]+:\d+(\/|$)/.test(input)) return null; // reject javascript:, data:, etc.
        input = "https://" + input;
    }
    try {
        const url = new URL(input);
        if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;
        return url.toString();
    } catch {
        return null;
    }
}

async function loadSite(url) {
    // Ask the server whether the target is a download; if so, redirect to the original URL.
    try {
        const res = await fetch("/api/check?url=" + encodeURIComponent(url));
        const info = await res.json();
        if (info.download) {
            window.location.href = url;
            return;
        }
    } catch {
        // fall through and render through the proxy
    }
    document.getElementById("iframeWindow").src =
        __uv$config.prefix + __uv$config.encodeUrl(url);
}

// ?site=example.com or ?site=https://example.com; invalid/missing keeps the blank default.
const initialSite = normalizeSite(new URLSearchParams(window.location.search).get("site"));
if (initialSite) loadSite(initialSite);

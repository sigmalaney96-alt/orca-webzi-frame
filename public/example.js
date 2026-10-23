const input = document.getElementById("urlInput");
const iframeWindow = document.getElementById("iframeWindow");

function normalizeUrl(value) {
    let url = value.trim();
    const searchUrl = "https://www.google.com/search?q=";

    if (!url.includes(".")) {
        url = searchUrl + encodeURIComponent(url);
    } else if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }

    return url;
}

function openSite(rawValue) {
    const url = normalizeUrl(rawValue);
    const siteParam = encodeURIComponent(url);

    // Add/update ?site= in the address bar
    const current = new URL(window.location.href);
    current.searchParams.set("site", siteParam);
    history.replaceState({}, "", current);

    // Open in iframe through UV
    iframeWindow.src = __uv$config.prefix + __uv$config.encodeUrl(url);
}

// Enter to open
input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        openSite(input.value);
    }
});

// Auto-open if ?site= exists
window.addEventListener("load", () => {
    const params = new URLSearchParams(window.location.search);
    const site = params.get("site");
    if (site) {
        const decoded = decodeURIComponent(site);
        input.value = decoded;
        iframeWindow.src = __uv$config.prefix + __uv$config.encodeUrl(decoded);
    }
});

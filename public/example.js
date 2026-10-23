const iframeWindow = document.getElementById("iframeWindow");

function normalizeUrl(value) {
    let url = (value || "").trim();
    if (!url) return "";

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }

    return url;
}

window.addEventListener("load", () => {
    const params = new URLSearchParams(window.location.search);
    const site = params.get("site");

    if (!site) {
        // No ?site= provided
        document.body.innerHTML = "<h2 style='font-family:sans-serif;text-align:center;margin-top:40px;'>Missing ?site= parameter</h2>";
        return;
    }

    const url = normalizeUrl(site);
    iframeWindow.src = __uv$config.prefix + __uv$config.encodeUrl(url);
});

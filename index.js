import express from 'express';
import http from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';
import cors from 'cors';
import path from "path";
import { hostname } from "node:os"

const server = http.createServer();
const app = express(server);
const __dirname = process.cwd();
const bareServer = createBareServer('/b/');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cors());

server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res)
    } else {
        app(req, res)
    }
})

server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head)
    } else {
        socket.end()
    }
})

const NON_RENDERABLE = /^(application\/(?!xhtml|xml|json|javascript)|audio\/|video\/|font\/)|^image\/(?!svg)/i;

// Detects whether a URL serves a download (attachment or binary MIME type) by inspecting headers.
app.get('/api/check', async (req, res) => {
    let target;
    try {
        target = new URL(String(req.query.url));
        if (!/^https?:$/.test(target.protocol)) throw new Error('bad protocol');
    } catch {
        return res.status(400).json({ error: 'Invalid url' });
    }
    try {
        const upstream = await fetch(target, { redirect: 'follow', signal: AbortSignal.timeout(8000) });
        const type = (upstream.headers.get('content-type') || '').split(';')[0].trim();
        const disposition = upstream.headers.get('content-disposition') || '';
        upstream.body?.cancel().catch(() => {});
        const download = /^\s*attachment/i.test(disposition) || NON_RENDERABLE.test(type);
        res.json({ download });
    } catch {
        res.json({ download: false });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), '/public/index.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(process.cwd(), '/public/index.html'));
});

/* add your own extra urls like this:

app.get('/pathOnYourSite', (req, res) => {
    res.sendFile(path.join(process.cwd(), '/linkToItInYourSource'));
});

*/

const PORT = 3000;
server.on('listening', () => {
    const address = server.address();

    console.log("Listening on:");
    console.log(`\thttp://localhost:${address.port}`);
    console.log(`\thttp://${hostname()}:${address.port}`);
    console.log(
        `\thttp://${address.family === "IPv6" ? `[${address.address}]` : address.address
        }:${address.port}`
    );
})

server.listen({ port: PORT, })

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
    console.log("SIGTERM signal received: closing HTTP server");
    server.close();
    bareServer.close();
    process.exit(0);
}

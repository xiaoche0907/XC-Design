const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const host = "127.0.0.1";
const port = Number(process.env.PORT || 5173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function send(response, statusCode, body, contentType = "text/plain; charset=utf-8") {
  response.writeHead(statusCode, { "Content-Type": contentType });
  response.end(body);
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${host}:${port}`);
  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const normalizedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = path.normalize(path.join(root, normalizedPath));

  if (!filePath.startsWith(root)) {
    send(response, 403, "Forbidden");
    return;
  }

  if (path.extname(filePath).toLowerCase() === ".mp4") {
    fs.stat(filePath, (error, stat) => {
      if (error || !stat.isFile()) {
        send(response, 404, "Not found");
        return;
      }
      const range = request.headers.range;
      let start = 0;
      let end = stat.size - 1;
      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (match && (match[1] || match[2])) {
          start = match[1] ? Number(match[1]) : Math.max(0, stat.size - Number(match[2]));
          end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end;
        }
        if (!match || (!match[1] && !match[2]) || start > end || start >= stat.size) {
          response.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
          response.end();
          return;
        }
      }
      const headers = {
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
      };
      if (range) headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
      response.writeHead(range ? 206 : 200, headers);
      if (request.method === "HEAD") {
        response.end();
        return;
      }
      const stream = fs.createReadStream(filePath, { start, end });
      stream.on("error", () => response.destroy());
      response.on("close", () => stream.destroy());
      stream.pipe(response);
    });
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(response, 404, "Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    send(response, 200, data, mimeTypes[extension] || "application/octet-stream");
  });
});

server.listen(port, host, () => {
  console.log(`Local server running at http://${host}:${port}/`);
});

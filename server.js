import http, { IncomingMessage, ServerResponse } from "http";
import fs from "fs";
import path from "path";

const PORT = 3000;
const ROUTES = {
  "GET": {
    "^/$": handleHomeView,
    "^/public/client.js": serveFile("client.js", { "Content-Type": "text/javascript" }),
    "^/public/lexer.js": serveFile("lexer.js", { "Content-Type": "text/javascript" }),
    "^/public/main.css": serveFile("main.css", { "Content-Type": "text/css" }),
    "^/public/robotomono-var.woff2": serveFile("robotomono-var.woff2", { "Content-Type": "font/woff2" })
  },
}

let server = http.createServer()

/** serveFile
  * @param {string} filepath - file to serve
  * @param {object} headers - headers
  * @returns {(req: IncomingMessage, reply: ServerResponse) => void}
*/
function serveFile(filepath, headers) {
  return (_, reply) => {
    reply.writeHead(200, headers)
    let readable = fs.createReadStream(path.join(process.cwd(), filepath));
    readable.pipe(reply)
  }
}

/** handleHomeView
  * @param {IncomingMessage} req - request
  * @param {ServerResponse} reply - response
*/
function handleHomeView(req, reply) {
  reply.writeHead(200, { "Content-Type": "text/html" });
  let stream = fs.createReadStream(path.join(process.cwd(), "./index.html"));
  stream.pipe(reply);
}

server.on("request", (req, reply) => {
  console.log(`[${req.method}] -> ${req.url}`)
  let paths = Object.keys(ROUTES[req.method])
  let idx = paths.findIndex(path => new RegExp(path).test(req.url || ""))

  let match = req.url?.match(new RegExp(paths[idx]))
  if (match) {
    req.params = match.groups
  }

  let handle = ROUTES[req.method][paths[idx]]
  if (handle) {
    handle(req, reply)
    return
  }

  reply.writeHead(404, { "Content-Type": "text/plain" });
  reply.write("404");
  reply.end();
});

server.listen(PORT, () => console.log(`Server started on port: ${PORT}`)) 

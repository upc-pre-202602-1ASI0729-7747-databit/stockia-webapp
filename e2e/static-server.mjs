// Serves the production build with the same SPA fallback as vercel.json (every path → index.html).
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {extname, join, normalize} from 'node:path';

const root = normalize(process.argv[2] ?? 'dist/stockia-webapp/browser');
const port = Number(process.argv[3] ?? 4200);
const types = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.png': 'image/png'};

createServer(async (request, response) => {
  const path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  let file = normalize(join(root, path));
  if (!file.startsWith(root)) file = join(root, 'index.html');
  try {
    if (!(await stat(file)).isFile()) file = join(root, 'index.html');
  } catch {
    file = join(root, 'index.html');
  }
  response.writeHead(200, {'Content-Type': types[extname(file)] ?? 'application/octet-stream'});
  response.end(await readFile(file));
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));

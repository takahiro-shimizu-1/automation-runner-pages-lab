import fs from 'node:fs';
import path from 'node:path';

const distDir = path.join(process.cwd(), 'dist');
const outputPath = path.join(distDir, 'index.html');

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(
  outputPath,
  `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>automation-runner-pages-lab</title>
  </head>
  <body>
    <main>
      <h1>automation-runner-pages-lab</h1>
      <p>deploy-enabled profile validation artifact</p>
    </main>
  </body>
</html>
`,
  'utf8',
);

console.log(`app build ok: ${outputPath}`);

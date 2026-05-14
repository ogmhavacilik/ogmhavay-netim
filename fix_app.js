import fs from 'fs';
const appContent = fs.readFileSync('App.tsx', 'utf8');
const lines = appContent.split('\n');
// We know lines 1360-1364 (0-indexed 1359-1363) are the problem
const newLines = lines.filter((_, i) => i < 1359 || i > 1363);
fs.writeFileSync('App.tsx', newLines.join('\n'));

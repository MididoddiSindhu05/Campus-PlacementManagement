const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');
const searchStr = 'process.on("SIGINT", shutdown);';
const idx = content.indexOf(searchStr);
if (idx !== -1) {
  const newContent = content.substring(0, idx + searchStr.length) + '\n';
  fs.writeFileSync('server.js', newContent);
  console.log('Fixed server.js');
} else {
  console.log('Could not find search string in server.js');
}

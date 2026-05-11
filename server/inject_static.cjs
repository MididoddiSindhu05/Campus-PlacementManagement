const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');
const inject = `
// Serve frontend
const clientDist = path.join(process.cwd(), '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

`;
content = content.replace('app.use(notFound);', inject + 'app.use(notFound);');
fs.writeFileSync('server.js', content);
console.log('Injected static file serving into server.js');

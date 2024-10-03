const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3080;

app.use(express.static(path.join(__dirname, '../web')));
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../web', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
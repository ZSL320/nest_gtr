const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const https = require('https');

const app = express();
const port = 3090;

// 使用 CORS 中间件
app.use(cors());

// 使用 body-parser 中间件解析 JSON 请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// 日志接收接口
app.post('/logs', (req, res) => {
  const logMessage = req.body.log;
  const logFilePath = path.join(__dirname, 'logs.txt');

  // 将日志写入文件
  fs.appendFile(logFilePath, `${logMessage}\n`, (err) => {
    if (err) {
      console.error('Failed to write log:', err);
      return res.status(500).send('Failed to write log');
    }
    res.status(200).send('Log received');
  });
});

// 提供日志文件内容的接口
app.get('/logs', (req, res) => {
  const logFilePath = path.join(__dirname, 'logs.txt');
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read log file:', err);
      return res.status(500).send('Failed to read log file');
    }
    res.send(`<pre>${data}</pre>`);
  });
});

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join('/home/ubuntu/download', filename);

  res.download(filePath, (err) => {
    if (err) {
      console.error('Failed to download file:', err);
      return res.status(500).send('Failed to download file');
    }
  });
});

// 反馈接收接口
app.post('/feedback', (req, res) => {
  const feedback = req.body.feedback;
  const feedbackFilePath = path.join(__dirname, 'feedback.txt');

  // 将反馈写入文件
  fs.appendFile(feedbackFilePath, `${feedback}\n`, (err) => {
    if (err) {
      console.error('Failed to write feedback:', err);
      return res.status(500).send('Failed to write feedback');
    }
    res.status(200).send('Feedback received');
  });
});

// 获取反馈列表接口
app.get('/feedback', (req, res) => {
  const feedbackFilePath = path.join(__dirname, 'feedback.txt');
  fs.readFile(feedbackFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read feedback file:', err);
      return res.status(500).send('Failed to read feedback file');
    }
    res.send(`<pre>${data}</pre>`);
  });
});

// 读取 SSL 证书
const sslOptions = {
  key: fs.readFileSync('/home/ubuntu/nestgtr.cc_nginx/nestgtr.cc.key'),
  cert: fs.readFileSync('/home/ubuntu/nestgtr.cc_nginx/nestgtr.cc_bundle.crt'),
};

// 启动 HTTPS 服务器
https.createServer(sslOptions, app).listen(port, () => {
  console.log(`Log server listening at https://localhost:${port}`);
});
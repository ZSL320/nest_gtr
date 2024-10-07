const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const https = require('https');
const axios = require('axios');
const multer = require('multer'); // 引入 multer

const app = express();
const port = 3090;

// 设置 multer 存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 上传的文件存储在 uploads 目录
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // 使用原始文件名
  }
});

const upload = multer({ storage: storage });
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

app.get('/ip', async (req, res) => {
  // 从请求头中获取用户的IP地址
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // 如果IP地址包含 ::ffff: 前缀，则去掉它
  const userIp = ip.replace(/^::ffff:/, '');
  // 这里可以选择不使用ipify API，直接返回用户的IP
  res.json({ userIp: userIp });
});

// 文件上传接口
app.post('/upload', upload.single('file'), (req, res) => {
  // 这里 'file' 是表单中上传文件的字段名
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  // 构造文件的 URL
  const fileUrl = `https://nestgtr.cc:${port}/uploads/${req.file.filename}`;

  res.status(200).json({
    message: `File uploaded successfully: ${req.file.originalname}`,
    fileUrl: fileUrl
  });
});

// 文件下载接口
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  res.download(filePath, (err) => {
    if (err) {
      console.error('Failed to download file:', err);
      return res.status(500).send('Failed to download file');
    }
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
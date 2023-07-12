const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const { spawn,exec  } = require('child_process');

const app = express();
const wss = new WebSocket.Server({ noServer: true });
const WS_PORT  = 8888;
const HTTP_PORT = 8000;

const frameDirectory = path.join(__dirname, 'video', 'temp_frames');
let frameCount = 0;

let connectedClients = [];  ////YTFYTFYGVG

// Khi nhận được kết nối WebSocket
wss.on('connection', (ws) => {
  console.log('Client connected');

  connectedClients.push(ws); /////sdasdas

  // Khi nhận được dữ liệu từ client
  ws.on('message', (message) => {
    connectedClients.forEach((ws,i)=>{
        if(ws.readyState === ws.OPEN){
            ws.send(message);
        }else{
            connectedClients.splice(i ,1);
        }
    }) ////// sấSÂSá

    // Ghi frame vào file
    const framePath = `${frameDirectory}/frame_${frameCount}.jpg`;
    fs.writeFile(framePath, message, { encoding: 'binary' }, (err) => {
      if (err) {
        console.error('Error writing frame:', err);
        return;
      }
      console.log('Frame saved:', framePath);
    });
    frameCount++;
  });

  // Khi kết nối WebSocket bị đóng
  ws.on('close', () => {
    console.log('Client disconnected');
    if (wss.clients.size === 0) {
      createVideo();
    }
  });
});

// Tạo HTTP server từ Express app
const server = app.listen(8888, () => {
  console.log('Server started on port 8888');
});

// Khi có kết nối HTTP
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Khi đóng server
server.on('close', () => {
  console.log('Server shutting down');
  if (wss.clients.size === 0) {
    createVideo(() => {
      process.exit();
    });
  }
});

function createVideo() {
    const frameDirectory = 'C:\\Users\\NCT_2021\\Desktop\\Test\\NodeServer\\video\\temp_frames';
    const currentDate = new Date();
    const timestamp = currentDate.toISOString().replace(/[:-]/g, '');
    const outputVideoPath = `C:\\Users\\NCT_2021\\Desktop\\Test\\NodeServer\\video\\video_${timestamp}.mp4`;
  
    const ffmpegCommand = `ffmpeg -framerate 30 -i "${frameDirectory}\\frame_%d.jpg" "${outputVideoPath}"`;
  
    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Error creating video:', error);
      } else {
        console.log('Video created successfully');
        // Xoá các frame đã lưu tạm thời
        fs.readdirSync(frameDirectory).forEach((file) => {
          const filePath = path.join(frameDirectory, file);
          fs.unlinkSync(filePath);
        });
      }
    });
  }
  
  /// GUI DATA SANG HTML
app.get('/client',(req,res)=>res.sendFile(path.resolve(__dirname, './client.html')));
app.listen(HTTP_PORT, ()=> console.log(`HTTP server listening at ${HTTP_PORT}`));
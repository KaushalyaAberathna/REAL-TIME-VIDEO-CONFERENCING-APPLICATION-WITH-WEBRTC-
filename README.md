# REAL-TIME-VIDEO-CONFERENCING-APPLICATION-WITH-WEBRTC-
 WebRTC Video Conferencing App

This is a full-featured WebRTC video conferencing application that supports real-time video/audio communication, text chat, room management, and more. Built using **WebRTC**, **Node.js**, **Socket.IO**, and pure HTML/CSS/JavaScript (no frameworks), this app is designed for learning and practical use.

# 🧩 Project Overview

This WebRTC demo app enables multiple users to join virtual rooms and communicate using peer-to-peer video and audio, thanks to the WebRTC API. Socket.IO handles signaling between clients. Users can toggle mic/camera, send messages, and view a list of active rooms. It’s ideal for learning about real-time communication on the web.

## 📌 Features

- ✅ Real-time **Video & Audio Calling**
- 💬 Built-in **Text Chat**
- 👥 Multiple **Room Support** with random room generator
- 🧑‍💼 Custom **User Profiles**
- 🎙️ Toggle **Microphone/Camera**
- 🔴 Optional **Recording** (MediaRecorder API)
- 🚪 **Leave Room** Button with clean UI
- 🌐 Lobby showing **Active Rooms**

---

## 💻 Tech Stack

- **Frontend**: HTML, CSS, JavaScript (split into `index.html`, `styles.css`, and `script.js`)
- **Backend**: Node.js with Express and Socket.IO
- **WebRTC**: For peer-to-peer media & data streaming
- **Signaling**: Socket.IO for negotiating WebRTC connections

---

## 🛠️ Getting Started

**Install dependencies**
npm install

**Run locally**
node server.js

**🧠 How It Works**
Users join rooms and exchange peer connection data via Socket.IO.

WebRTC handles the direct video/audio stream once signaling completes.

STUN servers help users connect even behind NAT.

Optionally, MediaRecorder saves outgoing media streams as files.


**#🚀 Usage Guidelines**
Open the browser and navigate to http://localhost:3000 (or your hosted URL).

Enter a room name or click a random room generator.

Grant microphone and camera access.

Invite another user to the same room (open in a new tab or different browser).

Start chatting, toggle mic/cam,  or leave the room anytime.

**🙌 Acknowledgements**
WebRTC API Docs

Socket.IO

Render

GitHub Pages



![1](https://github.com/user-attachments/assets/b1144d97-6d49-44fb-8775-cb65ed673870)
![2](https://github.com/user-attachments/assets/a4c3e23b-6775-4191-80b0-31b1b621c472)
![3](https://github.com/user-attachments/assets/b29caa6e-d8b6-47ae-9a18-67bf2ea9454d)
![4](https://github.com/user-attachments/assets/51b94a0f-a6f3-4e86-a6c7-fae93ec8dc61)



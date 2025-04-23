// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// In-memory storage
// rooms: { roomID: [userID, ...] }
// userProfiles: { userID: { name, photo } }
let rooms = {};
let userProfiles = {};

// Helper to broadcast current room list
function broadcastRoomList() {
  io.emit("room-list", Object.keys(rooms));
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // When a user joins a room with their profile info
  socket.on("join-room", ({ roomID, userID, profile }) => {
    if (!rooms[roomID]) rooms[roomID] = [];
    rooms[roomID].push(userID);
    userProfiles[userID] = profile;
    socket.join(roomID);
    socket.roomID = roomID;
    console.log(`User ${userID} joined room ${roomID}`);

    // Send the new user a list of other users (with profiles)
    const otherUsers = rooms[roomID].filter((id) => id !== userID);
    socket.emit("all-users", otherUsers.map(id => ({ id, profile: userProfiles[id] })));

    // Notify existing users about the new user’s profile
    otherUsers.forEach((id) => {
      io.to(id).emit("user-joined", { userID, profile });
    });

    broadcastRoomList();
  });

  // Forward an offer, including the caller's profile
  socket.on("offer", ({ target, caller, sdp }) => {
    io.to(target).emit("offer", { caller, sdp, profile: userProfiles[caller] });
  });

  // Forward an answer back to the caller
  socket.on("answer", ({ target, sdp }) => {
    io.to(target).emit("answer", { target: socket.id, sdp });
  });

  // Forward ICE candidates
  socket.on("ice-candidate", ({ target, candidate }) => {
    io.to(target).emit("ice-candidate", { target: socket.id, candidate });
  });

  // Handle a user leaving a room explicitly
  socket.on("leave-room", ({ roomID, userID }) => {
    console.log(`User ${userID} left room ${roomID}`);
    if (rooms[roomID]) {
      rooms[roomID] = rooms[roomID].filter((id) => id !== userID);
      if (rooms[roomID].length === 0) delete rooms[roomID];
    }
    delete userProfiles[userID];
    socket.leave(roomID);
    io.to(roomID).emit("user-left", userID);
    broadcastRoomList();
  });

  // Handle disconnects gracefully
  socket.on("disconnect", () => {
    const userID = socket.id;
    const roomID = socket.roomID;
    console.log("User disconnected:", userID);
    if (roomID && rooms[roomID]) {
      rooms[roomID] = rooms[roomID].filter((id) => id !== userID);
      if (rooms[roomID].length === 0) {
        delete rooms[roomID];
      }
      delete userProfiles[userID];
      io.to(roomID).emit("user-left", userID);
      broadcastRoomList();
      console.log(`User ${userID} disconnected from room ${roomID}`);
    }
  });

  // Provide room list on request
  socket.on("get-rooms", () => {
    socket.emit("room-list", Object.keys(rooms));
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

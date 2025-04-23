// public/script.js
const socket = io();

const roomJoinDiv = document.getElementById("roomJoin");
const roomInput = document.getElementById("roomInput");
const nameInput = document.getElementById("nameInput");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const createRoomBtn = document.getElementById("createRoomBtn");
const roomList = document.getElementById("roomList");

const localVideo = document.getElementById("localVideo");
const videosDiv = document.getElementById("videos");
const muteButton = document.getElementById("muteButton");
const cameraButton = document.getElementById("cameraButton");
const leaveButton = document.getElementById("leaveButton");

const chatDiv = document.getElementById("chat");
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

let roomID, userName;
let localStream;
let peers = {};
let dataChannels = {};

const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// Room UI actions
createRoomBtn.onclick = () => {
  const id = "room-" + Math.random().toString(36).substring(2, 8);
  roomInput.value = id;
};

joinRoomBtn.onclick = async () => {
  roomID = roomInput.value.trim();
  userName = nameInput.value.trim();
  if (!roomID || !userName) return alert("Enter room and name!");

  roomJoinDiv.classList.add("hidden");
  videosDiv.classList.remove("hidden");
  chatDiv.classList.remove("hidden");
  document.getElementById("controls").classList.remove("hidden");

  await startMedia();
  // Emit join-room with a profile object.
  socket.emit("join-room", { roomID, userID: socket.id, profile: { name: userName, photo: null } });
};

roomList.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    roomInput.value = e.target.textContent;
  }
});

leaveButton.onclick = () => {
  socket.emit("leave-room", { roomID, userID: socket.id });
  window.location.reload();
};

async function startMedia() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;
}

muteButton.onclick = () => {
  localStream.getAudioTracks().forEach(track => {
    track.enabled = !track.enabled;
    muteButton.textContent = track.enabled ? "Mute" : "Unmute";
  });
};

cameraButton.onclick = () => {
  localStream.getVideoTracks().forEach(track => {
    track.enabled = !track.enabled;
    cameraButton.textContent = track.enabled ? "Stop Camera" : "Start Camera";
  });
};

sendBtn.onclick = () => {
  const msg = messageInput.value.trim();
  if (msg) {
    Object.values(dataChannels).forEach(dc => dc.send(msg));
    const div = document.createElement("div");
    div.textContent = `You: ${msg}`;
    chatMessages.appendChild(div);
    messageInput.value = "";
  }
};

// Socket events

// Room list update (server sends an array of room IDs)
socket.on("room-list", (rooms) => {
  roomList.innerHTML = "";
  rooms.forEach(r => {
    const li = document.createElement("li");
    li.textContent = r;
    roomList.appendChild(li);
  });
});

// When joining a room, receive an array of existing users with their profiles
socket.on("all-users", (users) => {
  users.forEach(async ({ id, profile }) => {
    const pc = new RTCPeerConnection(servers);
    peers[id] = pc;

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    const dc = pc.createDataChannel("chat");
    dataChannels[id] = dc;
    dc.onmessage = (e) => {
      const div = document.createElement("div");
      div.textContent = `${profile.name}: ${e.data}`;
      chatMessages.appendChild(div);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { target: id, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      let remoteVideo = document.getElementById(id);
      if (!remoteVideo) {
        remoteVideo = document.createElement("video");
        remoteVideo.id = id;
        remoteVideo.autoplay = true;
        videosDiv.appendChild(remoteVideo);
      }
      remoteVideo.srcObject = event.streams[0];
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { target: id, caller: socket.id, sdp: offer });
  });
});

// When receiving an offer
socket.on("offer", async ({ caller, sdp, profile }) => {
  const pc = new RTCPeerConnection(servers);
  peers[caller] = pc;

  pc.ondatachannel = (event) => {
    const dc = event.channel;
    dataChannels[caller] = dc;
    dc.onmessage = (e) => {
      const div = document.createElement("div");
      div.textContent = `${profile.name}: ${e.data}`;
      chatMessages.appendChild(div);
    };
  };

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", { target: caller, candidate: event.candidate });
    }
  };

  pc.ontrack = (event) => {
    let remoteVideo = document.getElementById(caller);
    if (!remoteVideo) {
      remoteVideo = document.createElement("video");
      remoteVideo.id = caller;
      remoteVideo.autoplay = true;
      videosDiv.appendChild(remoteVideo);
    }
    remoteVideo.srcObject = event.streams[0];
  };

  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit("answer", { target: caller, sdp: answer });
});

// When receiving an answer
socket.on("answer", async ({ target, sdp }) => {
  const pc = peers[target];
  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
});

// When receiving ICE candidates
socket.on("ice-candidate", async ({ target, candidate }) => {
  const pc = peers[target];
  if (pc) {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
});

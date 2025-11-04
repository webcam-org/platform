(() => {
  const els = {
    localVideo: document.getElementById('localVideo'),
    remoteVideo: document.getElementById('remoteVideo'),
    startBtn: document.getElementById('startBtn'),
    nextBtn: document.getElementById('nextBtn'),
    muteBtn: document.getElementById('muteBtn'),
    cameraBtn: document.getElementById('cameraBtn'),
    leaveBtn: document.getElementById('leaveBtn'),
    status: document.getElementById('status'),
    remoteStatus: document.getElementById('remoteStatus'),
    connBadge: document.getElementById('connBadge'),
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
  };

  let ws;
  let peerId;
  let roomId;
  let role; // 'caller' | 'callee'
  let pc; // RTCPeerConnection
  let localStream;
  let audioMuted = false;
  let videoEnabled = true;
  let dataChannel = null;

  function setStatus(msg) { els.status.textContent = msg || ''; }
  function setRemoteStatus(msg) { els.remoteStatus.textContent = msg || ''; }
  function setConnBadge(text) { els.connBadge.textContent = text; }
  function enableControls(running) {
    els.nextBtn.disabled = !running;
    els.muteBtn.disabled = !running;
    els.cameraBtn.disabled = !running;
    els.leaveBtn.disabled = !running;
    els.chatInput.disabled = !running;
    els.sendBtn.disabled = !running;
  }

  function addChatMessage(text, type = 'system') {
    const msg = document.createElement('div');
    msg.className = `chat-message ${type}`;
    msg.textContent = text;
    els.chatMessages.appendChild(msg);
    els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
  }

  function clearChat() {
    els.chatMessages.innerHTML = '<div class="chat-message system">Waiting for partner...</div>';
  }

  function sendChatMessage() {
    const text = els.chatInput.value.trim();
    if (!text || !dataChannel || dataChannel.readyState !== 'open') return;

    dataChannel.send(JSON.stringify({ type: 'chat', text }));
    addChatMessage(text, 'local');
    els.chatInput.value = '';
  }

  function wsUrl() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    // Dev convenience: if running the static page on a different port, target 8000
    const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
    if (isLocal && location.port && location.port !== '8000') {
      return `${proto}://localhost:8000/ws`;
    }
    return `${proto}://${location.host}/ws`;
  }

  async function initMedia() {
    if (localStream) return localStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      els.localVideo.srcObject = localStream;
      return localStream;
    } catch (err) {
      console.error('getUserMedia failed:', err);
      setStatus('Camera/microphone permission denied or unavailable.');
      throw err;
    }
  }

  function createPeer() {
    if (pc) pc.close();
    const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
    pc = new RTCPeerConnection({ iceServers });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        send({ type: 'signal', roomId, data: { type: 'candidate', candidate: e.candidate } });
      }
    };

    pc.ontrack = (e) => {
      if (e.streams && e.streams[0]) {
        els.remoteVideo.srcObject = e.streams[0];
        setRemoteStatus('');
      }
    };

    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === 'connected') {
        setStatus('Connected');
        addChatMessage('Connected! You can now chat.', 'system');
        // Enable chat controls when peer connected
        els.chatInput.disabled = false;
        els.sendBtn.disabled = false;
      }
      if (s === 'failed' || s === 'disconnected') {
        setStatus('Connection lost.');
        els.chatInput.disabled = true;
        els.sendBtn.disabled = true;
      }
    };

    // Handle incoming data channel
    pc.ondatachannel = (event) => {
      dataChannel = event.channel;
      setupDataChannel();
    };

    return pc;
  }

  function setupDataChannel() {
    if (!dataChannel) return;

    dataChannel.onopen = () => {
      console.log('Data channel opened');
      enableControls(true);
    };

    dataChannel.onclose = () => {
      console.log('Data channel closed');
    };

    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          addChatMessage(data.text, 'remote');
        }
      } catch (e) {
        console.error('Failed to parse data channel message', e);
      }
    };
  }

  async function startCall(_role) {
    role = _role;
    await initMedia();
    createPeer();

    // Create data channel for caller
    if (_role === 'caller') {
      dataChannel = pc.createDataChannel('chat');
      setupDataChannel();
    }

    // Add local tracks
    localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

    if (role === 'caller') {
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      send({ type: 'signal', roomId, data: { type: 'offer', sdp: offer.sdp } });
      setStatus('Calling…');
    } else {
      setStatus('Preparing answer…');
    }
    clearChat();
    enableControls(true);
  }

  async function handleSignal(data) {
    if (!pc) createPeer();
    if (data.type === 'offer') {
      await initMedia();
      if (!pc.getSenders().length) {
        localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
      }
      await pc.setRemoteDescription({ type: 'offer', sdp: data.sdp });
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      send({ type: 'signal', roomId, data: { type: 'answer', sdp: answer.sdp } });
      setStatus('Answer sent');
      enableControls(true);
    } else if (data.type === 'answer') {
      await pc.setRemoteDescription({ type: 'answer', sdp: data.sdp });
      setStatus('Connected');
    } else if (data.type === 'candidate') {
      try {
        await pc.addIceCandidate(data.candidate);
      } catch (e) {
        console.warn('Failed to add ICE candidate', e);
      }
    }
  }

  function cleanupPeer() {
    if (dataChannel) {
      try { dataChannel.close(); } catch {}
      dataChannel = null;
    }
    if (pc) {
      try { pc.onicecandidate = null; pc.ontrack = null; pc.close(); } catch {}
    }
    pc = null;
    if (els.remoteVideo.srcObject) {
      const s = els.remoteVideo.srcObject; // MediaStream
      if (s && s.getTracks) s.getTracks().forEach(t => t.stop());
    }
    els.remoteVideo.srcObject = null;
    setRemoteStatus('Waiting for a partner…');
    clearChat();
    enableControls(false);
  }

  function send(obj) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj));
    }
  }

  function connectWS() {
    ws = new WebSocket(wsUrl());

    ws.onopen = () => {
      setConnBadge('Online');
    };

    ws.onclose = () => {
      setConnBadge('Offline');
      cleanupPeer();
      // try reconnect after a delay
      setTimeout(connectWS, 1500);
    };

    ws.onerror = () => {
      setConnBadge('Error');
    };

    ws.onmessage = async (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      switch (msg.type) {
        case 'hello':
          peerId = msg.peerId;
          setStatus('Connected to signaling.');
          break;
        case 'waiting':
          setRemoteStatus('Waiting for a partner…');
          break;
        case 'match':
          roomId = msg.roomId;
          await startCall(msg.role);
          break;
        case 'signal':
          await handleSignal(msg.data);
          break;
        case 'partner_left':
          setStatus('Partner left. Searching…');
          cleanupPeer();
          send({ type: 'next' });
          break;
        case 'pong':
          break;
      }
    };
  }

  // UI events
  els.startBtn.addEventListener('click', async () => {
    try {
      await initMedia();
      send({ type: 'next' });
      els.startBtn.disabled = true;
    } catch {}
  });

  els.nextBtn.addEventListener('click', () => {
    cleanupPeer();
    send({ type: 'next' });
  });

  els.leaveBtn.addEventListener('click', () => {
    send({ type: 'leave' });
    cleanupPeer();
    setStatus('Left room.');
  });

  els.muteBtn.addEventListener('click', () => {
    if (!localStream) return;
    audioMuted = !audioMuted;
    localStream.getAudioTracks().forEach(t => { t.enabled = !audioMuted; });
    els.muteBtn.textContent = audioMuted ? 'Unmute' : 'Mute';
  });

  els.cameraBtn.addEventListener('click', () => {
    if (!localStream) return;
    videoEnabled = !videoEnabled;
    localStream.getVideoTracks().forEach(t => { t.enabled = videoEnabled; });
    els.cameraBtn.textContent = videoEnabled ? 'Camera Off' : 'Camera On';
  });

  // Chat events
  els.sendBtn.addEventListener('click', sendChatMessage);
  els.chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // Kick things off
  connectWS();
})();

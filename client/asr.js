// https://stackoverflow.com/a/62090602
// Goole Speech-to-Text recommends FLAC, LINEAR16, AMR_WB, OGG_OPUS, and SPEEX_WITH_HEADER_BYTE.
// Web audio codec that is also supported by WebRTC is OGG_OPUS.
// audio/ogg;codecs=opus is not supported on Chrome

const startButton = document.querySelector('.start');
const stopButton = document.querySelector('.stop');

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let socket;

startButton.addEventListener('click', () => {
  console.log('Start ASR server');
  if (socket === undefined) {
    socket = new WebSocket('ws://localhost:5000');
    socket.onopen = () => {
      console.log('WebSocket opened');
    };
  
    socket.onmessage = (e) => {
      console.log(e.data);
      document.querySelector('#text').innerHTML = e.data;
    };
  
    socket.onclose = () => {
      console.log('WebSocket closed');
    }
  }
  
  console.log('Start microphone');
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(async (stream) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamSource
        // @TODO Setting sample rate only works in Chrome???
        if (audioCtx === undefined) {
          audioCtx = new AudioContext({ latencyHint: 'interactive', sampleRate: 16000});
        }
        const micSource = audioCtx.createMediaStreamSource(stream);
        await audioCtx.audioWorklet.addModule('worklet-processor.js');
        const audioProcessorNode = new AudioWorkletNode(audioCtx, 'worklet-processor');
        audioProcessorNode.port.onmessage = (e) => {
          if (socket && socket.readyState === socket.OPEN) {
            // Encode data as LINEAR16 PCM
            // https://stackoverflow.com/a/33741731
            // https://stackoverflow.com/a/62090602 
  
            // Create buffer
            const buf = new Int16Array(e.data.length)
  
            // Encode each sample
            for (let i = 0; i < buf.length; i++) {
              // Clamp Flat32 value to [-1, +1]
              const val = Math.max(-1, Math.min(1, e.data[i]));
  
              // Scale value to Int16 limits
              buf[i] = val < 0 ? val * 0x8000 : val * 0x7FFF
            }
  
            socket.send(buf.buffer); // send ArrayBuffer to server
          }
        }
        micSource.connect(audioProcessorNode).connect(audioCtx.destination);
      })
      .catch((err) => console.error(err));
  } else {
    console.log('getUserMedia not supported on your browser!');
  }  
});

stopButton.addEventListener('click', () => {
  console.log('Microphone stop');

  if (audioCtx) {
    audioCtx.close();
    audioCtx = undefined;
  }

  if (socket) {
    socket.close();
    socket = undefined;
  }
});

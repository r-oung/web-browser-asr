// https://www.npmjs.com/package/ws
const speech = require('@google-cloud/speech');
const websocket = require('ws');

const asrService = new speech.SpeechClient({ keyFilename: 'credentials/connect-dev-59bbe-b5b2a0ca3753.json' });
const wss = new websocket.Server({ port: 5000 });

// Speech-to-text configurations
const streamingLimit = 60000 // [msec]
const request = {
  config: {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
    // languageCode: 'ja-JP',
    enableAutomaticPunctuation: true,

  },
  interimResults: false,
};

let asrStream;

function timestamp() {
  const date = new Date(Date.now());
  return date.toISOString();
}

function speechCallback(ws, data) {
  const transcript = data.results[0].alternatives[0].transcript;
  console.log(`Transcript: ${transcript}`);
  ws.send(transcript); // Send transcript to the client
}

function endAsrStream() {
  if (asrStream) {
    console.log(`[${timestamp()}] End stream recognition`);
    asrStream.removeListener('data', speechCallback);
    asrStream.end();
  }
  asrStream = undefined;
}

function startAsrStream(ws) {
  if (asrStream === undefined) {
    console.log(`[${timestamp()}] Start stream recognition`);
    asrStream = asrService.streamingRecognize(request)
    .on('error', console.error)
    .on('data', data => speechCallback(ws, data));
  
    setTimeout(() => {
      endAsrStream();
      startAsrStream(ws);
    }, streamingLimit);
  }
}

wss.on('connection', (ws, req) => {
  console.log(`[${timestamp()}] Client connected`);
  startAsrStream(ws);

  // When audio chunk is received, forward it to the speech-to-text service
  ws.on('message', (chunk) => {
    if (asrStream !== undefined) {
      asrStream.write(chunk);      
    }
  });

  // When a connection closes, end speech-to-text service
  ws.on('close', () => {
    console.log(`[${timestamp()}] Client disconnected`);
    endAsrStream();
  });
});

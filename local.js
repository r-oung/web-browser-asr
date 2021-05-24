// https://cloud.google.com/speech-to-text/docs/quickstart
// https://googleapis.dev/nodejs/speech/4.5.1/index.html
const fs = require('fs');
const speech = require('@google-cloud/speech');

const filename = "data/BM001A05.wav";

const client = new speech.SpeechClient({ keyFilename: 'credentials/connect-dev-59bbe-b5b2a0ca3753.json' });

const config = {
  encoding: 'LINEAR16',
  sampleRateHertz: 16000,
  languageCode: 'ja-JP', // BCP-47 language code
};

const request = {
  config: config,
  interimResults: false,
};

const recognizeStream = client
  .streamingRecognize(request)
  .on('error', console.error)
  .on('data', data => {
    console.log(`Transcription: ${data.results[0].alternatives[0].transcript}`);
  });

fs.createReadStream(filename).pipe(recognizeStream);

# Speech to Text
An example of using WebAudio to capture microphone, streaming this over WebSockets to a server that streams this audio to Google speech-to-text service for transcription.

This is similar to the examples below except that it uses `AudioWorklets` instead of `createScriptProcessor` (which is now deprecated).

## Similar Work
- [Nexmo](https://github.com/nexmo-community/voice-google-speechtotext-js/blob/main/server.js)
- [Google Cloud Speech Node Socket Playground](https://github.com/vin-ni/Google-Cloud-Speech-Node-Socket-Playground)

## Usage
Install dependencies:
```
npm i
```

Run the server
```
node server.js
```

Then run the client.

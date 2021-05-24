// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_AudioWorklet
class WorkletProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    const chunk = [];
    for (let i = 0; i < input[0].length; i++) {
      const sample = input[0][i];
      // output[0][i] = sample; // DEBUG: Pass-through audio
      chunk.push(sample);
    }

    this.port.postMessage(chunk);

    return true;
  }
}

registerProcessor('worklet-processor', WorkletProcessor);

// index.js
const { Cheetah } = require("@picovoice/cheetah-node");
const { PvRecorder } = require("@picovoice/pvrecorder-node");
const readline = require("readline");

const ACCESS_KEY = "Mg6fnrShHqeCcAfLlcOn5tvf9FfHGpHNt4cpI0nUMNtfa5tBSk1zQw==";

const cheetahDemo = async () => {
  let cheetah;

  try {
    cheetah = new Cheetah(`${ACCESS_KEY}`); // Replace with your Picovoice AccessKey
  } catch (err) {
    console.error(err);
    return;
  }

  const pvRecorder = new PvRecorder(cheetah.frameLength);
  pvRecorder.start();

  console.log(`Using device: ${pvRecorder.getSelectedDevice()}`);
  console.log("Listening... Press ENTER to stop:");

  let isInterrupted = false;
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on("keypress", (key, str) => {
    if (str.sequence === "\r" || str.sequence === "\n") {
      process.stdout.write(`\nStopped\n`);
      isInterrupted = true;
    }
  });

  while (!isInterrupted) {
    const audioFrame = await pvRecorder.read();
    try {
      const [partialTranscript, isEndpoint] = cheetah.process(audioFrame);
      process.stdout.write(partialTranscript);

      if (isEndpoint === true) {
        const flushedTranscript = cheetah.flush();
        process.stdout.write(`${flushedTranscript}\n`);
      }
    } catch (err) {
      console.error(err);
      isInterrupted = true;
    }
  }

  pvRecorder.stop();
  pvRecorder.release();
  cheetah.release();
  process.exit();
};

cheetahDemo();

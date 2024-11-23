var audioCtx, gainNode, source;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'start') {
        // Initialize AudioContext and GainNode
        audioCtx = new AudioContext();

        // Convert the stream ID to a media stream
        navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: request.streamId
                }
            }
        }).then(function(stream) {
            source = audioCtx.createMediaStreamSource(stream);
            gainNode = audioCtx.createGain();
            source.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            gainNode.gain.value = 4; // Set initial gain value
        }).catch(function(err) {
            console.error('Error getting tab audio stream:', err);
        });
    } else if (request.action === 'adjustVolume' && gainNode) {
        // Adjust volume
        let newVolume = isNumeric(request.value) ? request.value : 2; // Default volume
        gainNode.gain.value = 2 ** newVolume;
    } else if (request.action === 'stop' && streamer) {
        // Stop audio processing
        if (streamer.getAudioTracks().length > 0) {
            streamer.getAudioTracks().forEach(track => track.stop());
        }
        if (audioCtx) {
            audioCtx.close();
        }
        streamer = null;
        audioCtx = null;
        gainNode = null;
        source = null;
    }
});

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
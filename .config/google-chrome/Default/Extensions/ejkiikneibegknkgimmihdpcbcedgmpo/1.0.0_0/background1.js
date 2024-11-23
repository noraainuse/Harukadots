chrome.pageAction.onClicked(){
            var audioCtx = new (window.AudioContext)();
            chrome.tabCapture.capture({
                    audio : true,
                    video : false
                }, function(stream) {
                     var source = audioCtx.createMediaStreamSource(stream);
                     var analyser = audioCtx.createAnalyser();
                     source.connect(analyser);
                     analyser.connect(audioCtx.destination);
                                 // Create a gain node.
            var gainNode = audioCtx.createGain();
            // Connect the source to the gain node.
            source.connect(gainNode);
            // Connect the gain node to the destination.
            gainNode.connect(audioCtx.destination);
            gainNode.gain.value = 5.0;

                    // analyser.fftSize = 1024;
                    // var bufferLength = analyser.frequencyBinCount;
                    // var dataArray = new Uint8Array(bufferLength);

                    // function draw() {
                    //     analyser.getByteTimeDomainData(dataArray);
                    //     port.postMessage({data: dataArray, bufferLength: bufferLength});
                    // };

                    var intv = setInterval(function(){ draw() }, 1000 / 30);
                     port.onDisconnect.addListener(function(){
                         clearInterval(intv);
                         audioCtx.close();
                        stream.getAudioTracks()[0].stop();
                     });

                }
            );


}

var gainNode;
var os;
var audioCtx;
var streamer;
var source;
var prevFullScreen = false;
var val = 2;
//EACH TAB CAN HAVE A CONTEXT

chrome.runtime.getPlatformInfo(function(info) {
    // Display host OS in the console
    console.log(info.os);
    os = info.os;
});

/*
chrome.runtime.setUninstallURL("https://jointoucan.com/partners/volumebooster", function(){
    console.log("uninstalled");
})
*/

chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
            if (msg.action === 'give value'){
                port.postMessage(val);
                console.log('sent val'+val);
            }
            if (msg.action === 'start') {
                console.log("prev sound level = "+val);
                if(!streamer){
                    audioCtx = new (window.AudioContext)();
                    chrome.tabCapture.capture({
                            audio : true,
                            video : false
                        }, function(stream) {
                                streamer = stream;
                                source = audioCtx.createMediaStreamSource(streamer);
                                // Create a gain node.
                                gainNode = audioCtx.createGain();
                                // Connect the source to the gain node.
                                source.connect(gainNode);
                                // Connect the gain node to the destination.
                                gainNode.connect(audioCtx.destination);
                                gainNode.gain.value = 4;

                            });
                    }
              }



        if(isNumeric(msg.action)){
                console.log("adjust volume");
                val = msg.action;
                console.log("new sound level = "+val)
                gainNode.gain.value = 2**(val);
            }

        if(off(msg.faction)){
                streamer.getAudioTracks()[0].stop();
                streamer = null;
                audioCtx.close();
                console.log("close");
                val = 2;
            }


            chrome.tabCapture.onStatusChanged.addListener(function (info){
                //console.log("status: "+info.status);
                //console.log("tabId: "+info.tabId);
                //console.log("fullscreen: "+info.fullscreen);

                if(info.fullscreen){
                    if(!prevFullScreen){
                        if(os === 'mac'){
                            console.log("fullmac");
                            alert('maximize the chrome window. then press cmd+shift+f');
                        }
                        if(os === 'win'){
                            console.log("fullwin");
                            alert('press F11 for fullscreen');
                        }
                    }
                }
                prevFullScreen = info.fullscreen;
            });

    });
});

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function off(m) {
    return m;
}

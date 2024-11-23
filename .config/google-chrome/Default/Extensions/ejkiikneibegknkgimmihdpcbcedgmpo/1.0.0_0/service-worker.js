
var gainNode;
var os;
var audioCtx;
var streamer;
var source;
var prevFullScreen = false;
var val = 2;
chrome.action.setPopup({ popup: "popup.html"});
//EACH TAB CAN HAVE A CONTEXT

chrome.runtime.getPlatformInfo(function(info) {
    // Display host OS in the console
    console.error(info.os);
    os = info.os;
});


//chrome.runtime.setUninstallURL("https://jointoucan.com/partners/volumebooster", function(){
//    console.log("uninstalled");
//})


// NEW SHIT HERE

chrome.runtime.onConnect.addListener(async (tab) => {
    chrome.runtime.onMessage.addListener(function(msg) {
        if (msg.action === 'give value'){
                port.postMessage(val);
                console.error('sent val'+val);
            }
            if (msg.action === 'start') {
                console.error("prev sound level = "+val);
              }



        if(isNumeric(msg.action)){
                console.error("adjust volume");
                val = msg.action;
                console.error("new sound level = "+val)
                gainNode.gain.value = 2**(val);
            }

        if(off(msg.faction)){
                console.error("OFF");
            }
    });

  const existingContexts = await chrome.runtime.getContexts({});
  let streamer = false;

  const offscreenDocument = existingContexts.find(
    (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
  );

  // If an offscreen document is not already open, create one.
  if (!offscreenDocument) {
    // Create an offscreen document.
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Streaming from chrome.tabCapture API'
    });
  } else {
    streamer = offscreenDocument.documentUrl.endsWith('#streaming');
  }

/*
  if (streamer) {
    chrome.runtime.sendMessage({
      type: 'stop-streaming',
      target: 'offscreen'
    });
    return;
  }
*/


  // Get a MediaStream for the active tab.
  const streamId = await chrome.tabCapture.getMediaStreamId({
    targetTabId: tab.id
  });

  // Send the stream ID to the offscreen document to start streaming.
  chrome.runtime.sendMessage({
    type: 'start-streaming',
    target: 'offscreen',
    data: streamId
  });

    //full screen
    chrome.tabCapture.onStatusChanged.addListener(function (info){
                //console.error("status: "+info.status);
                //console.error("tabId: "+info.tabId);
                //console.error("fullscreen: "+info.fullscreen);

                if(info.fullscreen){
                    if(!prevFullScreen){
                        if(os === 'mac'){
                            console.error("fullmac");
                            chrome.action.openPopup();
                            alert('maximize the chrome window. then press cmd+shift+f');
                        }
                        if(os === 'win'){
                            console.error("fullwin");
                            alert('press F11 for fullscreen');
                        }
                    }
                }
                prevFullScreen = info.fullscreen;
            });

});



//END NEW SHIT
/*
chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
            if (msg.action === 'give value'){
                port.postMessage(val);
                console.log('sent val'+val);
            }
            if (msg.action === 'start') {
                console.log("prev sound level = "+val);
                if(!streamer){
//                    audioCtx = new AudioContext();
                
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
*/

/*
// Background script
chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if (msg.action === 'startCapture') {
            chrome.tabCapture.capture({audio: true, video: false}, function(stream) {
                if (stream) {
                    var tabId = msg.tabId; // Make sure you pass the tab ID in the message
                    chrome.tabs.sendMessage(tabId, {action: 'start', streamId: stream.id});
                } else {
                    console.error('Error capturing tab audio stream');
                }
            });
        }
    });
});
*/
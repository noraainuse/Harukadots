var port = chrome.runtime.connect();
port.postMessage({action: 'start'});

var slide = document.getElementById('slide');

port.postMessage({action: 'give value'});
port.onMessage.addListener(function(msg) {
  slide.value = parseInt(msg);
});


slide.onchange = function() {
  chrome.runtime.sendMessage({
    type: 'change-vol',
    target: 'offscreen',
    data: this.value
  });
  //  port.postMessage({action: this.value});

}

button.onclick = function() {
  chrome.runtime.sendMessage({
    type: 'stop-streaming',
    target: 'offscreen'
  });
//  port.postMessage({faction: true});
  window.close();
}

//port.onMessage.addListener(function(msg) {
//  var dataArray = msg.data;
// var bufferLength = msg.bufferLength;

//});



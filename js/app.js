function debug(string) {
    var element = document.getElementById("debug");
    var p = document.createElement("p");
    p.appendChild(document.createTextNode(string));
    element.appendChild(p);
}

var Socket = "MozWebSocket" in window ? MozWebSocket : WebSocket;
var ws = new Socket("ws://localhost:8080/");

ws.onmessage = function (evt) {
    debug(evt.data);
};
ws.onclose = function (event) {
    debug("Closed - code: " + event.code + ", reason: " + event.reason + ", wasClean: " + event.wasClean);
};
ws.onopen = function () {
    debug("connected...");
    // ws.send("hello server");
    // ws.send("hello again");
};


var send = document.getElementById('send');
send.addEventListener('click', function() {
    var username = document.getElementById('username').value;
    var message = document.getElementById('message').value;
    ws.send(JSON.stringify({
        username: username,
        message: message
    }));
});




init();
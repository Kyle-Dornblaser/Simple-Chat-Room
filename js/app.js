(function () {
    var Model = {
        message: {
            init: function () {
                if (!localStorage.messages) {
                    localStorage.messages = JSON.stringify([]);
                }
            },
            create: function (messageStr, userStr, timestampStr) {
                var message = {
                    user: userStr,
                    message: messageStr,
                    timestamp: timestampStr
                };

                var messages = this.all();
                messages.push(message);
                if (messages.length > 500) {
                    messages = messages.slice(messages.length - 500, messages.length);
                }
                localStorage.messages = JSON.stringify(messages);

                return message;
            },
            all: function () {
                return JSON.parse(localStorage.messages);
            }
        },
        user: {
            init: function () {
                if (!localStorage.user) {
                    localStorage.user = JSON.stringify({name: ''});
                }
            }
            ,
            getName: function () {
                return JSON.parse(localStorage.user).name;
            },
            setName: function (name) {
                var user = JSON.parse(localStorage.user);
                user.name = name;
                localStorage.user = JSON.stringify(user);

            }
        }
    };


    var View = {
        chatroom: {
            init: function () {
                this.messages = document.getElementById('messages');
                this.messageInput = document.getElementById('message');
                this.usernameInput = document.getElementById('username');
                this.usernameInput.value = Controller.user.getName();

                this.usernameInput.addEventListener('keyup', function () {
                    var username = View.chatroom.usernameInput.value;
                    Controller.user.update(username);
                });

                this.send = document.getElementById('send');
                this.send.addEventListener('click', function () {
                    var message = View.chatroom.messageInput.value;
                    Controller.socket.sendMessage(message);
                });
                this.renderOld();
            },
            renderOld: function () {
                this.messages.innerHTML = '';
                var messages = Model.message.all();
                for (var i = 0; i < messages.length; i++) {
                    var message = messages[i];
                    this.renderMessage(message);
                }
                if (messages.length > 0) {
                    this.renderMessage({
                        user: 'Server',
                        message: 'End of messages from previous sessions. Begin new messages from this session.',
                        timestamp: (new Date()).getTime()
                    });
                } else {
                    this.renderMessage({
                        user: 'Server',
                        message: 'Welcome to the chat. Enter your username and messages below.',
                        timestamp: (new Date()).getTime()
                    });
                }

            },
            renderMessage: function (message) {

                var date = new Date(message.timestamp);
                var today = new Date();

                if (today.toDateString() === date.toDateString()) {
                    var timestamp = date.toLocaleTimeString();
                } else {
                    var timestamp = date.toDateString();
                }

                var leftCol = document.createElement('div');
                leftCol.className = 'col-md-9';
                if (message.user === 'Server') {
                    var user = '<span class="server-user">' + message.user + '</span>'
                } else if (message.user === Controller.user.getName()) {
                    var user = '<span class="local-user">' + message.user + '</span>'
                } else {
                    var user = message.user;
                }
                leftCol.innerHTML = user + ': ' + message.message;

                var rightCol = document.createElement('div');
                rightCol.className = 'col-md-3 text-right';
                rightCol.innerHTML = timestamp;

                var messageElement = document.createElement('div');
                messageElement.className = 'row';

                messageElement.appendChild(leftCol);
                messageElement.appendChild(rightCol);
                this.messages.appendChild(messageElement);
                this.messages.scrollTop = this.messages.scrollHeight;
            },
            clearMessageInput: function() {
                this.messageInput.value = '';
            },
            enableUsernameInput: function () {
                this.usernameInput.disabled = false;
            },
            disableUsernameInput: function () {
                this.usernameInput.disabled = true;
            },
            error: function (errorStr) {
                alert(errorStr);
            }
        }
    };


    var Controller = {
        init: function () {
            this.socket.init();
            Model.message.init();
            Model.user.init();
            View.chatroom.init();
        },
        socket: {
            init: function () {
                var Socket = "MozWebSocket" in window ? MozWebSocket : WebSocket;
                this.ws = new Socket("ws://localhost:8080/");

                this.ws.onmessage = function (evt) {
                    var message = JSON.parse(evt.data);
                    var createdMessage = Model.message.create(message.message, message.user, message.timestamp);
                    // enable username box if Server asks for a change.
                    if(createdMessage.user === 'Server' && createdMessage.message.indexOf('Please select a different username') >= 0) {
                        View.chatroom.enableUsernameInput();
                    }
                    View.chatroom.renderMessage(createdMessage);
                };
                this.ws.onclose = function (event) {
                    //console.log("Closed - code: " + event.code + ", reason: " + event.reason + ", wasClean: " + event.wasClean);
                };
                this.ws.onopen = function () {
                    //console.log("connected...");
                };
            },
            sendMessage: function (messageStr) {
                var userStr = Model.user.getName();
                if (userStr === '') {
                    View.chatroom.error('Username is required.');
                } else if (messageStr === '') {
                    View.chatroom.error('Message is required.');
                } else {
                    this.ws.send(JSON.stringify({
                        user: userStr,
                        message: messageStr
                    }));
                    View.chatroom.clearMessageInput();
                    View.chatroom.disableUsernameInput();
                }

            }
        },
        user: {
            update: function (username) {
                Model.user.setName(username);
            },
            getName: function () {
                return Model.user.getName();
            }
        }
    };

    Controller.init();
})();




## Simple-Chat-Room

### Motivation

This project was created for 
[Week 2 of Code Prompts](http://www.reddit.com/r/codeprompts/comments/377rgd/week_2_create_a_real_time_chat_room/).

The requirements were:
* Easy to use for an end-user.
* Must be real time, i.e. a user should not need to refresh.
* You may use any platform or programming language/method you desire.

### How to run
1. Clone the project.
2. From the project directory, run ``` bundle install ``` in the console to install the required Ruby Gems.
3. After the install is complete, run ```ruby server.rb``` to start the server.
4. Finally, open the index.html file in your browser.

That should get the project to run on your local environment. For production, you may have to change the hostname and port
in both the server.rb file and the app.js file.  
**app.js**    
``` this.ws = new Socket("ws://localhost:8080/"); ```  
**server.rb**   
``` EM::WebSocket.run(:host => "127.0.0.1", :port => 8080, :debug => false) do |ws| ```  

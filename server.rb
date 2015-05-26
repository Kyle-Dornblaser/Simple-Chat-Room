class Message
  def initialize(user, message)
    @user = user
    @message = message
    @timestamp = Time.now.to_i * 1000 # * 1000 because JavaScript needs milliseconds
  end

  def json
    {
        'user' => @user,
        'message' => @message,
        'timestamp' => @timestamp
    }.to_json
  end
end


require 'em-websocket'
require 'json'

@chatroom = EM::Channel.new
@users = []
@users[0] = 'Server'

EM.run {
  EM::WebSocket.run(:host => "127.0.0.1", :port => 8080, :debug => true) do |ws|

    ws.onopen {
      sid = @chatroom.subscribe { |msg| ws.send msg }
      #@chatroom.push "#{sid} connected!"

      ws.onmessage { |msg|
        msg = JSON.parse(msg)
        user = msg['user']
        if @users.include?(user) && @users.index(user) != sid
          ws.send Message.new('Server', "#{user} is already taken. Please select a different username.").json
        else
          @users[sid] = user
          @chatroom.push Message.new(user, msg['message']).json
        end

      }

      ws.onclose {
        @chatroom.unsubscribe(sid)
        if @users[sid]
          @chatroom.push Message.new('Server', "#{@users[sid]} has left.").json
          @users.delete_at(sid)
        end

      }

      ws.onerror { |e|
        @chatroom.push Message.new('Server', "Error: #{e.message}").json
      }
    }

  end
}




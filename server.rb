require 'em-websocket'
require 'json'

@chatroom = EM::Channel.new

EM.run {
  EM::WebSocket.run(:host => "127.0.0.1", :port => 8080, :debug => false) do |ws|

    ws.onopen {
      sid = @chatroom.subscribe { |msg| ws.send msg }
      #@chatroom.push "#{sid} connected!"

      ws.onmessage { |msg|
        msg = JSON.parse(msg, :symbolize_names => true)
        msg[:timestamp] = Time.now.to_i * 1000 # * 1000 because JavaScript needs milliseconds
        msg = JSON.generate(msg)
        @chatroom.push msg
      }

      ws.onclose {
        @chatroom.unsubscribe(sid)
      }

      ws.onerror { |e|
        @chatroom.push "Error: #{e.message}"
      }
    }
  end
}




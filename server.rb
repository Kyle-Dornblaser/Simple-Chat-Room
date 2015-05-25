require 'em-websocket'
require 'json'

@channel = EM::Channel.new

EM.run {
  EM::WebSocket.run(:host => "127.0.0.1", :port => 8080, :debug => false) do |ws|

    ws.onopen {
      sid = @channel.subscribe { |msg| ws.send msg }
      #@channel.push "#{sid} connected!"

      ws.onmessage { |msg|
        msg = JSON.parse(msg, :symbolize_names => true)
        @channel.push "#{msg[:username]}: #{msg[:message]}"
      }

      ws.onclose {
        @channel.push("You are being unsubscribed.")
        @channel.unsubscribe(sid)
      }

      ws.onerror { |e|
        @channel.push "Error: #{e.message}"
      }
    }
  end
}




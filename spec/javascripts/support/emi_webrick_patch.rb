require 'webrick'

module WEBrick
  class GenericServer
    @@handled_signal = false
    def handle_signal
      unless @@handled_signal
        @@handled_signal = true
        self.shutdown
      end
    end

    alias_method :__start__, :start
    def start(&block)
      Signal.trap("TERM") { handle_signal }
      Signal.trap("INT") { handle_signal }

      __start__(&block)
    end
  end
end

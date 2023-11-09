import io from "socket.io-client";

const socketUrl = "http://localhost:80";

const socket = io(socketUrl, {
  path: '/socket.io',
  transports: ['websocket']
});


export default socket;

export function emitEvent(event, data) {
  socket.emit(event, data);
}

export function setupSocketListeners(
  onMessage,
  onConnect,
  onDisconnect,
  onError
) {
  socket.on("connect", () => {
    onConnect();
  });

  socket.on("disconnect", () => {
    onDisconnect();
  });

  socket.on("error", (error) => {
    onError(error);
  });

  socket.on("message", (message) => {
    onMessage(message);
  });
}

import io from "socket.io-client";
const socketUrl = process.env.VUE_APP_SOCKET_IO_URL || "ws://localhost:8080";
const socket = io(socketUrl);

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

import io from "socket.io-client";

const socketUrl = "ws://notification-service-service.default.svc:80";

const socket = io(socketUrl, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
});

export default socket;

export function emitEvent(event, data) {
  socket.emit(event, data);
}

export function setupSocketListeners(
  onNewNotification,
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

  socket.on("new-notification", (data) => {
    onNewNotification(data);
  });
}

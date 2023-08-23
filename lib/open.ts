export const open = async (socket: WebSocket) => {
    if (socket.readyState === WebSocket.OPEN) {
        return;
    }

    if (socket.readyState === WebSocket.CLOSED) {
        throw new Error("Socket is closed");
    }

    if (socket.readyState === WebSocket.CLOSING) {
        throw new Error("Socket is closing");
    }

    await new Promise<void>((resolve, reject) => {
        const onOpen = () => {
            socket.removeEventListener("open", onOpen);
            socket.removeEventListener("error", onError);

            resolve();
        };

        const onError = (event: ErrorEvent | Event) => {
            socket.removeEventListener("open", onOpen);
            socket.removeEventListener("error", onError);

            reject(event);
        };

        socket.addEventListener("open", onOpen);
        socket.addEventListener("error", onError);
    });
};

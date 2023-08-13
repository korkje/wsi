export const open = async (socket: WebSocket) => {
    if (socket.readyState === WebSocket.OPEN) {
        return;
    }

    await new Promise((resolve, reject) => {
        socket.onopen = resolve;
        socket.onerror = reject;
    });
};

export const open = async (socket: WebSocket) => {
    await new Promise((resolve, reject) => {
        socket.onopen = resolve;
        socket.onerror = reject;
    });
};

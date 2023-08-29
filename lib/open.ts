export const open = (socket: WebSocket) =>
    new Promise<void>((resolve, reject) => {
        if (socket.readyState === WebSocket.OPEN) {
            return resolve();
        }
        else if (socket.readyState === WebSocket.CLOSED) {
            return reject(new Error("Socket is closed"));
        }
        else if (socket.readyState === WebSocket.CLOSING) {
            return reject(new Error("Socket is closing"));
        }

        const removeEventListeners = () => {
            socket.removeEventListener("open", onOpen);
            socket.removeEventListener("close", onClose);
            socket.removeEventListener("error", onError);
        };

        const onOpen = () => {
            removeEventListeners();
            resolve();
        };

        const onClose = (event: CloseEvent) => {
            removeEventListeners();
            reject(event);
        }

        const onError = (event: ErrorEvent | Event) => {
            removeEventListeners();
            reject(event);
        };

        socket.addEventListener("open", onOpen);
        socket.addEventListener("close", onClose);
        socket.addEventListener("error", onError);
    });

type Resolver = (event: MessageEvent) => void;
type Rejecter = (event: CloseEvent | ErrorEvent | Event) => void;

export async function* iterable(socket: WebSocket) {
    if (socket.readyState === WebSocket.CLOSED) {
        return;
    }
    else if (socket.readyState === WebSocket.CLOSING) {
        return;
    }
    else if (socket.readyState === WebSocket.CONNECTING) {
        await new Promise((resolve, reject) => {
            socket.onopen = resolve;
            socket.onerror = reject;
        });
    }

    const events: MessageEvent[] = [];
    const resolvers: Resolver[] = [];
    let rejecter: Rejecter;

    socket.onmessage = event => resolvers.length > 0
        ? resolvers.shift()!(event)
        : events.push(event);

    socket.onclose = event => rejecter(event);
    socket.onerror = event => rejecter(event);

    try {
        while (true) {
            if (events.length > 0) {
                yield events.shift()!;
            }
            else {
                yield new Promise<MessageEvent>((resolve, reject) => {
                    resolvers.push(resolve);
                    rejecter = reject;
                });
            }
        }
    }
    catch (error) {
        if (error instanceof CloseEvent) {
            return;
        }

        throw error;
    }
    finally {
        socket.onmessage = null;
        socket.onclose = null;
        socket.onerror = null;

        if (socket.readyState === WebSocket.OPEN) {
            socket.close();
        }
    }
}

export default iterable;

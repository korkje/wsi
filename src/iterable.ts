type Resolver = (event: MessageEvent) => void;
type Rejecter = (event: CloseEvent | ErrorEvent | Event) => void;

export async function* iterable(socket: WebSocket) {
    await new Promise((resolve, reject) => {
        socket.onopen = resolve;
        socket.onerror = reject;
    });

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
        else {
            throw error;
        }
    }
    finally {
        socket.onmessage = null;
        socket.onclose = null;
        socket.onerror = null;

        socket.close();
    }
}

export default iterable;

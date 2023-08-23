import { FIFO } from "./deps.ts";

type Resolver = (event: MessageEvent) => void;
type Rejecter = (event: CloseEvent | ErrorEvent | Event) => void;

export async function* iterable(socket: WebSocket) {
    if (socket.readyState === WebSocket.CLOSED) {
        throw new Error("Socket is closed");
    }
    else if (socket.readyState === WebSocket.CLOSING) {
        throw new Error("Socket is closing");
    }

    // deno-lint-ignore no-explicit-any
    const messages = new FIFO<any>();

    let resolver: Resolver | undefined;
    let rejecter: Rejecter | undefined;

    const executor = (resolve: Resolver, reject: Rejecter) => {
        resolver = resolve;
        rejecter = reject;
    };

    const onMessage = ({ data }: MessageEvent) => resolver
        ? (resolver(data), resolver = undefined)
        : messages.push(data);

    const onClose = (event: CloseEvent) => rejecter?.(event);
    const onError = (event: ErrorEvent | Event) => rejecter?.(event);

    socket.addEventListener("message", onMessage);
    socket.addEventListener("close", onClose);
    socket.addEventListener("error", onError);

    try {
        while (true) {
            yield messages.length > 0
                ? messages.shift()!
                : new Promise(executor);
        }
    }
    catch (error) {
        while (messages.length > 0) {
            yield messages.shift()!;
        }

        if (error instanceof CloseEvent) {
            return;
        }

        throw error;
    }
    finally {
        socket.removeEventListener("message", onMessage);
        socket.removeEventListener("close", onClose);
        socket.removeEventListener("error", onError);

        if (socket.readyState === WebSocket.OPEN) {
            socket.close();
        }
    }
}

export default iterable;

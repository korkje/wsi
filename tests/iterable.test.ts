import { assertEquals } from "./deps.ts";
import iterable from "../lib/iterable.ts";

const NUM_MESSAGES = 100_000;

Deno.serve(request => {
    const { socket, response } = Deno.upgradeWebSocket(request);

    socket.onopen = async () => {
        for (let i = 0; i < NUM_MESSAGES; ++i) {
            if (socket.readyState !== WebSocket.OPEN) {
                break;
            }
            socket.send(i.toString());
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        socket.close();
    };

    return response;
});

Deno.test("receives all messages", async () => {
    const socket = new WebSocket("ws://localhost:8000/ws");
    const messages: string[] = [];

    for await (const data of iterable(socket)) {
        messages.push(data);
    }

    assertEquals(socket.readyState, WebSocket.CLOSED);

    assertEquals(messages.length, NUM_MESSAGES);

    const numbers = messages.map(Number);
    const inOrder = numbers.every((n, i) => n === i);

    assertEquals(inOrder, true);
});

Deno.test("closes on error", async () => {
    const socket = new WebSocket("ws://localhost:8000/ws");
    const messages: string[] = [];

    const error = new Error();
    let thrown: Error | undefined;

    try {
        for await (const data of iterable(socket)) {
            messages.push(data);

            if (messages.length === 10) {
                throw error;
            }
        }
    }
    catch (e) {
        thrown = e;
    }

    assertEquals(thrown, error);
    assertEquals(socket.readyState, WebSocket.CLOSING);
    assertEquals(messages.length, 10);

    const numbers = messages.map(Number);
    const inOrder = numbers.every((n, i) => n === i);

    assertEquals(inOrder, true);
});

import { assertEquals } from "https://deno.land/std@0.197.0/testing/asserts.ts";
import Router from "https://deno.land/x/rp1@v0.1.4/mod.ts";
import { iterable } from "./iterable.ts";

const NUM_MESSAGES = 100_000;

const router = new Router();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const gattling = async (socket: WebSocket) => {
    for (let i = 0; i < NUM_MESSAGES; ++i) {
        if (socket.readyState !== WebSocket.OPEN) {
            break;
        }
        socket.send(i.toString());
        await sleep(0);
    }

    socket.close();
};

router.get("/ws", ({ request }) => {
    const { socket, response } = Deno.upgradeWebSocket(request);

    socket.onopen = () => gattling(socket);

    return response;
});

Deno.serve({ port: 9001 }, router.handle);

Deno.test("receives all messages", async () => {
    const socket = new WebSocket("ws://localhost:9001/ws");
    const messages: string[] = [];

    for await (const event of iterable(socket)) {
        messages.push(event.data);
    }

    assertEquals(socket.readyState, WebSocket.CLOSED);

    assertEquals(messages.length, NUM_MESSAGES);

    const numbers = messages.map(Number);
    const inOrder = numbers.every((n, i) => n === i);

    assertEquals(inOrder, true);
});

Deno.test("closes on error", async () => {
    const socket = new WebSocket("ws://localhost:9001/ws");
    const messages: string[] = [];

    const testError = new Error();

    try {
        for await (const event of iterable(socket)) {
            messages.push(event.data);
            if (messages.length === 10) {
                throw testError;
            }
        }
    }
    catch (error) {
        assertEquals(error, testError);
    }

    assertEquals(socket.readyState, WebSocket.CLOSING);

    assertEquals(messages.length, 10);

    const numbers = messages.map(Number);
    const inOrder = numbers.every((n, i) => n === i);

    assertEquals(inOrder, true);
});

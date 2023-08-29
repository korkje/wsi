import { assertEquals, assertRejects } from "./deps.ts";
import { open } from "../lib/open.ts";

const closed = (socket: WebSocket) => new Promise<void>(resolve => {
    if (socket.readyState === WebSocket.CLOSED) {
        return resolve();
    }

    const onClose = () => {
        socket.removeEventListener("close", onClose);
        resolve();
    };

    socket.addEventListener("close", onClose);
});

Deno.serve(request => {
    const { socket, response } = Deno.upgradeWebSocket(request, { idleTimeout: 0 });

    socket.onmessage = ({ data }) => {
        socket.send(data);
    };

    return response;
});

Deno.test("Waits for open", async () => {
    const socket = new WebSocket("ws://localhost:8000");
    assertEquals(socket.readyState, WebSocket.CONNECTING);

    await open(socket);
    assertEquals(socket.readyState, WebSocket.OPEN);

    socket.close();

    // Prevent leaking async ops
    await closed(socket);
});

Deno.test("Throws on closing", async () => {
    const socket = new WebSocket("ws://localhost:8000");

    socket.close();
    assertEquals(socket.readyState, WebSocket.CLOSING);

    await assertRejects(() => open(socket));

    // Prevent leaking async ops
    await closed(socket);
});

Deno.test("Throws on closed", async () => {
    const socket = new WebSocket("ws://localhost:8000");

    socket.close();
    await new Promise<void>(resolve => socket.onclose = () => resolve());

    assertEquals(socket.readyState, WebSocket.CLOSED);

    await assertRejects(() => open(socket));

    // Prevent leaking async ops
    await closed(socket);
});

Deno.test("Throws on error", async () => {
    const socket = new WebSocket("ws://localhost:8001");

    assertEquals(socket.readyState, WebSocket.CONNECTING);

    await assertRejects(() => open(socket));

    // Prevent leaking async ops
    await closed(socket);
});

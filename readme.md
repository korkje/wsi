# wsi

Asynchronously iterate over `WebSocket` events.

```ts
import iterable from "https://deno.land/x/wsi/mod.ts";

const socket = new WebSocket("wss://echo.websocket.events");

for await (const data of iterable(socket)) {
    console.log(data);
    socket.send("hello");
}
```

Also exports `open`, which creates a `Promise` that resolves when the socket opens.

```ts
import iterable, { open } from "https://deno.land/x/wsi/mod.ts";

const socket = new WebSocket("wss://echo.websocket.events");

await open(socket); // Socket is open

socket.send("hello");

for await (const data of iterable(socket)) {
    console.log(data);
    socket.send("hello");
}

```

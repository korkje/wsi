# wsi
Asynchronously iterate over `WebSocket` events.

```ts
import iterable from "https://deno.land/x/wsi/mod.ts";

const socket = new WebSocket("wss://echo.websocket.events");

for await (const event of iterable(socket)) {
    console.log(event.data);
    socket.send("hello");
}
```

import { Hono, Middleware } from "deps";


const app = new Hono();

app.use("*", Middleware.cors())
app.get("/", (c) => c.text("Hello Deno!"));

Deno.serve(app.fetch);
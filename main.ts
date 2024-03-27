import { Hono } from 'hono/mod.ts';
import { cors } from 'hono/middleware.ts';
import listingRouter from "@/controllers/Listing.ts";

const app = new Hono();

app.use('*', cors());

app.get('/', c => c.text('Hello Deno!'));

app.route('/listing', listingRouter);


Deno.serve(app.fetch);

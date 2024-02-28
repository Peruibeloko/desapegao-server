import { Hono, cors } from 'deps';
import listingRouter from './controllers/Listing.controller.ts';

const app = new Hono();

app.use('*', cors());

app.get('/', c => c.text('Hello Deno!'));

app.route('/listing', listingRouter);

Deno.serve(app.fetch);

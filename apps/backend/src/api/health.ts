import { Hono } from 'hono';

const health = new Hono().get('/', (c) => c.json({ message: 'Health ok!' }));

export default health;

import express from 'express';

const { PORT } = process.env;

const app = express();

app.get('/', (_req, res) => {
  res.send('Hello world!');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

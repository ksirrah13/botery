import express from 'express';

const PORT = 3000;

const app = express();

app.get('/', (_req, res) => {
  res.send('Hello world!');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

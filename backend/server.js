require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// middlewares
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: ["https://realeza.company", "http://localhost:3000"],
    credentials: true,
  })
);
app.options('*', cors());

// rotas publicas
app.get("/", (req, res) => {
  res.send("Bem-vindo à página principal");
});



// rotas privadas



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
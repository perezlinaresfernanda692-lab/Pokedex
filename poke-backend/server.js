import express from 'express';
import cors from 'cors';
import pokeRoutes from './src/routes/poke.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = 'https://pokeapi.co/api/v2';

app.use(cors());
app.use(express.json());

app.use('/api', pokeRoutes);

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

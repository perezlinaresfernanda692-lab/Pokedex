import { Router } from 'express';
import { getPokemons } from '../controllers/poke.controller.js';


const router = Router();

router.get('/pokemons', getPokemons);

export default router;
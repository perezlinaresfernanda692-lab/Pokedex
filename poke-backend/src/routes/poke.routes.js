import { Router } from 'express';
import { getPokemons, getPokemonsDetail } from '../controllers/poke.controller.js';


const router = Router();

router.get('/pokemons', getPokemons);
router.get('/pokemon/:identifier', getPokemonsDetail);

export default router;
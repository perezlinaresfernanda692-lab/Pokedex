
export const getPokemons = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const offset = parseInt(req.query.offset) || 0;
    const { name, id, type } = req.query;

    //  Helper: obtener info base de un Pokémon
    const fetchPokemon = async (identifier) => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier.toLowerCase()}`);
      if (!response.ok) throw new Error('Pokémon no encontrado');
      const data = await response.json();
      // console.log("data", data);
      return {
        id: data.id,
        name: data.name,
        sprite: data.sprites.other['official-artwork'].front_default,
        types: data.types.map(t => t.type.name),
      };
    };

    //  Filtro por ID o nombre (mismo endpoint)
    if (id || name) {
      const query = id || name;
      const pokemon = await fetchPokemon(query);
      return res.json({ ok: true, results: [pokemon] });
    }

    //  Filtro por tipo
    if (type) {
      const typeRes = await fetch(`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`);
      if (!typeRes.ok) throw new Error('Tipo no encontrado');
      const typeData = await typeRes.json();

      const pokemonsSlice = typeData.pokemon.slice(offset, offset + limit);
      const results = await Promise.all(
        pokemonsSlice.map(p => fetchPokemon(p.pokemon.name))
      );

      return res.json({
        ok: true,
        total: typeData.pokemon.length,
        offset,
        limit,
        results,
      });
    }

    //  Sin filtros → lista paginada
    const listRes = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    const listData = await listRes.json();

    const results = await Promise.all(
      listData.results.map(p => fetchPokemon(p.name))
    );

    return res.json({
      ok: true,
      offset,
      limit,
      total: listData.count,
      next: listData.next,
      previous: listData.previous,
      results,
    });

  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

//Obtener detalles completos de un pokemon 

export const getPokemonsDetail = async (req,res) => {
  try {
    const {identifier} = req.params;

    const response =await fetch( `https://pokeapi.co/api/v2/pokemon/${identifier.toLowerCase()}`); 
    if(!response.ok) throw new Error('Pokémon no encontrado');

    const data = await response.json();

    //obteniendo información de especies
    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();

    const description = speciesData.flavor_text_entries.find(
      entry => entry.language.name === 'es'
    )?.flavor_text.replace( /\f/g, ' ')  || 'Descripción no disponible';

    const detail = {
      id: data.id,
      name: data.name,
      sprite: data.sprites.other['official-artwork'].front_default,
      spriteShiny: data.sprites.other['official-artwork'].front_shiny,
      types: data.types.map(t => ({
        name: t.type.name,
        slot: t.slot
      })),

      height: data.height /10,
      weight: data.weight / 10,
      abilities: data.abilities.map( a => ({
        name: a.ability.name,
        hidden: a.is_hidden
      })),
      stats: data.stats.map(s=> ({
        name: s.stat.name,
        value: s.base_stat
      })),
      description,
      category: speciesData.genera.find(g => g.language.name === 'es')?.genus || 'Desconocido',

    };

    res.json({ 
      ok:true,
      data:detail
    });
  } catch (err) {
    res.status(500).json({
      ok:false,
      message:err.message
    
    });
  }
};

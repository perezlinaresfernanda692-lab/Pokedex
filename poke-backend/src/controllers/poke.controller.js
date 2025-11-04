
export const getPokemons = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const offset = parseInt(req.query.offset) || 0;
    const { name, id, type } = req.query;

    // 🔹 Helper: obtener info base de un Pokémon
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

    // 🔹 Filtro por ID o nombre (mismo endpoint)
    if (id || name) {
      const query = id || name;
      const pokemon = await fetchPokemon(query);
      return res.json({ ok: true, results: [pokemon] });
    }

    // 🔹 Filtro por tipo
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

    // 🔹 Sin filtros → lista paginada
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

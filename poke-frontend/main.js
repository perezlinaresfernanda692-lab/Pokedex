const container = document.getElementById('pokemon-container');

// Botones de paginación
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const firstBtn = document.getElementById('first');
const lastBtn = document.getElementById('last');

// Acciones de filtrado
const nameInput = document.getElementById('nameFilter');
const idInput = document.getElementById('idFilter');
const typeSelect = document.getElementById('typeFilter');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');

let offset = 0;
const limit = 15;
let totalPokemons = 0;

async function getPokemons() {
    try {
        let url = `http://localhost:3000/api/pokemons?offset=${offset}&limit=${limit}`;

        if (nameInput.value.trim()) url += `&name=${nameInput.value.trim().toLowerCase()}`;
        if (idInput.value.trim()) url += `&id=${idInput.value.trim()}`;
        if (typeSelect.value) url += `&type=${typeSelect.value}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.ok) throw new Error('Error al obtener Pokémon');

        totalPokemons = data.total; // guardar el total de Pokémon
        console.log(data);

        container.innerHTML = '';

        data.results.forEach(p => {
            const card = document.createElement('div');
            card.className = 'bg-white shadow-lg rounded-2xl p-4 text-center hover:scale-105 transition-transform';
            card.innerHTML = `
        <img src="${p.sprite ? p.sprite : './assets/images/avatar-default.png'}" alt="${p.name}" class="mx-auto w-32 h-32">
        <h2 class="text-xl font-semibold capitalize mt-2">${p.name}</h2>
        <p class="text-gray-600">Tipo: ${p.types.map(t => t).join(', ')}</p>
      `;
            container.appendChild(card);
        });

        // Deshabilitar botones según sea necesario
        prevBtn.disabled = offset === 0;
        nextBtn.disabled = offset + limit >= totalPokemons;
        firstBtn.disabled = offset === 0;
        lastBtn.disabled = offset + limit >= totalPokemons;

    } catch (error) {
        console.error('Error al obtener los Pokémon:', error);
    }
}

// Eventos de los botones
prevBtn.addEventListener('click', () => {
    if (offset >= limit) {
        offset -= limit;
        getPokemons();
    }
});

nextBtn.addEventListener('click', () => {
    offset += limit;
    getPokemons();
});

firstBtn.addEventListener('click', () => {
    offset = 0;
    getPokemons();
});

lastBtn.addEventListener('click', () => {
    // Calcular offset para la última página
    offset = Math.floor((totalPokemons - 1) / limit) * limit;
    getPokemons();
});

searchBtn.addEventListener('click', () => {
    offset = 0;
    getPokemons();
});

clearBtn.addEventListener('click', () => {
    nameInput.value = '';
    idInput.value = '';
    typeSelect.value = '';
    offset = 0;
    getPokemons();
});

// Cargar al inicio
getPokemons();

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

// Modal
const modal = document.getElementById('pokemonModal');
const closeModalBtn = document.getElementById('closeModal');

let offset = 0;
const limit = 15;
let totalPokemons = 1302;

// Colores por tipo 
const typeColors = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    grass: 'bg-green-500',
    electric: 'bg-yellow-400',
    ice: 'bg-blue-200',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-300',
    psychic: 'bg-pink-500',
    bug: 'bg-green-400',
    rock: 'bg-yellow-700',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-600',
    dark: 'bg-gray-700',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300'
};

// Nombres de stats
const statNames = {
    hp: 'PS',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'At. Esp.',
    'special-defense': 'Def. Esp.',
    speed: 'Velocidad'
};

async function getPokemons() {
    try {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500">Cargando pokémon...</p>';

        let url = `http://localhost:3000/api/pokemons?offset=${offset}&limit=${limit}`;

        if (nameInput.value.trim()) url += `&name=${nameInput.value.trim().toLowerCase()}`;
        if (idInput.value.trim()) url += `&id=${idInput.value.trim()}`;
        if (typeSelect.value) url += `&type=${typeSelect.value}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.ok || !data.results || data.results.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-red-500">No se encontraron pokémon</p>';
            return;
        }

        totalPokemons = data.total || 1302;
        container.innerHTML = '';

        data.results.forEach(p => {
            const card = document.createElement('div');
            card.className = 'bg-white shadow-lg rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer';
            card.onclick = () => showPokemonDetail(p.name);

            card.innerHTML = `
                <img src="${p.sprite || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'}" 
                     alt="${p.name}" 
                     class="mx-auto w-32 h-32 object-contain"
                     onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'">
                <h2 class="text-xl font-semibold capitalize mt-2">${p.name}</h2>
                <p class="text-sm text-gray-500">#${String(p.id).padStart(3, '0')}</p>
                <p class="text-gray-600 text-sm mt-1">
                    ${p.types.map(t => `<span class="inline-block ${typeColors[t] || 'bg-gray-400'} text-white rounded-full px-3 py-1 text-xs mr-1 capitalize">${t}</span>`).join('')}
                </p>
            `;
            container.appendChild(card);
        });

        updatePaginationButtons();

    } catch (error) {
        console.error('Error al obtener los Pokémon:', error);
        container.innerHTML = `<p class="col-span-full text-center text-red-500">Error: ${error.message}</p>`;
    }
}

async function showPokemonDetail(identifier) {
    try {
        modal.classList.remove('hidden');
        document.getElementById('modalName').textContent = 'Cargando...';

        const res = await fetch(`http://localhost:3000/api/pokemon/${identifier}`);
        const data = await res.json();

        if (!data.ok) {
            alert('Error al cargar detalles del Pokémon');
            modal.classList.add('hidden');
            return;
        }

        const pokemon = data.data;

        // Información básica
        document.getElementById('modalName').textContent = pokemon.name;
        document.getElementById('modalCategory').textContent = pokemon.category;
        document.getElementById('modalId').textContent = `#${String(pokemon.id).padStart(3, '0')}`;
        document.getElementById('modalSprite').src = pokemon.sprite;
        document.getElementById('modalHeight').textContent = `${pokemon.height} m`;
        document.getElementById('modalWeight').textContent = `${pokemon.weight} kg`;
        document.getElementById('modalDescription').textContent = pokemon.description;

        // Tipos
        const typesContainer = document.getElementById('modalTypes');
        typesContainer.innerHTML = pokemon.types.map(t => 
            `<span class="inline-block ${typeColors[t.name] || 'bg-gray-400'} text-white rounded-full px-4 py-2 text-sm font-semibold capitalize">${t.name}</span>`
        ).join('');

        // Habilidades
        const abilitiesContainer = document.getElementById('modalAbilities');
        abilitiesContainer.innerHTML = pokemon.abilities.map(a => 
            `<span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm capitalize ${a.hidden ? 'border-2 border-purple-500' : ''}">${a.name.replace('-', ' ')}${a.hidden ? ' 🔒' : ''}</span>`
        ).join('');

        // Estadísticas
        const statsContainer = document.getElementById('modalStats');
        statsContainer.innerHTML = pokemon.stats.map(s => {
            const percentage = (s.value / 255) * 100;
            return `
                <div>
                    <div class="flex justify-between mb-1">
                        <span class="text-sm font-medium text-gray-700">${statNames[s.name] || s.name}</span>
                        <span class="text-sm font-bold text-gray-900">${s.value}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `; 
        }).join('');

    } catch (error) {
        console.error('Error al cargar detalles:', error);
        alert('Error al cargar detalles del Pokémon');
        modal.classList.add('hidden');
    }
}

function updatePaginationButtons() {
    const isFirstPage = offset === 0;
    const isLastPage = offset + limit >= totalPokemons;

    prevBtn.disabled = isFirstPage;
    firstBtn.disabled = isFirstPage;
    nextBtn.disabled = isLastPage;
    lastBtn.disabled = isLastPage;
}

// Eventos de paginación
prevBtn.addEventListener('click', () => {
    if (offset >= limit) {
        offset -= limit;
        getPokemons();
    }
});

nextBtn.addEventListener('click', () => {
    if (offset + limit < totalPokemons) {
        offset += limit;
        getPokemons();
    }
});

firstBtn.addEventListener('click', () => {
    offset = 0;
    getPokemons();
});

lastBtn.addEventListener('click', () => {
    offset = Math.floor((totalPokemons - 1) / limit) * limit;
    getPokemons();
});

// Eventos de búsqueda
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

// Enter en inputs
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        offset = 0;
        getPokemons();
    }
});

idInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        offset = 0;
        getPokemons();
    }
});

// Cerrar modal
closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Cerrar modal al hacer clic fuera
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

// Cerrar modal con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        modal.classList.add('hidden');
    }
});

// Cargar al inicio
getPokemons();
//Script de JS para integracion con API

const main_url = 'https://swapi.info/api';

// Mapeo entre las categorías de tu HTML y los endpoints de SWAPI
const recursos = {
    starships: "https://swapi.info/api/starships",
    species: "https://swapi.info/api/species",
    planets: "https://swapi.info/api/planets",
    films: "https://swapi.info/api/films",
    people: "https://swapi.info/api/people",
};

// Mapeo entre data-resource y los IDs de las cards en el DOM
const contenedores_del_DOM = {
    starships: 'naves',
    species: 'especies',
    planets: 'planetas',
    films: 'peliculas',
    people: 'personajes'
};

// Estado global de la app
let currentData = [];
let currentResource = 'starships';

// 2. Función para consumir la API
async function fetchResource(resource) {
    try {
        const url = recursos[resource];
        if (!url) throw new Error(`Recurso no válido: ${resource}`);
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        return await response.json();
    } catch (error) {
        console.error('Error al consultar SWAPI:', error);
        return [];
    }
}

// 3. Renderizado de Datos
function renderCards(data, resource) {
    // Limpiar contenedores previos
    Object.values(contenedores_del_DOM).forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            // Preservar solo la cabecera de la categoría
            const categoryHeader = container.querySelector('.category');
            container.innerHTML = '';
            if (categoryHeader) container.appendChild(categoryHeader);
        }
    });

    const targetId = contenedores_del_DOM[resource];
    const targetContainer = document.getElementById(targetId);

    if (!targetContainer) return;

    if (data.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = 'No se encontraron resultados.';
        emptyMsg.className = 'empty-message';
        targetContainer.appendChild(emptyMsg);
        return;
    }

    // Generar las tarjetas para el contenedor activo
    const fragment = document.createDocumentFragment();

    data.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card flip-card';

        const titleText = item.name || item.title || 'Sin nombre';

        let detailsHTML = '';
        if (resource === 'people') {
            detailsHTML = `<p><strong>Color de Piel:</strong> ${item.skin_color || 'N/D'}</p><p><strong>Altura:</strong> ${item.height || 'N/D'} cm</p><p><strong>Género:</strong> ${item.gender || 'N/D'}</p>`;
        } else if (resource === 'starships') {
            detailsHTML = `<p><strong>Modelo:</strong> ${item.model || 'N/D'}</p><p><strong>Clase:</strong> ${item.starship_class || 'N/D'}</p>`;
        } else if (resource === 'species') {
            detailsHTML = `<p><strong>Clasificación:</strong> ${item.classification || 'N/D'}</p><p><strong>Idioma:</strong> ${item.language || 'N/D'}</p><p><strong>Estatura Promedio:</strong> ${item.average_height || 'N/D'}</p><p><strong>Color de Piel:</strong> ${item.skin_colors || 'N/D'}</p>`;
        } else if (resource === 'films') {
            detailsHTML = `<p><strong>Director:</strong> ${item.director || 'N/D'}</p><p><strong>Lanzamiento:</strong> ${item.release_date || 'N/D'}</p><p><strong>Productor:</strong> ${item.producer || 'N/D'}</p>`;
        } else if (resource === 'planets') {
            detailsHTML = `<p><strong>Gravedad:</strong> ${item.gravity || 'N/D'}</p><p><strong>Terreno:</strong> ${item.terrain || 'N/D'}</p><p><strong>Poblacion:</strong> ${item.population || 'N/D'}</p><p><strong>Clima:</strong> ${item.climate || 'N/D'}</p>`;
        }

        itemCard.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-face flip-card-front">
                    <h3>${titleText}</h3>
                    <p class="flip-hint">Haz clic para ver más</p>
                </div>
                <div class="flip-card-face flip-card-back">
                    <h3>${titleText}</h3>
                    <div class="card-details">
                        ${detailsHTML}
                    </div>
                </div>
            </div>
        `;

        itemCard.addEventListener('click', () => {
            itemCard.classList.toggle('is-flipped');
        });

        fragment.appendChild(itemCard);
    });

    targetContainer.appendChild(fragment);
}

// Lógica de Filtrado y Ordenamiento
function filterAndSortData() {
    const searchTerm = document.getElementById('search').value.toLowerCase().trim();
    const sortValue = document.getElementById('sort').value;

    let filtered = currentData.filter(item => {
        const name = (item.name || item.title || '').toLowerCase();
        return name.includes(searchTerm);
    });

    // Ordenar resultados
    filtered.sort((a, b) => {
        const nameA = (a.name || a.title || '').toLowerCase();
        const nameB = (b.name || b.title || '').toLowerCase();

        if (sortValue === 'name-asc') return nameA.localeCompare(nameB);
        if (sortValue === 'name-desc') return nameB.localeCompare(nameA);
        if (sortValue === 'height-desc') return (parseInt(b.height) || 0) - (parseInt(a.height) || 0);
        if (sortValue === 'height-asc') return (parseInt(a.height) || 0) - (parseInt(b.height) || 0);
        return 0;
    });

    renderCards(filtered, currentResource);
}

function setupSectionInteractions() {
    document.querySelectorAll('h1.tipo').forEach((heading) => {
        const cardContainer = heading.nextElementSibling;

        if (!cardContainer || !cardContainer.classList.contains('card')) {
            return;
        }

        const backButton = document.createElement('button');
        backButton.type = 'button';
        backButton.className = 'back-to-top';
        backButton.textContent = 'Back to #naves';
        backButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const firstSection = document.getElementById('naves');
            if (firstSection) {
                firstSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        heading.appendChild(backButton);

        heading.addEventListener('click', (event) => {
            if (event.target.closest('.back-to-top')) {
                return;
            }

            cardContainer.classList.toggle('is-collapsed');
            heading.classList.toggle('is-collapsed', cardContainer.classList.contains('is-collapsed'));
        });
    });
}

// 5. Carga de Recurso y Event Listeners
async function loadResource(resource) {
    currentResource = resource;
    currentData = await fetchResource(resource);
    filterAndSortData();
}

document.addEventListener('DOMContentLoaded', () => {
    setupSectionInteractions();

    const menu = document.getElementById('menu');
    const menuToggle = document.getElementById('menu-toggle');

    if (menu) {
        menu.addEventListener('click', (e) => {
            if (e.target.classList.contains('boton')) {
                e.preventDefault();
                const resource = e.target.getAttribute('data-resource');
                if (resource) loadResource(resource);
            }
        });
    }

    if (menuToggle && menu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    // Eventos de la barra de búsqueda y ordenamiento
    document.getElementById('search').addEventListener('input', filterAndSortData);
    document.getElementById('sort').addEventListener('change', filterAndSortData);

    // Carga inicial por defecto
    loadResource('starships');
});
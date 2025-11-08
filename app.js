// Data source configuration
const DATA_SOURCES = {
    konvensional: {
        name: 'Konvensional',
        dataFile: 'data_konvensional.geojson',
        color: '#3388ff'
    },
    nonKonvensional: {
        name: 'Non Konvensional',
        dataFile: 'data_non_konvensional.geojson',
        color: '#ff6b6b'
    }
};

// Indonesia center coordinates
const INDONESIA_CENTER = [-0.7893, 113.9213];
const INITIAL_ZOOM = 5;

let map;
let geoJsonLayers = {
    konvensional: null,
    nonKonvensional: null
};

/**
 * Initialize the map with Mapbox
 */
async function initMap() {
    try {
        // Set Mapbox access token
        mapboxgl.accessToken = 'pk.eyJ1IjoicHVqYTkzIiwiYSI6ImNtaHFsNzgxdTBzMm8ybHIxODA0djE5eXUifQ.UietOmI0-h8waYOoAsqOLQ';

        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [INDONESIA_CENTER[1], INDONESIA_CENTER[0]], // Mapbox uses [lng, lat]
            zoom: INITIAL_ZOOM,
            pitch: 0,
            bearing: 0
        });

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl());

        // Wait for map to load before adding layers
        map.on('load', () => {
            loadAllData();
        });
    } catch (error) {
        console.error('Error initializing map:', error);
        alert('Failed to initialize map. Check console for details.');
    }
}

/**
 * Load data from local GeoJSON files
 */
async function fetchData(source) {
    const config = DATA_SOURCES[source];

    try {
        console.log(`Loading ${source} data from local file...`);
        const response = await fetch(config.dataFile);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const geojsonData = await response.json();
        console.log(`Successfully loaded ${source} data`);
        return geojsonData;
    } catch (error) {
        console.error(`Error loading ${source} data:`, error);
        throw error;
    }
}

/**
 * Color mapping by status
 */
const STATUS_COLORS = {
    'EXPLORATION': '#FFD700',    // Yellow/Gold
    'DEVELOPMENT': '#ff6b6b',     // Red
    'PRODUCTION': '#3388ff'        // Blue
};

/**
 * Get color based on status
 */
function getColorByStatus(status) {
    return STATUS_COLORS[status] || '#888888'; // Gray fallback
}

/**
 * Style function for GeoJSON features
 */
function getFeatureStyle(feature) {
    const status = feature.properties.status;
    return {
        color: getColorByStatus(status),
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.4
    };
}

/**
 * Property label mapping for better display
 */
const PROPERTY_LABELS = {
    'objectid': 'Object ID',
    'namobj': 'Nama Wilayah Kerja',
    'oprblk': 'Operator Wilayah Kerja',
    'effdat': 'Tanggal Efektif Kontrak Kerja Sama',
    'expdat': 'Tanggal Berakhir Kontrak Kerja Sama',
    'status': 'Status Wilayah Kerja',
    'srs_id': 'Spatial Reference System Identifier',
    'metadata': 'Metadata'
};

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp) {
    if (!timestamp || isNaN(timestamp)) return timestamp;
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Create popup content from feature properties
 */
function createPopupContent(feature, source) {
    const props = feature.properties;
    const title = props.namobj || 'Area Info';

    let content = `<div class="popup-wrapper">
        <div class="popup-header">${title}</div>
        <div class="popup-table">`;

    // Display all properties with formatted labels (skip objectid, namobj, and srs_id)
    for (const [key, value] of Object.entries(props)) {
        if (value !== null && value !== undefined && key !== 'namobj' && key !== 'objectid' && key !== 'srs_id') {
            const label = PROPERTY_LABELS[key] || key;
            const displayValue = (key === 'effdat' || key === 'expdat') ? formatDate(value) : value;

            content += `<div class="popup-row">
                <div class="popup-label">${label}</div>
                <div class="popup-value">${displayValue}</div>
            </div>`;
        }
    }

    content += `</div></div>`;
    return content;
}

/**
 * Add GeoJSON layer to map using Mapbox
 */
function addGeoJsonLayer(source, geojsonData) {
    const layerId = `${source}-fill`;
    const lineLayerId = `${source}-line`;

    // Remove existing layers if any
    if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
    }
    if (map.getLayer(lineLayerId)) {
        map.removeLayer(lineLayerId);
    }
    if (map.getSource(source)) {
        map.removeSource(source);
    }

    // Add source
    map.addSource(source, {
        type: 'geojson',
        data: geojsonData
    });

    // Add fill layer
    map.addLayer({
        id: layerId,
        type: 'fill',
        source: source,
        paint: {
            'fill-color': [
                'match',
                ['get', 'status'],
                'EXPLORATION', '#FFD700',
                'DEVELOPMENT', '#ff6b6b',
                'PRODUCTION', '#3388ff',
                '#888888'
            ],
            'fill-opacity': [
                'match',
                ['get', 'status'],
                'EXPLORATION', 0.7,
                'DEVELOPMENT', 0.55,
                'PRODUCTION', 0.55,
                0.4
            ]
        }
    });

    // Add line layer (border)
    map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: source,
        paint: {
            'line-color': [
                'match',
                ['get', 'status'],
                'EXPLORATION', '#FFD700',
                'DEVELOPMENT', '#ff6b6b',
                'PRODUCTION', '#3388ff',
                '#888888'
            ],
            'line-width': 2,
            'line-opacity': 0.8
        }
    });

    // Add click event to show popup
    map.on('click', layerId, (e) => {
        const feature = e.features[0];
        const popupContent = createPopupContent(feature, source);

        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map);
    });

    // Change cursor on hover
    map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
    });

    geoJsonLayers[source] = true;
}


/**
 * Load all data and display on map
 */
async function loadAllData() {
    try {
        // Fetch both data sources in parallel
        const [konvensionalData, nonKonvensionalData] = await Promise.all([
            fetchData('konvensional'),
            fetchData('nonKonvensional')
        ]);

        // Add layers to map
        addGeoJsonLayer('konvensional', konvensionalData);
        addGeoJsonLayer('nonKonvensional', nonKonvensionalData);

        console.log('All data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading map data. Please try again.');
    }
}

/**
 * Initialize the application
 */
function init() {
    initMap();
    // loadAllData() is called inside initMap() after map loads
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

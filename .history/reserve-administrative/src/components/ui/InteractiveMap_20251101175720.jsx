// src/components/ui/InteractiveMap.jsx - VERSION AVANCÉE
import { 
  Box, 
  Button, 
  HStack, 
  Text, 
  VStack, 
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  Badge,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  useToast,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { 
  FiMap, 
  FiTrash2, 
  FiLayers,
  FiDownload,
  FiSettings,
  FiMaximize,
  FiGrid,
  FiCrosshair,
  FiSquare,
  FiTarget,
  FiZoomIn,
  FiZoomOut
} from 'react-icons/fi';
import { APP_CONFIG } from '../../config/appConfig';
import * as turf from '@turf/turf';

const InteractiveMap = ({ 
  onZoneSelect, 
  initialZone = null, 
  readOnly = false, 
  existingZones = [], 
  reserves = [] 
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [zones, setZones] = useState(existingZones || []);
  const [tempMarker, setTempMarker] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const toast = useToast();

  // États pour les fonctionnalités avancées
  const [mapLayers, setMapLayers] = useState({
    satellite: false,
    terrain: true,
    roads: true,
    labels: true,
    borders: true
  });
  const [opacity, setOpacity] = useState(70);
  const [measureMode, setMeasureMode] = useState(null); // 'distance' | 'area' | null
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [clustering, setClustering] = useState(true);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [selectedDrawingTool, setSelectedDrawingTool] = useState(null);
  
  // Références pour les overlays
  const overlaysRef = useRef([]);
  const markersRef = useRef([]);
  const measureOverlaysRef = useRef([]);
  const gridRef = useRef(null);
  const markerClustererRef = useRef(null);

  const GOOGLE_MAPS_API_KEY = APP_CONFIG.GOOGLE_MAPS_API_KEY;

  // ==================== INITIALISATION ====================
  useEffect(() => {
    loadGoogleMapsWithAdvancedLibraries();

    return () => {
      cleanupMap();
    };
  }, []);

  const loadGoogleMapsWithAdvancedLibraries = () => {
    if (window.google && window.google.maps) {
      initializeAdvancedMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=drawing,geometry,visualization,places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeAdvancedMap;
    document.head.appendChild(script);
  };

  const initializeAdvancedMap = () => {
    const westAfricaCenter = { lat: 8.8105, lng: 0.8433 };
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: westAfricaCenter,
      zoom: 7.28,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_LEFT,
        mapTypeIds: [
          window.google.maps.MapTypeId.ROADMAP,
          window.google.maps.MapTypeId.SATELLITE,
          window.google.maps.MapTypeId.HYBRID,
          window.google.maps.MapTypeId.TERRAIN
        ]
      },
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER
      },
      scaleControl: true,
      rotateControl: true,
      tilt: 45, // Active la vue 3D
      styles: getAdvancedMapStyles()
    });

    // Initialiser les gestionnaires avancés
    if (!readOnly) {
      initializeAdvancedDrawingTools(mapInstance);
      initializeMeasurementTools(mapInstance);
    }

    displayExistingZonesAdvanced(mapInstance);
    loadInitialZone(mapInstance);
    
    setMap(mapInstance);
    setIsMapLoaded(true);
  };

  // ==================== STYLES DE CARTE AVANCÉS ====================
  const getAdvancedMapStyles = () => {
    return [
      {
        featureType: 'administrative',
        elementType: 'geometry',
        stylers: [{ visibility: 'on' }, { weight: 1.5 }]
      },
      {
        featureType: 'administrative.country',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#2d3748' }, { weight: 2 }]
      },
      {
        featureType: 'administrative.province',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#4a5568' }, { weight: 1 }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#f7fafc' }]
      },
      {
        featureType: 'landscape.natural.terrain',
        elementType: 'geometry',
        stylers: [{ visibility: 'on' }, { color: '#e2e8f0' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#90cdf4' }, { lightness: 10 }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ visibility: 'simplified' }, { color: '#cbd5e0' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#fc8181' }, { weight: 2 }]
      },
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#9ae6b4' }, { visibility: 'on' }]
      }
    ];
  };

  // ==================== OUTILS DE DESSIN AVANCÉS ====================
  const initializeAdvancedDrawingTools = (mapInstance) => {
    const drawingManagerInstance = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false, // On gère les contrôles manuellement
      polygonOptions: {
        fillColor: '#E53E3E',
        fillOpacity: opacity / 100,
        strokeColor: '#C53030',
        strokeWeight: 3,
        clickable: true,
        editable: true,
        draggable: false,
        zIndex: 100
      },
      circleOptions: {
        fillColor: '#3182CE',
        fillOpacity: opacity / 100,
        strokeColor: '#2C5282',
        strokeWeight: 3,
        clickable: true,
        editable: true,
        zIndex: 100
      },
      rectangleOptions: {
        fillColor: '#38A169',
        fillOpacity: opacity / 100,
        strokeColor: '#2F855A',
        strokeWeight: 3,
        clickable: true,
        editable: true,
        zIndex: 100
      }
    });

    drawingManagerInstance.setMap(mapInstance);
    setDrawingManager(drawingManagerInstance);

    // Écouter les événements de dessin
    window.google.maps.event.addListener(drawingManagerInstance, 'polygoncomplete', (polygon) => {
      handlePolygonComplete(polygon, mapInstance);
    });

    window.google.maps.event.addListener(drawingManagerInstance, 'circlecomplete', (circle) => {
      handleCircleComplete(circle, mapInstance);
    });

    window.google.maps.event.addListener(drawingManagerInstance, 'rectanglecomplete', (rectangle) => {
      handleRectangleComplete(rectangle, mapInstance);
    });
  };

  const handlePolygonComplete = (polygon, mapInstance) => {
    const path = polygon.getPath();
    const coordinates = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const vertex = path.getAt(i);
      coordinates.push([vertex.lng(), vertex.lat()]);
    }

    // Calculer l'aire et le périmètre
    const area = window.google.maps.geometry.spherical.computeArea(path);
    const perimeter = computePerimeter(path);

    const zoneName = prompt(
      `Zone dessinée:\n` +
      `Superficie: ${(area / 1000000).toFixed(2)} km²\n` +
      `Périmètre: ${(perimeter / 1000).toFixed(2)} km\n\n` +
      `Entrez le nom de cette zone:`
    );

    if (zoneName) {
      const zoneData = createZoneData(zoneName, coordinates, 'Polygon', {
        area: area,
        perimeter: perimeter
      });
      
      addZoneToMap(zoneData, mapInstance, polygon);
      createAdvancedMarker(polygon, mapInstance, zoneName, zoneData);
    } else {
      polygon.setMap(null);
    }

    drawingManager.setDrawingMode(null);
    setSelectedDrawingTool(null);
  };

  const handleCircleComplete = (circle, mapInstance) => {
    const center = circle.getCenter();
    const radius = circle.getRadius() / 1000; // km
    
    // Convertir cercle en polygone
    const circlePolygon = turf.circle(
      [center.lng(), center.lat()], 
      radius, 
      { steps: 64, units: 'kilometers' }
    );
    
    const coordinates = circlePolygon.geometry.coordinates[0];
    const area = Math.PI * radius * radius; // km²

    const zoneName = prompt(
      `Zone circulaire:\n` +
      `Rayon: ${radius.toFixed(2)} km\n` +
      `Superficie: ${area.toFixed(2)} km²\n\n` +
      `Entrez le nom de cette zone:`
    );

    if (zoneName) {
      const zoneData = createZoneData(zoneName, coordinates, 'Polygon', {
        area: area * 1000000,
        radius: radius,
        type: 'circle'
      });
      
      addZoneToMap(zoneData, mapInstance, circle);
      createAdvancedMarker(circle, mapInstance, zoneName, zoneData);
    } else {
      circle.setMap(null);
    }

    drawingManager.setDrawingMode(null);
    setSelectedDrawingTool(null);
  };

  const handleRectangleComplete = (rectangle, mapInstance) => {
    const bounds = rectangle.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    const coordinates = [
      [sw.lng(), sw.lat()],
      [ne.lng(), sw.lat()],
      [ne.lng(), ne.lat()],
      [sw.lng(), ne.lat()],
      [sw.lng(), sw.lat()]
    ];

    const area = window.google.maps.geometry.spherical.computeArea([
      sw, 
      new window.google.maps.LatLng(sw.lat(), ne.lng()),
      ne,
      new window.google.maps.LatLng(ne.lat(), sw.lng())
    ]);

    const zoneName = prompt(
      `Zone rectangulaire:\n` +
      `Superficie: ${(area / 1000000).toFixed(2)} km²\n\n` +
      `Entrez le nom de cette zone:`
    );

    if (zoneName) {
      const zoneData = createZoneData(zoneName, coordinates, 'Polygon', {
        area: area,
        type: 'rectangle'
      });
      
      addZoneToMap(zoneData, mapInstance, rectangle);
      createAdvancedMarker(rectangle, mapInstance, zoneName, zoneData);
    } else {
      rectangle.setMap(null);
    }

    drawingManager.setDrawingMode(null);
    setSelectedDrawingTool(null);
  };

  // ==================== OUTILS DE MESURE ====================
  const initializeMeasurementTools = (mapInstance) => {
    // Les outils de mesure seront activés à la demande
  };

  const startMeasureDistance = () => {
    if (!map) return;
    
    setMeasureMode('distance');
    map.setOptions({ draggableCursor: 'crosshair' });
    
    const measurePath = [];
    let polyline = null;
    let totalDistance = 0;
    
    const clickListener = map.addListener('click', (e) => {
      measurePath.push(e.latLng);
      
      if (measurePath.length > 1) {
        if (polyline) polyline.setMap(null);
        
        polyline = new window.google.maps.Polyline({
          path: measurePath,
          strokeColor: '#F56565',
          strokeWeight: 3,
          strokeOpacity: 0.8,
          map: map
        });
        
        totalDistance = window.google.maps.geometry.spherical.computeLength(measurePath);
        
        const marker = new window.google.maps.Marker({
          position: e.latLng,
          map: map,
          label: {
            text: `${(totalDistance / 1000).toFixed(2)} km`,
            color: '#2D3748',
            fontSize: '14px',
            fontWeight: 'bold'
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#F56565',
            fillOpacity: 1,
            strokeColor: '#C53030',
            strokeWeight: 2
          }
        });
        
        measureOverlaysRef.current.push(polyline, marker);
      }
    });
    
    const stopMeasure = () => {
      window.google.maps.event.removeListener(clickListener);
      map.setOptions({ draggableCursor: null });
      setMeasureMode(null);
      
      if (totalDistance > 0) {
        toast({
          title: 'Mesure terminée',
          description: `Distance totale: ${(totalDistance / 1000).toFixed(2)} km`,
          status: 'success',
          duration: 5000,
          isClosable: true
        });
      }
    };
    
    // Double-clic pour terminer
    const dblClickListener = map.addListener('dblclick', stopMeasure);
    measureOverlaysRef.current.push({ listener: clickListener }, { listener: dblClickListener });
  };

  const startMeasureArea = () => {
    if (!map) return;
    
    setMeasureMode('area');
    map.setOptions({ draggableCursor: 'crosshair' });
    
    const measurePath = [];
    let polygon = null;
    
    const clickListener = map.addListener('click', (e) => {
      measurePath.push(e.latLng);
      
      if (polygon) polygon.setMap(null);
      
      polygon = new window.google.maps.Polygon({
        paths: measurePath,
        strokeColor: '#48BB78',
        strokeWeight: 3,
        fillColor: '#48BB78',
        fillOpacity: 0.3,
        map: map
      });
      
      if (measurePath.length > 2) {
        const area = window.google.maps.geometry.spherical.computeArea(measurePath);
        
        const bounds = new window.google.maps.LatLngBounds();
        measurePath.forEach(point => bounds.extend(point));
        
        const center = bounds.getCenter();
        
        const marker = new window.google.maps.Marker({
          position: center,
          map: map,
          label: {
            text: `${(area / 1000000).toFixed(2)} km²`,
            color: '#2D3748',
            fontSize: '14px',
            fontWeight: 'bold'
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#48BB78',
            fillOpacity: 1,
            strokeColor: '#38A169',
            strokeWeight: 2
          }
        });
        
        measureOverlaysRef.current.push(polygon, marker);
      }
    });
    
    const stopMeasure = () => {
      window.google.maps.event.removeListener(clickListener);
      map.setOptions({ draggableCursor: null });
      setMeasureMode(null);
      
      if (measurePath.length > 2) {
        const area = window.google.maps.geometry.spherical.computeArea(measurePath);
        toast({
          title: 'Mesure terminée',
          description: `Superficie: ${(area / 1000000).toFixed(2)} km²`,
          status: 'success',
          duration: 5000,
          isClosable: true
        });
      }
    };
    
    const dblClickListener = map.addListener('dblclick', stopMeasure);
    measureOverlaysRef.current.push({ listener: clickListener }, { listener: dblClickListener });
  };

  const clearMeasurements = () => {
    measureOverlaysRef.current.forEach(item => {
      if (item.setMap) {
        item.setMap(null);
      } else if (item.listener) {
        window.google.maps.event.removeListener(item.listener);
      }
    });
    measureOverlaysRef.current = [];
    setMeasureMode(null);
    
    toast({
      title: 'Mesures effacées',
      status: 'info',
      duration: 2000
    });
  };

  // ==================== FONCTIONS UTILITAIRES ====================
  const createZoneData = (name, coordinates, type, metadata = {}) => {
    return {
      id: Date.now(),
      name: name,
      type: "Feature",
      geometry: {
        type: type,
        coordinates: type === 'Polygon' ? [coordinates] : coordinates
      },
      properties: {
        name: name,
        color: getRandomColor(),
        createdAt: new Date().toISOString(),
        ...metadata
      }
    };
  };

  const addZoneToMap = (zoneData, mapInstance, overlay) => {
    const newZones = [...zones, zoneData];
    setZones(newZones);
    overlaysRef.current.push(overlay);
    onZoneSelect(JSON.stringify(zoneData, null, 2));
  };

  const createAdvancedMarker = (overlay, mapInstance, zoneName, zoneData) => {
    let center;
    
    if (overlay.getCenter) {
      center = overlay.getCenter();
    } else if (overlay.getPath) {
      const bounds = new window.google.maps.LatLngBounds();
      const path = overlay.getPath();
      for (let i = 0; i < path.getLength(); i++) {
        bounds.extend(path.getAt(i));
      }
      center = bounds.getCenter();
    } else if (overlay.getBounds) {
      center = overlay.getBounds().getCenter();
    }

    if (!center) return;

    const marker = new window.google.maps.Marker({
      position: center,
      map: mapInstance,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: zoneData.properties.color || '#E53E3E',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3
      },
      title: zoneName,
      zIndex: 3000,
      animation: window.google.maps.Animation.DROP
    });

    // InfoWindow enrichie
    const infoContent = `
      <div style="padding: 12px; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; color: #2D3748; font-size: 16px; font-weight: bold;">
          📍 ${zoneName}
        </h3>
        ${zoneData.properties.area ? `
          <p style="margin: 4px 0; color: #4A5568; font-size: 13px;">
            <strong>Superficie:</strong> ${(zoneData.properties.area / 1000000).toFixed(2)} km²
          </p>
        ` : ''}
        ${zoneData.properties.perimeter ? `
          <p style="margin: 4px 0; color: #4A5568; font-size: 13px;">
            <strong>Périmètre:</strong> ${(zoneData.properties.perimeter / 1000).toFixed(2)} km
          </p>
        ` : ''}
        ${zoneData.properties.radius ? `
          <p style="margin: 4px 0; color: #4A5568; font-size: 13px;">
            <strong>Rayon:</strong> ${zoneData.properties.radius.toFixed(2)} km
          </p>
        ` : ''}
        <p style="margin: 8px 0 0 0; color: #718096; font-size: 11px;">
          Créé: ${new Date(zoneData.properties.createdAt).toLocaleString('fr-FR')}
        </p>
      </div>
    `;

    const infoWindow = new window.google.maps.InfoWindow({
      content: infoContent
    });

    marker.addListener('click', () => {
      infoWindow.open(mapInstance, marker);
    });

    markersRef.current.push(marker);
    setTempMarker(marker);
  };

  const computePerimeter = (path) => {
    let perimeter = 0;
    for (let i = 0; i < path.getLength(); i++) {
      const start = path.getAt(i);
      const end = path.getAt((i + 1) % path.getLength());
      perimeter += window.google.maps.geometry.spherical.computeDistanceBetween(start, end);
    }
    return perimeter;
  };

  const getRandomColor = () => {
    const colors = [
      '#E53E3E', '#3182CE', '#38A169', '#D69E2E', 
      '#805AD5', '#319795', '#DD6B20', '#E53E3E'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const displayExistingZonesAdvanced = (mapInstance) => {
    zones.forEach(zone => {
      try {
        if (!zone.geometry || !zone.geometry.coordinates) return;

        const coordinates = zone.geometry.coordinates[0];
        if (!Array.isArray(coordinates) || coordinates.length < 3) return;

        const mappedCoordinates = coordinates.map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }));

        const zonePolygon = new window.google.maps.Polygon({
          paths: mappedCoordinates,
          fillColor: zone.properties?.color || '#E53E3E',
          fillOpacity: opacity / 100,
          strokeColor: zone.properties?.color || '#C53030',
          strokeWeight: 3,
          map: mapInstance,
          zIndex: 50
        });

        overlaysRef.current.push(zonePolygon);
        
        if (zonePolygon) {
          createAdvancedMarker(zonePolygon, mapInstance, zone.name || zone.properties?.name, zone);
        }
      } catch (error) {
        console.error('Erreur affichage zone:', zone.name, error);
      }
    });
  };

  const loadInitialZone = (mapInstance) => {
    if (!initialZone) return;
    
    try {
      const zoneData = JSON.parse(initialZone);
      if (zoneData.geometry && zoneData.geometry.coordinates) {
        const coordinates = zoneData.geometry.coordinates[0].map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }));

        const initialPolygon = new window.google.maps.Polygon({
          paths: coordinates,
          fillColor: '#E53E3E',
          fillOpacity: opacity / 100,
          strokeColor: '#C53030',
          strokeWeight: 3,
          map: mapInstance
        });

        overlaysRef.current.push(initialPolygon);
        createAdvancedMarker(initialPolygon, mapInstance, zoneData.name || 'Zone', zoneData);
      }
    } catch (error) {
      console.error('Erreur chargement zone initiale:', error);
    }
  };

  const cleanupMap = () => {
    overlaysRef.current.forEach(overlay => {
      if (overlay && overlay.setMap) {
        overlay.setMap(null);
      }
    });
    markersRef.current.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    measureOverlaysRef.current.forEach(item => {
      if (item && item.setMap) {
        item.setMap(null);
      }
    });
  };

  // ==================== GESTION DES OUTILS ====================
  const activateDrawingTool = (tool) => {
    if (!drawingManager) return;
    
    const toolMap = {
      'polygon': window.google.maps.drawing.OverlayType.POLYGON,
      'circle': window.google.maps.drawing.OverlayType.CIRCLE,
      'rectangle': window.google.maps.drawing.OverlayType.RECTANGLE
    };
    
    if (selectedDrawingTool === tool) {
      drawingManager.setDrawingMode(null);
      setSelectedDrawingTool(null);
    } else {
      drawingManager.setDrawingMode(toolMap[tool]);
      setSelectedDrawingTool(tool);
      setMeasureMode(null);
    }
  };

  const handleClearAll = () => {
    cleanupMap();
    setZones([]);
    onZoneSelect('');
    
    toast({
      title: 'Carte effacée',
      description: 'Toutes les zones ont été supprimées',
      status: 'info',
      duration: 3000
    });
  };

  const handleExport = (format) => {
    if (zones.length === 0) {
      toast({
        title: 'Aucune zone',
        description: 'Aucune zone à exporter',
        status: 'warning',
        duration: 3000
      });
      return;
    }

    let exportData;
    let filename;
    let mimeType;

    switch (format) {
      case 'geojson':
        exportData = JSON.stringify({
          type: "FeatureCollection",
          features: zones
        }, null, 2);
        filename = `zones_${Date.now()}.geojson`;
        mimeType = 'application/geo+json';
        break;
      
      case 'kml':
        exportData = convertToKML(zones);
        filename = `zones_${Date.now()}.kml`;
        mimeType = 'application/vnd.google-earth.kml+xml';
        break;
      
      case 'json':
      default:
        exportData = JSON.stringify(zones, null, 2);
        filename = `zones_${Date.now()}.json`;
        mimeType = 'application/json';
        break;
    }

    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export réussi',
      description: `Fichier ${filename} téléchargé`,
      status: 'success',
      duration: 3000
    });
  };

  const convertToKML = (zones) => {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>Réserves Exportées</name>
  <description>Export depuis l'application de gestion des réserves</description>
`;

    zones.forEach(zone => {
      const coords = zone.geometry.coordinates[0];
      const coordsKML = coords.map(c => `${c[0]},${c[1]},0`).join(' ');
      
      kml += `
  <Placemark>
    <name>${zone.name || zone.properties?.name || 'Zone'}</name>
    <description>
      ${zone.properties?.area ? `Superficie: ${(zone.properties.area / 1000000).toFixed(2)} km²\n` : ''}
      Créé: ${new Date(zone.properties?.createdAt).toLocaleString('fr-FR')}
    </description>
    <Style>
      <LineStyle>
        <color>ff${zone.properties?.color?.replace('#', '') || 'ff0000'}</color>
        <width>3</width>
      </LineStyle>
      <PolyStyle>
        <color>4d${zone.properties?.color?.replace('#', '') || 'ff0000'}</color>
      </PolyStyle>
    </Style>
    <Polygon>
      <outerBoundaryIs>
        <LinearRing>
          <coordinates>${coordsKML}</coordinates>
        </LinearRing>
      </outerBoundaryIs>
    </Polygon>
  </Placemark>`;
    });

    kml += `
</Document>
</kml>`;
    
    return kml;
  };

  const updateOpacity = (value) => {
    setOpacity(value);
    overlaysRef.current.forEach(overlay => {
      if (overlay.setOptions) {
        overlay.setOptions({ fillOpacity: value / 100 });
      }
    });
  };

  // ==================== RENDU UI ====================
  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Barre d'outils principale */}
        <HStack justify="space-between" flexWrap="wrap">
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {readOnly 
              ? "Carte de la réserve" 
              : "Carte interactive avancée - Outils SIG professionnels"
            }
          </Text>
          
          {!readOnly && isMapLoaded && (
            <HStack spacing={2} flexWrap="wrap">
              {/* Outils de dessin */}
              <Tooltip label="Dessiner un polygone">
                <IconButton
                  icon={<FiGrid />}
                  size="sm"
                  colorScheme={selectedDrawingTool === 'polygon' ? 'blue' : 'gray'}
                  onClick={() => activateDrawingTool('polygon')}
                  aria-label="Polygone"
                />
              </Tooltip>
              
              <Tooltip label="Dessiner un cercle">
                <IconButton
                  icon={<FiTarget />}
                  size="sm"
                  colorScheme={selectedDrawingTool === 'circle' ? 'blue' : 'gray'}
                  onClick={() => activateDrawingTool('circle')}
                  aria-label="Cercle"
                />
              </Tooltip>
              
              <Tooltip label="Dessiner un rectangle">
                <IconButton
                  icon={<FiSquare />}
                  size="sm"
                  colorScheme={selectedDrawingTool === 'rectangle' ? 'blue' : 'gray'}
                  onClick={() => activateDrawingTool('rectangle')}
                  aria-label="Rectangle"
                />
              </Tooltip>

              <Divider orientation="vertical" h="24px" />

              {/* Outils de mesure */}
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  leftIcon={<FiCrosshair />}
                  colorScheme={measureMode ? 'green' : 'gray'}
                  variant="outline"
                >
                  Mesurer
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={startMeasureDistance}>
                    📏 Mesurer une distance
                  </MenuItem>
                  <MenuItem onClick={startMeasureArea}>
                    📐 Mesurer une superficie
                  </MenuItem>
                  <MenuItem onClick={clearMeasurements}>
                    🗑️ Effacer les mesures
                  </MenuItem>
                </MenuList>
              </Menu>

              {/* Export */}
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  leftIcon={<FiDownload />}
                  colorScheme="purple"
                  variant="outline"
                >
                  Export
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => handleExport('geojson')}>
                    🌍 GeoJSON
                  </MenuItem>
                  <MenuItem onClick={() => handleExport('kml')}>
                    🗺️ KML (Google Earth)
                  </MenuItem>
                  <MenuItem onClick={() => handleExport('json')}>
                    📄 JSON
                  </MenuItem>
                </MenuList>
              </Menu>

              <Tooltip label="Effacer tout">
                <IconButton
                  icon={<FiTrash2 />}
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={handleClearAll}
                  aria-label="Effacer"
                />
              </Tooltip>
            </HStack>
          )}
        </HStack>

        {/* Panneau de contrôle avancé */}
        {!readOnly && isMapLoaded && (
          <Accordion allowToggle>
            <AccordionItem border="1px" borderColor="gray.200" borderRadius="md">
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <FiSettings />
                    <Text fontWeight="semibold">Paramètres avancés</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Tabs size="sm" variant="enclosed">
                  <TabList>
                    <Tab>🗺️ Couches</Tab>
                    <Tab>🎨 Apparence</Tab>
                    <Tab>⚙️ Outils</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Onglet Couches */}
                    <TabPanel>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm">Routes</Text>
                          <Switch 
                            isChecked={mapLayers.roads}
                            onChange={(e) => setMapLayers({...mapLayers, roads: e.target.checked})}
                            colorScheme="blue"
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Étiquettes</Text>
                          <Switch 
                            isChecked={mapLayers.labels}
                            onChange={(e) => setMapLayers({...mapLayers, labels: e.target.checked})}
                            colorScheme="blue"
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Frontières</Text>
                          <Switch 
                            isChecked={mapLayers.borders}
                            onChange={(e) => setMapLayers({...mapLayers, borders: e.target.checked})}
                            colorScheme="blue"
                          />
                        </HStack>
                      </VStack>
                    </TabPanel>

                    {/* Onglet Apparence */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <Text fontSize="sm" mb={2}>
                            Opacité des zones: {opacity}%
                          </Text>
                          <Slider 
                            value={opacity} 
                            onChange={updateOpacity}
                            min={0}
                            max={100}
                            colorScheme="blue"
                          >
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                          </Slider>
                        </Box>
                      </VStack>
                    </TabPanel>

                    {/* Onglet Outils */}
                    <TabPanel>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm">Magnétisme (Snap)</Text>
                          <Switch 
                            isChecked={snapToGrid}
                            onChange={(e) => setSnapToGrid(e.target.checked)}
                            colorScheme="green"
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Afficher grille</Text>
                          <Switch 
                            isChecked={showGrid}
                            onChange={(e) => setShowGrid(e.target.checked)}
                            colorScheme="green"
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Clustering marqueurs</Text>
                          <Switch 
                            isChecked={clustering}
                            onChange={(e) => setClustering(e.target.checked)}
                            colorScheme="purple"
                          />
                        </HStack>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}

        {/* Badge de mode actif */}
        {(selectedDrawingTool || measureMode) && (
          <HStack>
            <Badge colorScheme={selectedDrawingTool ? 'blue' : 'green'} fontSize="xs">
              {selectedDrawingTool ? `Mode dessin: ${selectedDrawingTool}` : `Mode mesure: ${measureMode}`}
            </Badge>
            <Text fontSize="xs" color="gray.500">
              {selectedDrawingTool ? 'Cliquez sur la carte pour dessiner' : 'Cliquez pour mesurer, double-clic pour terminer'}
            </Text>
          </HStack>
        )}

        {/* Statistiques des zones */}
        {zones.length > 0 && (
          <HStack spacing={4} p={3} bg="blue.50" borderRadius="md">
            <Badge colorScheme="blue" fontSize="sm">
              📍 {zones.length} zone{zones.length > 1 ? 's' : ''}
            </Badge>
            <Badge colorScheme="green" fontSize="sm">
              📊 {zones.reduce((sum, z) => sum + (z.properties?.area || 0), 0) / 1000000 || 0} km² total
            </Badge>
          </HStack>
        )}

        {/* Conteneur de la carte */}
        <Box
          ref={mapRef}
          w="full"
          h="600px"
          borderRadius="lg"
          border="2px"
          borderColor="gray.300"
          overflow="hidden"
          boxShadow="lg"
          position="relative"
        />

        {/* Instructions */}
        {!readOnly && (
          <Box p={3} bg="gray.50" borderRadius="md" fontSize="xs" color="gray.600">
            <Text fontWeight="semibold" mb={2}>💡 Conseils d'utilisation:</Text>
            <VStack spacing={1} align="stretch">
              <Text>• Utilisez les outils de dessin pour créer des zones polygonales, circulaires ou rectangulaires</Text>
              <Text>• Les outils de mesure permettent de calculer distances et superficies</Text>
              <Text>• Exportez vos zones en GeoJSON, KML ou JSON pour les utiliser dans d'autres applications</Text>
              <Text>• Ajustez l'opacité et les couches via les paramètres avancés</Text>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default InteractiveMap;
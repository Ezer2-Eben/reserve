// src/components/ui/InteractiveMap.jsx
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { FiMap, FiTrash2 } from 'react-icons/fi';

import { APP_CONFIG } from '../../config/appConfig';

const InteractiveMap = ({ onZoneSelect, initialZone = null, readOnly = false, existingZones = [], reserves = [] }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [zones, setZones] = useState(existingZones || []);
  const [tempMarker, setTempMarker] = useState(null);

  // Clé API Google Maps
  const GOOGLE_MAPS_API_KEY = APP_CONFIG.GOOGLE_MAPS_API_KEY;

  // Fonction pour créer un marqueur temporaire au centre de la zone
  const createTempMarker = (polygon, mapInstance) => {
    if (!polygon || !mapInstance) return;
    
    try {
      // Calculer le centre du polygone
      const bounds = new window.google.maps.LatLngBounds();
      const path = polygon.getPath();
      
      for (let i = 0; i < path.getLength(); i++) {
        bounds.extend(path.getAt(i));
      }
      
      const center = bounds.getCenter();
      
      // Supprimer l'ancien marqueur temporaire s'il existe
      if (tempMarker) {
        tempMarker.setMap(null);
      }
      
      // Créer un nouveau marqueur temporaire
      const newTempMarker = new window.google.maps.Marker({
        position: center,
        map: mapInstance,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10, // Point noir plus gros
          fillColor: '#000000',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        },
        title: 'Zone délimitée',
        zIndex: 3000, // Au-dessus de tout
        cursor: 'pointer'
      });
      
      setTempMarker(newTempMarker);
      console.log('✅ Marqueur temporaire créé au centre de la zone');
    } catch (error) {
      console.error('❌ Erreur lors de la création du marqueur temporaire:', error);
    }
  };

  useEffect(() => {
    // Charger l'API Google Maps
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=drawing,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      // Coordonnées centrées sur l'Afrique de l'Ouest
      const westAfricaCenter = { lat: 8.8105, lng: 0.8433 };
      
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: westAfricaCenter,
        zoom: 7.28,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'administrative.country',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#000000' }, { weight: 1 }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f2' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#a9d3f2' }]
          }
        ]
      });

      // Afficher les zones existantes
      displayExistingZones(mapInstance);

      if (!readOnly) {
        // Créer le gestionnaire de dessin
        const drawingManagerInstance = new window.google.maps.drawing.DrawingManager({
          position: window.google.maps.ControlPosition.TOP_RIGHT,
          drawingMode: null,
          drawingControl: true,
          drawingControlOptions: {
            position: window.google.maps.ControlPosition.TOP_RIGHT,
            drawingModes: [
              window.google.maps.drawing.OverlayType.POLYGON
            ]
          },
          polygonOptions: {
            fillColor: '#E53E3E',
            fillOpacity: 0.3,
            strokeColor: '#E53E3E',
            strokeWeight: 3,
            clickable: true,
            editable: true,
            zIndex: 1
          }
        });

        drawingManagerInstance.setMap(mapInstance);

        // Écouter les événements de dessin
        window.google.maps.event.addListener(drawingManagerInstance, 'polygoncomplete', (polygon) => {
          console.log('🎯 Zone dessinée, création du marqueur...');
          
          // Créer le marqueur temporaire immédiatement
          createTempMarker(polygon, mapInstance);
          
          // Demander le nom de la zone
          const zoneName = prompt('Entrez le nom de cette zone (ex: Zone A, Réserve Nord, etc.) :');
          
          if (zoneName) {
            // Obtenir les coordonnées du polygone
            const path = polygon.getPath();
            const coordinates = [];
            
            for (let i = 0; i < path.getLength(); i++) {
              const vertex = path.getAt(i);
              coordinates.push([vertex.lng(), vertex.lat()]);
            }

            // Créer l'objet zone avec nom
            const zoneData = {
              id: Date.now(),
              name: zoneName,
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [coordinates]
              },
              properties: {
                name: zoneName,
                color: getRandomColor(),
                createdAt: new Date().toISOString()
              }
            };

            // Ajouter la zone à la liste
            const newZones = [...zones, zoneData];
            setZones(newZones);

            // Ajouter le nom sur la carte
            addZoneLabel(mapInstance, polygon, zoneName);

            // Convertir en format GeoJSON pour le callback
            onZoneSelect(JSON.stringify(zoneData, null, 2));
          } else {
            // Si pas de nom, supprimer le polygone et le marqueur
            polygon.setMap(null);
            if (tempMarker) {
              tempMarker.setMap(null);
              setTempMarker(null);
            }
          }
        });
      }

      // Charger la zone initiale si elle existe
      if (initialZone) {
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
              fillOpacity: 0.3,
              strokeColor: '#E53E3E',
              strokeWeight: 3,
              map: mapInstance
            });

            window.currentPolygon = initialPolygon;
            createTempMarker(initialPolygon, mapInstance);
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la zone initiale:', error);
        }
      }

      setMap(mapInstance);
      setIsMapLoaded(true);
    };

    const displayExistingZones = (mapInstance) => {
      zones.forEach(zone => {
        try {
          if (!zone.geometry || !zone.geometry.coordinates || !Array.isArray(zone.geometry.coordinates)) {
            console.warn('Géométrie invalide pour la zone:', zone.name || zone.properties?.name);
            return;
          }

          const coordinates = zone.geometry.coordinates[0];
          if (!Array.isArray(coordinates) || coordinates.length < 3) {
            console.warn('Coordonnées insuffisantes pour la zone:', zone.name || zone.properties?.name);
            return;
          }

          const mappedCoordinates = coordinates.map(coord => ({
            lat: coord[1],
            lng: coord[0]
          }));

          const zonePolygon = new window.google.maps.Polygon({
            paths: mappedCoordinates,
            fillColor: zone.properties?.color || '#E53E3E',
            fillOpacity: 0.3,
            strokeColor: zone.properties?.color || '#E53E3E',
            strokeWeight: 3,
            map: mapInstance
          });

          if (zonePolygon) {
            addZoneLabel(mapInstance, zonePolygon, zone.name || zone.properties?.name);
          }
        } catch (error) {
          console.error('Erreur lors de l\'affichage de la zone:', zone.name || zone.properties?.name, error);
        }
      });
    };

    const addZoneLabel = (mapInstance, polygon, zoneName) => {
      if (!polygon || !polygon.getPath) {
        console.warn('Polygone invalide pour la zone:', zoneName);
        return;
      }

      const path = polygon.getPath();
      if (!path || path.getLength === undefined) {
        console.warn('Chemin de polygone invalide pour la zone:', zoneName);
        return;
      }

      const bounds = new window.google.maps.LatLngBounds();
      
      for (let i = 0; i < path.getLength(); i++) {
        bounds.extend(path.getAt(i));
      }
      
      const center = bounds.getCenter();

      const zoneMarker = new window.google.maps.Marker({
        position: center,
        map: mapInstance,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 4,
          fillColor: '#000000',
          fillOpacity: 1,
          strokeColor: '#000000',
          strokeWeight: 1
        },
        title: zoneName,
        zIndex: 1000,
        cursor: 'pointer'
      });

      zoneMarker.addListener('mouseover', () => {
        const hoverInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="
              padding: 8px; 
              font-weight: bold; 
              color: #000; 
              background: #fff; 
              border-radius: 6px; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
              text-align: center;
              font-size: 14px;
              white-space: nowrap;
            ">
              ${zoneName}
            </div>
          `,
          maxWidth: 200,
          pixelOffset: new window.google.maps.Size(0, -8)
        });
        hoverInfoWindow.open(mapInstance, zoneMarker);
        zoneMarker.hoverInfoWindow = hoverInfoWindow;
      });

      zoneMarker.addListener('mouseout', () => {
        if (zoneMarker.hoverInfoWindow) {
          zoneMarker.hoverInfoWindow.close();
        }
      });

      zoneMarker.addListener('click', () => {
        const clickInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="
              padding: 12px; 
              font-weight: bold; 
              color: #000; 
              background: #fff; 
              border-radius: 8px; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              text-align: center;
              min-width: 120px;
            ">
              <div style="font-size: 16px; margin-bottom: 4px;">📍 Zone</div>
              <div style="font-size: 14px; color: #333;">${zoneName}</div>
            </div>
          `,
          maxWidth: 200,
          pixelOffset: new window.google.maps.Size(0, -10)
        });
        clickInfoWindow.open(mapInstance, zoneMarker);
      });
    };

    const getRandomColor = () => {
      const colors = ['#E53E3E', '#38A169', '#3182CE', '#D69E2E', '#805AD5', '#319795'];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    loadGoogleMaps();

    return () => {
      if (map) {
        if (window.currentPolygon) {
          window.currentPolygon.setMap(null);
        }
        if (tempMarker) {
          tempMarker.setMap(null);
        }
      }
    };
  }, [onZoneSelect, initialZone, readOnly, zones, reserves]);

  const handleClearZone = () => {
    if (window.currentPolygon) {
      window.currentPolygon.setMap(null);
      window.currentPolygon = null;
      onZoneSelect('');
      
      if (tempMarker) {
        tempMarker.setMap(null);
        setTempMarker(null);
      }
    }
  };

  const handleExampleZone = () => {
    const exampleZone = {
      id: Date.now(),
      name: "Zone Exemple",
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [0.772, 6.137],
          [3.851, 6.137],
          [3.851, 12.418],
          [0.772, 12.418],
          [0.772, 6.137]
        ]]
      },
      properties: {
        name: "Zone Exemple",
        color: '#E53E3E',
        createdAt: new Date().toISOString()
      }
    };
    
    onZoneSelect(JSON.stringify(exampleZone, null, 2));
  };

  return (
    <Box>
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {readOnly 
              ? "Carte de la réserve" 
              : "Carte interactive - Utilisez l'outil de dessin pour délimiter une zone"
            }
          </Text>
          {!readOnly && isMapLoaded && (
            <HStack spacing={2}>
              <Button
                size="sm"
                leftIcon={<FiMap />}
                onClick={handleExampleZone}
                colorScheme="blue"
                variant="outline"
              >
                Zone exemple
              </Button>
              <Button
                size="sm"
                leftIcon={<FiTrash2 />}
                onClick={handleClearZone}
                colorScheme="red"
                variant="outline"
              >
                Effacer
              </Button>
            </HStack>
          )}
        </HStack>
        
        <Box
          ref={mapRef}
          w="full"
          h="400px"
          borderRadius="lg"
          border="2px"
          borderColor="gray.200"
          overflow="hidden"
        />
      </VStack>
    </Box>
  );
};

export default InteractiveMap; 
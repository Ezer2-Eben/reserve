// src/pages/nouvelle_reserve.jsx
import {
  Box, Flex, VStack, HStack, Heading, Text, Button,
  Input, InputGroup, InputLeftElement, IconButton, Card,
  CardBody, FormControl, FormLabel, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, Select, Textarea, Alert, AlertIcon,
  Tooltip, useToast, Spinner, Divider, Switch, Collapse, Drawer,
  DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent,
  DrawerCloseButton, useDisclosure
} from '@chakra-ui/react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { BiMapPin } from 'react-icons/bi';
import { FiSearch, FiSave, FiX, FiZoomIn, FiZoomOut, FiNavigation, FiTarget, FiGrid, FiEye, FiDownload, FiLayers, FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import DrawingToolsPanel from '../components/maps/DrawingToolsPanel';
import InteractiveDrawingMap from '../components/maps/InteractiveDrawingMap';
import ZoneInfoPanel from '../components/maps/ZoneInfoPanel';
import communesGeoJSON from '../data/donnees_commune.json';
// CORRECTION : Importer le service spécifique au lieu de l'import par défaut
import { reserveService } from '../services/apiService';

const NouvelleReservePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const mapRef = useRef(null);
  const drawingToolsRef = useRef(null);

  // Drawer pour la palette latérale
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

  const [formData, setFormData] = useState({
    nom: '', 
    type: '', 
    statut: 'EN_PROJET',
    description: '', 
    superficie: 0, 
    proprietaire: '', 
    reference: '',
    localisation: '',
    latitude: 0,
    longitude: 0
  });

  const [geometry, setGeometry] = useState(null);
  const [zoneName, setZoneName] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState('polygon');
  const [measurements, setMeasurements] = useState({
    area: 0, perimeter: 0, areaHectares: 0,
    areaSquareMeters: 0, bounds: null,
    centerLat: 0,
    centerLng: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [mapStyle, setMapStyle] = useState('satellite');
  const [showLabels, setShowLabels] = useState(true);
  const [showCommunes, setShowCommunes] = useState(true);
  const [mapCenter] = useState([8.5, 0.8]); // Centre sur le Togo
  const [mapZoom] = useState(10); // Zoom par défaut plus élevé
  const [mapBounds] = useState({
    minLat: 6.1,  // Sud du Togo
    maxLat: 11.1, // Nord du Togo
    minLng: -0.1, // Ouest du Togo
    maxLng: 1.8   // Est du Togo
  });

  // Nouvel état pour contrôler l'affichage du panneau
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  
  // NOUVEAU : Test de connexion à l'API au chargement
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        console.log('🔍 Test de connexion à l\'API Spring Boot...');
        console.log('URL de base: http://localhost:9190/api');
        
        // Test simple de connexion
        const response = await fetch('http://localhost:9190/api/reserves', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          console.log('✅ API Spring Boot accessible');
        } else {
          console.warn('⚠️ API retourne un statut:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('❌ Impossible de joindre l\'API Spring Boot:', error);
        toast({
          title: "Avertissement de connexion",
          description: "Impossible de vérifier la connexion au serveur. Assurez-vous que Spring Boot est démarré.",
          status: "warning",
          duration: 4000,
        });
      }
    };
    
    testApiConnection();
  }, [toast]);

  // Charger et valider les données GeoJSON au montage
  useEffect(() => {
    if (communesGeoJSON) {
      console.log('Données communes chargées:', communesGeoJSON);
      toast({
        title: "Couche chargée",
        description: `${communesGeoJSON.features?.length || 0} communes chargées`,
        status: "success",
        duration: 2000,
      });
    }
  }, [toast]);

  // Forcer les limites de la carte sur le Togo
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      if (map) {
        // Définir les limites pour restreindre la vue au Togo
        const bounds = [
          [mapBounds.minLat, mapBounds.minLng],
          [mapBounds.maxLat, mapBounds.maxLng]
        ];
        
        // Appliquer les limites
        map.setMaxBounds(bounds);
        
        // Centrer automatiquement sur le Togo
        map.flyTo(mapCenter, mapZoom);
      }
    }
  }, [mapRef, mapCenter, mapZoom, mapBounds]);

  // Fonction pour normaliser la géométrie
  const normalizeGeometry = (geo) => {
    if (!geo) return null;

    if (geo.type && geo.coordinates) {
      if (Array.isArray(geo.coordinates) && geo.coordinates.length > 0) {
        return {
          type: geo.type,
          coordinates: geo.coordinates
        };
      }
    }

    if (Array.isArray(geo) && geo.length > 0) {
      if (Array.isArray(geo[0]) && Array.isArray(geo[0][0])) {
        return {
          type: 'Polygon',
          coordinates: geo
        };
      }
      return {
        type: 'Polygon',
        coordinates: [geo]
      };
    }

    return null;
  };

  // Fonction pour calculer le centre d'une géométrie
  const calculateCenter = (coordinates) => {
    if (!coordinates || !coordinates[0]) return { lat: 8.5, lng: 0.8 };
    
    const points = coordinates[0];
    let sumLat = 0;
    let sumLng = 0;
    
    points.forEach(point => {
      sumLng += point[0];
      sumLat += point[1];
    });
    
    return {
      lat: sumLat / points.length,
      lng: sumLng / points.length
    };
  };

  // Gestion de la recherche
  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const communeResults = communesGeoJSON?.features
        ?.filter(feature => 
          feature.properties.NAME_3?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feature.properties.NAME_2?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
        .map((feature, index) => {
          const coords = feature.geometry.coordinates[0][0];
          const lats = coords.map(c => c[1]);
          const lngs = coords.map(c => c[0]);
          const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
          const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

          return {
            id: `commune-${index}`,
            name: feature.properties.NAME_3,
            lat: centerLat,
            lng: centerLng,
            type: `Commune - ${feature.properties.NAME_2}`,
          };
        }) || [];

      setSearchResults(communeResults);

      if (communeResults.length > 0 && mapRef.current) {
        // Vérifier que la position est dans les limites du Togo
        const result = communeResults[0];
        if (result.lat >= mapBounds.minLat && result.lat <= mapBounds.maxLat &&
            result.lng >= mapBounds.minLng && result.lng <= mapBounds.maxLng) {
          mapRef.current.flyTo(result.lat, result.lng, 13);
        }
      }
    } catch (error) {
      console.error('Erreur de recherche:', error);
      toast({
        title: "Erreur de recherche",
        description: "Impossible d'effectuer la recherche",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, toast, mapBounds]);

  const handleGeometryComplete = useCallback((geo) => {
    const normalizedGeo = normalizeGeometry(geo);
    
    if (!normalizedGeo) {
      console.error('Géométrie invalide:', geo);
      toast({
        title: "Erreur de géométrie",
        description: "La géométrie dessinée n'est pas valide",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setGeometry(normalizedGeo);
    
    // Calculer les mesures réelles (approximatives)
    if (normalizedGeo.coordinates && normalizedGeo.coordinates.length > 0) {
      const center = calculateCenter(normalizedGeo.coordinates);
      
      // Calcul approximatif de l'aire (en m²)
      let area = 0;
      const coords = normalizedGeo.coordinates[0];
      for (let i = 0; i < coords.length - 1; i++) {
        area += coords[i][0] * coords[i+1][1] - coords[i+1][0] * coords[i][1];
      }
      area = Math.abs(area) / 2 * 111319.9 * 111319.9; // Conversion en m²
      
      // Calcul approximatif du périmètre
      let perimeter = 0;
      for (let i = 0; i <coords.length - 1; i++) {
        const dx = (coords[i+1][0] - coords[i][0]) * 111319.9;
        const dy = (coords[i+1][1] - coords[i][1]) * 111319.9;
        perimeter += Math.sqrt(dx*dx + dy*dy);
      }

      // Calcul des bornes
      const lats = coords.map(c => c[1]);
      const lngs = coords.map(c => c[0]);
      
      setMeasurements({
        area, 
        perimeter, 
        areaHectares: area / 10000,
        areaSquareMeters: area, 
        bounds: {
          north: Math.max(...lats),
          south: Math.min(...lats),
          east: Math.max(...lngs),
          west: Math.min(...lngs)
        },
        centerLat: center.lat,
        centerLng: center.lng
      });

      setFormData(prev => ({
        ...prev,
        superficie: area / 10000,
        latitude: center.lat,
        longitude: center.lng,
        localisation: `Centré sur ${center.lat.toFixed(4)}°, ${center.lng.toFixed(4)}°`
      }));

      // Afficher le panneau des outils de dessin
      setShowDrawingTools(true);
    }
  }, [toast]);

  const handleSave = async () => {
    if (!geometry) {
      toast({ 
        title: "Zone requise", 
        description: "Veuillez dessiner une zone sur la carte", 
        status: "warning", 
        duration: 3000 
      });
      return;
    }

    if (!formData.nom.trim()) {
      toast({ 
        title: "Nom requis", 
        description: "Veuillez donner un nom à la réserve", 
        status: "warning", 
        duration: 3000 
      });
      return;
    }

    try {
      console.log('=== DEBUG handleSave ===');
      console.log('1. Géométrie présente:', geometry !== null);
      console.log('2. Données du formulaire:', formData);
      
      // Préparer les données pour l'API Spring Boot
      const reserveData = {
        nom: formData.nom,
        type: formData.type,
        statut: formData.statut,
        description: formData.description,
        superficie: formData.superficie,
        proprietaire: formData.proprietaire,
        reference: formData.reference || '', // Ajout de la référence
        localisation: formData.localisation || `Centré sur ${measurements.centerLat.toFixed(4)}°, ${measurements.centerLng.toFixed(4)}°`,
        latitude: measurements.centerLat,
        longitude: measurements.centerLng,
        zone: JSON.stringify(geometry) // Stocker la géométrie en JSON
      };
      
      console.log('3. Données envoyées à l\'API:', reserveData);
      console.log('4. Zone JSON (tronqué):', JSON.stringify(geometry).substring(0, 100) + '...');
      
      toast({ 
        title: "Enregistrement en cours...", 
        status: "info", 
        duration: 3000,
        isClosable: true
      });

      // CORRECTION : Utiliser reserveService.create au lieu de apiService.createReserve
      console.log('5. Appel à reserveService.create...');
      const response = await reserveService.create(reserveData);
      console.log('6. Réponse de l\'API:', response);
      console.log('=== FIN DEBUG ===');
      
      toast({ 
        title: "✅ Réserve créée avec succès", 
        description: `La réserve "${formData.nom}" a été enregistrée dans la base de données`, 
        status: "success", 
        duration: 5000 
      });
      
      // Redirection après un court délai
      setTimeout(() => {
        navigate('/dashboard/reserves');
      }, 1000);
      
    } catch (error) {
      console.error('=== ERREUR D\'ENREGISTREMENT ===');
      console.error('Message d\'erreur:', error.message);
      console.error('Erreur complète:', error);
      console.error('Status de la réponse:', error.response?.status);
      console.error('Données d\'erreur:', error.response?.data);
      console.error('=== FIN ERREUR ===');
      
      let errorMessage = "Impossible de sauvegarder la réserve";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Non autorisé - Veuillez vous reconnecter";
          setTimeout(() => navigate('/login'), 2000);
        } else if (error.response.status === 403) {
          errorMessage = "Accès refusé - Vous n'avez pas les permissions nécessaires";
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || "Données invalides";
        } else if (error.response.status === 500) {
          errorMessage = "Erreur serveur - Veuillez contacter l'administrateur";
        }
      } else if (error.request) {
        errorMessage = "Impossible de contacter le serveur. Vérifiez que Spring Boot est démarré.";
      }
      
      toast({ 
        title: "❌ Erreur d'enregistrement", 
        description: errorMessage, 
        status: "error", 
        duration: 6000,
        isClosable: true
      });
    }
  };

  const handleCancel = () => {
    if (geometry) {
      if (window.confirm('Voulez-vous vraiment annuler ? Les modifications ne seront pas sauvegardées.')) {
        navigate('/dashboard/reserves');
      }
    } else {
      navigate('/dashboard/reserves');
    }
  };

  const handleClearDrawing = () => {
    setGeometry(null);
    setMeasurements({ 
      area: 0, perimeter: 0, areaHectares: 0, 
      areaSquareMeters: 0, bounds: null,
      centerLat: 0, centerLng: 0
    });
    setShowDrawingTools(false); // Masquer le panneau
    
    if (drawingToolsRef.current) {
      drawingToolsRef.current.clearDrawing();
    }
    
    // Réinitialiser les coordonnées dans le formulaire
    setFormData(prev => ({
      ...prev,
      superficie: 0,
      latitude: 0,
      longitude: 0,
      localisation: ''
    }));
  };

  const handleKeyPress = (e) => { 
    if (e.key === 'Enter') handleSearch(e); 
  };

  const handleDrawingStart = () => {
    setIsDrawing(true);
    setShowDrawingTools(false); // Masquer pendant le dessin
  };

  const handleDrawingEnd = () => {
    setIsDrawing(false);
  };

  return (
    <Box h="100vh" bg="gray.50" overflow="hidden">
      {/* Header */}
      <Flex 
        position="fixed" 
        top={0} 
        left={0} 
        right={0} 
        bg="white" 
        borderBottom="1px" 
        borderColor="gray.200" 
        zIndex={1000} 
        p={4} 
        align="center" 
        justify="space-between" 
        shadow="sm"
      >
        <VStack align="start" spacing={0}>
          <Heading size="md" color="brand.600">🗺️ Nouvelle Réserve</Heading>
          <Text fontSize="sm" color="gray.500">Délimitez votre zone sur la carte du Togo</Text>
        </VStack>
        <HStack spacing={3}>
          <Button 
            leftIcon={<FiX />} 
            variant="outline" 
            colorScheme="red" 
            onClick={handleCancel}
          >
            Annuler
          </Button>
          <Button 
            leftIcon={<FiMenu />} 
            variant="outline" 
            onClick={onOpen}
            ref={btnRef}
          >
            Ouvrir le panneau
          </Button>
          <Button 
            leftIcon={<FiSave />} 
            colorScheme="brand" 
            onClick={handleSave} 
            isDisabled={!geometry}
          >
            Enregistrer dans la BD
          </Button>
        </HStack>
      </Flex>

      {/* Carte - Prend tout l'écran */}
      <Box pt="80px" h="calc(100vh - 80px)" w="100vw" position="relative">
        {/* Barre de recherche */}
        <Box position="absolute" top={4} left={4} zIndex={500} width="400px">
          <form onSubmit={handleSearch}>
            <InputGroup size="lg" shadow="lg">
              <InputLeftElement pointerEvents="none">
                {isSearching ? <Spinner size="sm" /> : <FiSearch color="gray.400" />}
              </InputLeftElement>
              <Input 
                bg="white" 
                placeholder="Rechercher une commune au Togo..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyPress={handleKeyPress} 
              />
            </InputGroup>
          </form>

          {searchResults.length > 0 && (
            <Card mt={2} shadow="md">
              <CardBody p={0} maxH="300px" overflowY="auto">
                {searchResults.map(result => (
                  <Box 
                    key={result.id} 
                    p={3} 
                    borderBottom="1px" 
                    borderColor="gray.100" 
                    _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                    onClick={() => { 
                      if (mapRef.current) { 
                        mapRef.current.flyTo(result.lat, result.lng, 13); 
                        setSearchResults([]); 
                      } 
                    }}
                  >
                    <HStack>
                      <BiMapPin color="#4A5568" />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{result.name}</Text>
                        <Text fontSize="xs" color="gray.500">{result.type}</Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </CardBody>
            </Card>
          )}
        </Box>

        {/* Contrôles de la carte - Réorganisés VERTICALEMENT */}
        <Box position="absolute" top={4} right={4} zIndex={500}>
          <Card shadow="md">
            <CardBody p={3}>
              {/* Outils principaux verticaux */}
              <VStack spacing={3} align="stretch">
                {/* Mode de carte */}
                <VStack spacing={2} align="stretch">
                  <Text fontSize="xs" fontWeight="medium" color="gray.600">Mode carte</Text>
                  <HStack spacing={2} justify="center">
                    <Tooltip label="Vue satellite">
                      <IconButton 
                        icon={<FiGrid />} 
                        size="sm" 
                        colorScheme={mapStyle === 'satellite' ? 'brand' : 'gray'} 
                        onClick={() => setMapStyle('satellite')} 
                      />
                    </Tooltip>
                    <Tooltip label="Vue topographique">
                      <IconButton 
                        icon={<FiNavigation />} 
                        size="sm" 
                        colorScheme={mapStyle === 'topographic' ? 'brand' : 'gray'} 
                        onClick={() => setMapStyle('topographic')} 
                      />
                    </Tooltip>
                  </HStack>
                </VStack>

                {/* Zoom */}
                <VStack spacing={2} align="stretch">
                  <Text fontSize="xs" fontWeight="medium" color="gray.600">Zoom</Text>
                  <HStack spacing={2} justify="center">
                    <Tooltip label="Zoom avant">
                      <IconButton 
                        icon={<FiZoomIn />} 
                        size="sm" 
                        onClick={() => mapRef.current?.zoomIn()} 
                      />
                    </Tooltip>
                    <Tooltip label="Zoom arrière">
                      <IconButton 
                        icon={<FiZoomOut />} 
                        size="sm" 
                        onClick={() => mapRef.current?.zoomOut()} 
                      />
                    </Tooltip>
                    <Tooltip label="Centrer sur le Togo">
                      <IconButton 
                        icon={<FiTarget />} 
                        size="sm" 
                        onClick={() => mapRef.current?.flyTo(8.5, 0.8, 10)} 
                      />
                    </Tooltip>
                  </HStack>
                </VStack>

                {/* Options d'affichage */}
                <VStack spacing={2} align="stretch">
                  <Text fontSize="xs" fontWeight="medium" color="gray.600">Affichage</Text>
                  <VStack spacing={2} align="stretch">
                    {/* Labels */}
                    <HStack spacing={2} w="full" justify="space-between">
                      <HStack spacing={2}>
                        <FiEye size={14} />
                        <Text fontSize="xs">Labels</Text>
                      </HStack>
                      <Switch 
                        size="sm" 
                        isChecked={showLabels}
                        onChange={(e) => setShowLabels(e.target.checked)}
                        colorScheme="brand"
                      />
                    </HStack>
                    
                    {/* Communes */}
                    <HStack spacing={2} w="full" justify="space-between">
                      <HStack spacing={2}>
                        <FiLayers size={14} />
                        <Text fontSize="xs">Communes</Text>
                      </HStack>
                      <Switch 
                        size="sm" 
                        isChecked={showCommunes}
                        onChange={(e) => setShowCommunes(e.target.checked)}
                        colorScheme="brand"
                      />
                    </HStack>
                  </VStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </Box>

        {/* Carte interactive - Prend toute la largeur */}
        <InteractiveDrawingMap
          ref={mapRef}
          style={mapStyle}
          showLabels={showLabels}
          center={mapCenter}
          zoom={mapZoom}
          bounds={mapBounds} // Passer les limites
          onGeometryComplete={handleGeometryComplete}
          drawingMode={drawingMode}
          isDrawing={isDrawing}
          geometry={geometry}
          drawingToolsRef={drawingToolsRef}
          communesData={communesGeoJSON}
          showCommunes={showCommunes}
          onDrawingStart={handleDrawingStart}
          onDrawingEnd={handleDrawingEnd}
          fullScreen={true} // Ajouté pour indiquer le mode plein écran
        />

        {isDrawing && (
          <Box 
            position="absolute" 
            bottom={4} 
            left="50%" 
            transform="translateX(-50%)" 
            zIndex={500}
          >
            <Alert status="info" borderRadius="full" shadow="lg">
              <AlertIcon />
              <Text fontWeight="medium">
                👆 Cliquez sur la carte pour dessiner un polygone. Double-cliquez pour terminer.
              </Text>
            </Alert>
          </Box>
        )}

        {/* Bouton flottant pour ouvrir le panneau */}
        {geometry && !isOpen && (
          <Box 
            position="absolute" 
            bottom={4} 
            left={4} 
            zIndex={500}
          >
            <Button 
              leftIcon={<FiMenu />} 
              colorScheme="brand" 
              onClick={onOpen}
              shadow="lg"
              size="lg"
            >
              Ouvrir le panneau
            </Button>
          </Box>
        )}
      </Box>

      {/* Drawer pour la palette latérale */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            🗺️ Informations de la réserve
          </DrawerHeader>

          <DrawerBody overflowY="auto">
            {/* Panneau des outils de dessin */}
            <Collapse in={showDrawingTools} animateOpacity>
              <DrawingToolsPanel 
                drawingMode={drawingMode} 
                setDrawingMode={setDrawingMode} 
                isDrawing={isDrawing} 
                setIsDrawing={setIsDrawing} 
                onClear={handleClearDrawing} 
                geometry={geometry} 
                measurements={measurements} 
                drawingToolsRef={drawingToolsRef} 
                onDrawingStart={handleDrawingStart}
                onDrawingEnd={handleDrawingEnd}
              />
              <Divider my={6} />
            </Collapse>

            {/* Info de la zone */}
            {geometry && (
              <>
                <ZoneInfoPanel 
                  geometry={geometry} 
                  measurements={measurements} 
                  zoneName={zoneName} 
                  setZoneName={setZoneName} 
                />
                <Divider my={6} />
              </>
            )}

            {/* SECTION DES INFORMATIONS DE RÉSERVE */}
            <VStack spacing={4} align="stretch" mb={6}>
              <Heading size="sm">📝 Informations de la réserve</Heading>
              
              <FormControl isRequired>
                <FormLabel>Nom de la réserve</FormLabel>
                <Input 
                  placeholder="Ex: Réserve de Blitta" 
                  value={formData.nom} 
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })} 
                />
              </FormControl>
              
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Type</FormLabel>
                  <Select 
                    value={formData.type} 
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })} 
                    placeholder="Sélectionner"
                  >
                    <option value="ADMINISTRATIF">Administratif</option>
                    <option value="MILITAIRE">Militaire</option>
                    <option value="RESERVE_NATURELLE">Réserve naturelle</option>
                    <option value="PROTEGE">Zone protégée</option>
                    <option value="COMMUNAUTAIRE">Communautaire</option>
                    <option value="PRIVE">Privé</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Statut</FormLabel>
                  <Select 
                    value={formData.statut} 
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  >
                    <option value="EN_PROJET">En projet</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="RESERVE">Réservé</option>
                    <option value="PROTEGE">Protégé</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Superficie (ha)</FormLabel>
                <NumberInput value={formData.superficie.toFixed(2)} isReadOnly>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {formData.superficie > 0 
                    ? `≈ ${(formData.superficie * 10000).toLocaleString()} m²` 
                    : 'Calculée automatiquement après le dessin'}
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Propriétaire</FormLabel>
                <Input 
                  placeholder="Ex: État, Collectivité, Privé..." 
                  value={formData.proprietaire} 
                  onChange={(e) => setFormData({ ...formData, proprietaire: e.target.value })} 
                />
              </FormControl>

              <FormControl>
                <FormLabel>Référence administrative</FormLabel>
                <Input 
                  placeholder="Référence administrative ou légale" 
                  value={formData.reference} 
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })} 
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea 
                  placeholder="Description de la réserve..." 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  rows={3} 
                />
              </FormControl>
            </VStack>

            {geometry && (
              <>
                <Divider my={6} />
                <VStack spacing={3} align="stretch">
                  <Heading size="sm">📍 Coordonnées</Heading>
                  <Card variant="outline">
                    <CardBody>
                      <VStack spacing={2} align="start">
                        <Text fontSize="sm"><strong>Latitude :</strong> {measurements.centerLat.toFixed(6)}°</Text>
                        <Text fontSize="sm"><strong>Longitude :</strong> {measurements.centerLng.toFixed(6)}°</Text>
                        <Text fontSize="sm"><strong>Localisation :</strong> {formData.localisation}</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    leftIcon={<FiDownload />} 
                    onClick={() => {
                      const geoJSON = { 
                        type: "Feature", 
                        properties: formData, 
                        geometry 
                      };
                      const dataStr = JSON.stringify(geoJSON, null, 2);
                      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                      const linkElement = document.createElement('a');
                      linkElement.setAttribute('href', dataUri);
                      linkElement.setAttribute('download', `reserve_${formData.nom || 'zone'}.geojson`);
                      linkElement.click();
                    }}
                  >
                    Exporter en GeoJSON
                  </Button>
                </VStack>
              </>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default NouvelleReservePage;
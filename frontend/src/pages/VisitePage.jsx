// src/pages/VisitePage.jsx
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Flex,
  Avatar,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  useToast,
  Select,
} from '@chakra-ui/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FiSearch, 
  FiX, 
  FiUser,
  FiLogOut,
  FiZoomIn,
  FiMapPin,
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

import InteractiveMap from '../components/ui/InteractiveMap';
import { useAuth } from '../context/AuthContext'; // Corrigé: un seul niveau
import { reserveService } from '../services/apiService'; // Corrigé: un seul niveau

const VisitePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user, logout } = useAuth();
  const [existingReserves, setExistingReserves] = useState([]);
  const [allReserves, setAllReserves] = useState([]);
  const [loadingReserves, setLoadingReserves] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReserve, setSelectedReserve] = useState('');
  const [highlightedZoneId, setHighlightedZoneId] = useState(null);
  const [highlightedZoneName, setHighlightedZoneName] = useState('');
  const [zoomData, setZoomData] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const searchInputRef = useRef(null);
  const mapRef = useRef(null);

  // Extraire les paramètres depuis l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get('highlight');
    
    if (highlightId) {
      setHighlightedZoneId(highlightId);
      setSelectedReserve(highlightId);
      
      const lat = params.get('lat');
      const lng = params.get('lng');
      const zoom = params.get('zoom');
      const minLat = params.get('minLat');
      const minLng = params.get('minLng');
      const maxLat = params.get('maxLat');
      const maxLng = params.get('maxLng');
      
      if (lat && lng && zoom) {
        setZoomData({
          center: [parseFloat(lng), parseFloat(lat)],
          zoom: parseInt(zoom),
          bounds: minLat && minLng && maxLat && maxLng ? [
            [parseFloat(minLng), parseFloat(minLat)],
            [parseFloat(maxLng), parseFloat(maxLat)]
          ] : null
        });
      }
    }
  }, [location.search]);

  // Charger les réserves existantes
  useEffect(() => {
    const loadExistingReserves = async () => {
      try {
        setLoadingReserves(true);
        setError(null);
        const reserves = await reserveService.getAll();
        
        setAllReserves(reserves.filter(r => r.zone));
        
        const formattedReserves = reserves.map(reserve => {
          try {
            if (reserve.zone) {
              const zoneData = JSON.parse(reserve.zone);
              const isHighlighted = highlightedZoneId && reserve.id.toString() === highlightedZoneId;
              
              if (isHighlighted) {
                setHighlightedZoneName(reserve.nom);
              }
              
              return {
                id: reserve.id,
                properties: {
                  nom: reserve.nom,
                  type: reserve.type,
                  statut: reserve.statut,
                  superficie: reserve.superficie,
                  localisation: reserve.localisation,
                  isHighlighted: isHighlighted,
                },
                geometry: zoneData.geometry || zoneData,
                color: isHighlighted 
                  ? 'rgba(155, 89, 182, 0.7)'
                  : getColorByStatut(reserve.statut),
                borderColor: isHighlighted
                  ? '#9B59B6'
                  : getBorderColorByStatut(reserve.statut),
                borderWidth: isHighlighted ? 4 : 1,
                fillOpacity: isHighlighted ? 0.6 : 0.3,
              };
            }
            return null;
          } catch (error) {
            console.error(`Erreur parsing zone pour réserve ${reserve.id}:`, error);
            return null;
          }
        }).filter(r => r !== null);
        
        setExistingReserves(formattedReserves);
        
      } catch (error) {
        console.error('Erreur chargement réserves existantes:', error);
        setError('Impossible de charger les réserves. Vérifiez votre connexion.');
      } finally {
        setLoadingReserves(false);
      }
    };

    loadExistingReserves();
  }, [highlightedZoneId]);

  const getColorByStatut = (statut) => {
    const colorMap = {
      'EN_PROJET': 'rgba(255, 193, 7, 0.3)',
      'EN_COURS': 'rgba(33, 150, 243, 0.3)',
      'RESERVE': 'rgba(76, 175, 80, 0.3)',
      'PROTEGE': 'rgba(244, 67, 54, 0.3)',
    };
    return colorMap[statut] || 'rgba(158, 158, 158, 0.3)';
  };

  const getBorderColorByStatut = (statut) => {
    const colorMap = {
      'EN_PROJET': '#FFC107',
      'EN_COURS': '#2196F3',
      'RESERVE': '#4CAF50',
      'PROTEGE': '#F44336',
    };
    return colorMap[statut] || '#9E9E9E';
  };

  const filteredReserves = existingReserves.filter(reserve => {
    return searchQuery === '' || 
      reserve.properties.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reserve.properties.localisation.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Fonction sécurisée pour zoomer sur la carte
  const safeZoomTo = useCallback((center, zoom, bounds) => {
    if (!mapRef.current || !isMapReady) {
      console.warn('Carte non disponible pour le zoom');
      return false;
    }

    try {
      if (bounds && mapRef.current.fitBounds) {
        mapRef.current.fitBounds(bounds, {
          padding: [30, 30],
          maxZoom: 18,
          animate: true,
          duration: 1.5
        });
        return true;
      } else if (center && mapRef.current.flyTo) {
        mapRef.current.flyTo({
          center: center,
          zoom: zoom || 13,
          duration: 1000
        });
        return true;
      }
    } catch (error) {
      console.error('Erreur lors du zoom:', error);
      return false;
    }
    
    return false;
  }, [isMapReady]);

  const calculateZoomData = (reserve) => {
    if (!reserve || !reserve.zone) return null;
    
    try {
      const zoneData = JSON.parse(reserve.zone);
      
      if (zoneData.geometry && zoneData.geometry.coordinates) {
        const coordinates = zoneData.geometry.coordinates;
        
        if (zoneData.geometry.type === 'Polygon' && coordinates[0]) {
          const points = coordinates[0];
          
          let minLat = Infinity;
          let maxLat = -Infinity;
          let minLng = Infinity;
          let maxLng = -Infinity;
          
          points.forEach(point => {
            const [lng, lat] = point;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
          });
          
          const centerLat = (minLat + maxLat) / 2;
          const centerLng = (minLng + maxLng) / 2;
          
          const latDiff = maxLat - minLat;
          const lngDiff = maxLng - minLng;
          
          let zoomLevel = 12;
          
          if (latDiff > 0.5 || lngDiff > 0.5) zoomLevel = 10;
          if (latDiff > 1 || lngDiff > 1) zoomLevel = 9;
          if (latDiff < 0.1 && lngDiff < 0.1) zoomLevel = 15;
          if (latDiff < 0.05 && lngDiff < 0.05) zoomLevel = 17;
          
          return {
            center: [centerLng, centerLat],
            zoom: zoomLevel,
            bounds: [[minLng, minLat], [maxLng, maxLat]],
            name: reserve.nom
          };
        }
      }
    } catch (error) {
      console.error('Erreur calcul zoom:', error);
    }
    
    if (reserve.latitude && reserve.longitude) {
      return {
        center: [reserve.longitude, reserve.latitude],
        zoom: 13,
        bounds: null,
        name: reserve.nom
      };
    }
    
    return null;
  };

  // Fonction pour zoomer sur une réserve avec vérification de la carte
  const handleReserveSelect = (reserveId) => {
    if (!reserveId) {
      clearHighlight();
      return;
    }
    
    const reserve = allReserves.find(r => r.id.toString() === reserveId);
    if (!reserve) return;
    
    setSelectedReserve(reserveId);
    setHighlightedZoneId(reserveId);
    setHighlightedZoneName(reserve.nom);
    
    const zoomData = calculateZoomData(reserve);
    if (zoomData) {
      setZoomData(zoomData);
      
      const params = new URLSearchParams({
        highlight: reserveId,
        lat: zoomData.center[1].toFixed(6),
        lng: zoomData.center[0].toFixed(6),
        zoom: zoomData.zoom.toString()
      });
      
      if (zoomData.bounds) {
        params.append('minLat', zoomData.bounds[0][1].toFixed(6));
        params.append('minLng', zoomData.bounds[0][0].toFixed(6));
        params.append('maxLat', zoomData.bounds[1][1].toFixed(6));
        params.append('maxLng', zoomData.bounds[1][0].toFixed(6));
      }
      
      navigate(`/visite?${params.toString()}`, { replace: true });
      
      // Attendre que la carte soit prête si nécessaire
      if (!isMapReady) {
        console.log('En attente de la carte...');
        return;
      }
      
      // Tenter de zoomer immédiatement
      const zoomSuccessful = safeZoomTo(zoomData.center, zoomData.zoom, zoomData.bounds);
      
      if (!zoomSuccessful) {
        // Si échec, réessayer après un délai
        setTimeout(() => {
          safeZoomTo(zoomData.center, zoomData.zoom, zoomData.bounds);
        }, 500);
      }
      
      toast({
        title: 'Zoom sur la réserve',
        description: `Affichage de "${reserve.nom}"`,
        status: 'success',
        duration: 2000,
      });
    } else {
      setHighlightedZoneId(reserveId);
      setHighlightedZoneName(reserve.nom);
      navigate(`/visite?highlight=${reserveId}`, { replace: true });
      
      toast({
        title: 'Réserve sélectionnée',
        description: `"${reserve.nom}" mise en surbrillance`,
        status: 'info',
        duration: 2000,
      });
    }
  };

  const focusOnHighlightedZone = useCallback(() => {
    if (highlightedZoneId && zoomData && isMapReady) {
      const zoomSuccessful = safeZoomTo(zoomData.center, zoomData.zoom, zoomData.bounds);
      
      if (zoomSuccessful) {
        toast({
          title: 'Zone centrée',
          description: `Zoom sur "${highlightedZoneName}"`,
          status: 'success',
          duration: 2000,
        });
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de centrer la carte. Veuillez réessayer.',
          status: 'error',
          duration: 2000,
        });
      }
    }
  }, [highlightedZoneId, zoomData, highlightedZoneName, isMapReady, safeZoomTo, toast]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const clearHighlight = () => {
    setSelectedReserve('');
    setHighlightedZoneId(null);
    setHighlightedZoneName('');
    setZoomData(null);
    navigate('/visite', { replace: true });
    
    toast({
      title: 'Sélection annulée',
      description: 'Affichage de toutes les zones',
      status: 'info',
      duration: 2000,
    });
  };

  // Fonction pour gérer quand la carte est prête
  const handleMapReady = (mapInstance) => {
    console.log('Carte prête');
    mapRef.current = mapInstance;
    setIsMapReady(true);
    
    // Si on a des données de zoom en attente, les appliquer
    if (zoomData && highlightedZoneId) {
      setTimeout(() => {
        safeZoomTo(zoomData.center, zoomData.zoom, zoomData.bounds);
      }, 300);
    }
  };

  return (
    <Box h="100vh" bg="gray.50" overflow="hidden">
      {/* NAVBAR AVEC LISTE DÉROULANTE */}
      <Box 
        position="fixed" 
        top={0} 
        left={0} 
        right={0} 
        bg="white" 
        borderBottom="1px" 
        borderColor="gray.200" 
        zIndex={1000} 
        shadow="sm"
        py={2}
        px={4}
      >
        <Flex justify="space-between" align="center" h="50px">
          {/* Logo/Titre */}
          <HStack spacing={3}>
            <Text fontSize="md" fontWeight="bold" color="brand.600">
              🗺️ Carte des Réserves
            </Text>
            {!loadingReserves && filteredReserves.length > 0 && (
              <Badge 
                size="sm" 
                colorScheme={highlightedZoneId ? "purple" : "brand"} 
                fontSize="xs" 
                borderRadius="full"
                px={2}
                py={1}
              >
                {filteredReserves.length} zone{filteredReserves.length > 1 ? 's' : ''}
              </Badge>
            )}
          </HStack>

          {/* Barre de recherche ET liste déroulante */}
          <HStack spacing={3} flex="1" maxW="800px" mx={4}>
            {/* Liste déroulante des réserves */}
            <Select
              placeholder="Sélectionner une réserve..."
              value={selectedReserve}
              onChange={(e) => handleReserveSelect(e.target.value)}
              size="md"
              bg="white"
              borderRadius="md"
              h="40px"
              fontSize="14px"
              border="1px"
              borderColor="gray.300"
              _focus={{ 
                borderColor: 'brand.500', 
                boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' 
              }}
              maxW="250px"
              isDisabled={loadingReserves}
            >
              {allReserves.map((reserve) => (
                <option key={reserve.id} value={reserve.id}>
                  {reserve.nom} - {reserve.localisation}
                </option>
              ))}
            </Select>

            {/* Barre de recherche */}
            <InputGroup size="md" flex="1">
              <InputLeftElement pointerEvents="none" h="40px">
                <FiSearch size="16px" color="gray.400" />
              </InputLeftElement>
              <Input
                ref={searchInputRef}
                placeholder="Rechercher une réserve par nom ou localisation..."
                value={searchQuery}
                onChange={handleSearch}
                bg="white"
                borderRadius="md"
                h="40px"
                fontSize="14px"
                border="1px"
                borderColor="gray.300"
                _focus={{ 
                  borderColor: 'brand.500', 
                  boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' 
                }}
                isDisabled={loadingReserves}
              />
              {searchQuery && (
                <InputRightElement h="40px">
                  <IconButton
                    icon={<FiX size="14px" />}
                    size="sm"
                    variant="ghost"
                    onClick={clearSearch}
                    aria-label="Effacer recherche"
                    h="32px"
                    minW="32px"
                  />
                </InputRightElement>
              )}
            </InputGroup>
          </HStack>

          {/* Menu utilisateur et actions */}
          <HStack spacing={2}>
            {/* Bouton pour zone highlightée */}
            {highlightedZoneId && (
              <>
                <Button
                  size="sm"
                  variant="solid"
                  colorScheme="purple"
                  onClick={focusOnHighlightedZone}
                  leftIcon={<FiZoomIn size="14px" />}
                  h="40px"
                  isDisabled={!isMapReady || loadingReserves}
                >
                  Recentrer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="gray"
                  onClick={clearHighlight}
                  leftIcon={<FiX size="14px" />}
                  h="40px"
                >
                  Annuler
                </Button>
              </>
            )}

            {/* Menu utilisateur */}
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<Avatar size="sm" name={user?.username} bg="brand.500" color="white" fontSize="12px" />}
                variant="ghost"
                size="sm"
                minW="40px"
                h="40px"
              />
              <MenuList fontSize="sm" py={2} minW="200px">
                <MenuItem icon={<FiUser size="14px" />} isDisabled>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">{user?.username}</Text>
                    <Text fontSize="xs" color="gray.500">{user?.role}</Text>
                  </VStack>
                </MenuItem>
                <MenuDivider />
                <MenuItem 
                  icon={<FiLogOut size="14px" />} 
                  onClick={handleLogout}
                  color="red.500"
                >
                  Déconnexion
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        {/* Indicateur de réserve sélectionnée */}
        {highlightedZoneId && highlightedZoneName && (
          <HStack spacing={2} mt={2} fontSize="sm">
            <Badge colorScheme="purple" fontSize="xs" px={2} py={0.5} leftIcon={<FiMapPin />}>
              Réserve sélectionnée :
            </Badge>
            <Text fontWeight="medium" color="purple.600">
              {highlightedZoneName}
            </Text>
            <IconButton
              icon={<FiX size="10px" />}
              size="2xs"
              variant="ghost"
              onClick={clearHighlight}
              aria-label="Désélectionner la réserve"
              h="20px"
              minW="20px"
            />
          </HStack>
        )}

        {/* Indicateur de chargement de la carte */}
        {!isMapReady && !loadingReserves && (
          <HStack spacing={2} mt={2} fontSize="xs">
            <Spinner size="xs" color="brand.500" />
            <Text color="gray.500">Initialisation de la carte...</Text>
          </HStack>
        )}
      </Box>

      {/* CARTE PLEINE PAGE */}
      <Box pt={highlightedZoneId ? "90px" : "70px"} h={`calc(100vh - ${highlightedZoneId ? "90px" : "70px"})`}>
        {loadingReserves ? (
          <Box h="100%" display="flex" alignItems="center" justifyContent="center">
            <VStack spacing={3}>
              <Spinner size="lg" color="brand.500" />
              <Text fontSize="sm" color="gray.600">Chargement des réserves...</Text>
            </VStack>
          </Box>
        ) : error ? (
          <Box h="100%" display="flex" alignItems="center" justifyContent="center">
            <Alert status="error" maxW="md" borderRadius="lg" fontSize="sm">
              <AlertIcon />
              {error}
            </Alert>
          </Box>
        ) : (
          <Box h="100%">
            <InteractiveMap
              ref={mapRef}
              existingZones={filteredReserves}
              readOnly={true}
              userRole={user?.role}
              showControls={true}
              initialView={zoomData?.center || [1.1659, 8.6195]}
              initialZoom={zoomData?.zoom || 8}
              showLegend={false}
              highlightZoneId={highlightedZoneId}
              onMapReady={handleMapReady}
              fitBounds={zoomData?.bounds}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default VisitePage;
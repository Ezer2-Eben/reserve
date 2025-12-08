// src/pages/dashboard/reserves.jsx - VERSION AVANCÉE
import {
    Alert,
    AlertIcon,
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Select,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tooltip,
    Tr,
    useDisclosure,
    useToast,
    VStack,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    SimpleGrid,
    Divider,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
    FiEdit,
    FiEye,
    FiMap,
    FiPlus,
    FiSearch,
    FiTrash2,
    FiFilter,
    FiDownload,
    FiBarChart2,
    FiLayers,
    FiGrid
} from 'react-icons/fi';

import InteractiveMap from '../../components/ui/InteractiveMap';
import { useAuth } from '../../context/AuthContext';
import { reserveService } from '../../services/apiService';
import geocodingService from '../../services/geocodingService';

// ==================== COMPOSANT FORMULAIRE AVANCÉ ====================
const ReserveForm = ({ isOpen, onClose, reserve = null, onSuccess, isReadOnly = false }) => {
  const [formData, setFormData] = useState({
    nom: '',
    localisation: '',
    superficie: '',
    type: '',
    latitude: '',
    longitude: '',
    statut: 'ACTIF',
    zone: '',
  });
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reserves, setReserves] = useState([]);
  const [spatialStats, setSpatialStats] = useState(null);

  const toast = useToast();

  useEffect(() => {
    if (reserve) {
      setFormData({
        nom: reserve.nom || '',
        localisation: reserve.localisation || '',
        superficie: reserve.superficie || '',
        type: reserve.type || '',
        latitude: reserve.latitude || '',
        longitude: reserve.longitude || '',
        statut: reserve.statut || 'ACTIF',
        zone: reserve.zone || '',
      });
      
      // Calculer les statistiques spatiales si zone existe
      if (reserve.zone) {
        calculateSpatialStats(reserve.zone);
      }
    } else {
      setFormData({
        nom: '',
        localisation: '',
        superficie: '',
        type: '',
        latitude: '',
        longitude: '',
        statut: 'ACTIF',
        zone: '',
      });
    }
  }, [reserve, isOpen]);

  useEffect(() => {
    const fetchReserves = async () => {
      try {
        const data = await reserveService.getAll();
        setReserves(data);
      } catch (error) {
        console.error('Erreur chargement réserves:', error);
      }
    };
    fetchReserves();
  }, []);

  const calculateSpatialStats = (wkt) => {
    try {
      const area = geocodingService.calculateArea(wkt);
      const perimeter = geocodingService.calculatePerimeter(wkt);
      const bounds = geocodingService.calculateBounds(wkt);
      
      setSpatialStats({
        area,
        perimeter,
        bounds
      });
    } catch (error) {
      console.error('Erreur calcul stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        superficie: formData.superficie ? parseFloat(formData.superficie) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      if (reserve) {
        await reserveService.update(reserve.id, submitData);
        toast({
          title: '✅ Réserve mise à jour',
          description: 'La réserve a été mise à jour avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await reserveService.create(submitData);
        toast({
          title: '✅ Réserve créée',
          description: 'La réserve a été créée avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data || 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleZoneSelect = (zoneData) => {
    setFormData(prev => ({
      ...prev,
      zone: zoneData,
    }));
    
    // Calculer les stats quand une nouvelle zone est sélectionnée
    if (zoneData) {
      try {
        const parsedZone = JSON.parse(zoneData);
        if (parsedZone.geometry) {
          const wkt = geocodingService.convertGeoJSONToWKT(parsedZone);
          if (wkt) {
            calculateSpatialStats(wkt);
          }
        }
      } catch (e) {
        // Si c'est déjà du WKT
        calculateSpatialStats(zoneData);
      }
    }
  };

  const parseZoneData = (zoneString) => {
    if (!zoneString) return null;
    
    try {
      return JSON.parse(zoneString);
    } catch (error) {
      if (typeof zoneString === 'string' && zoneString.startsWith('POLYGON')) {
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[]]
          },
          properties: {
            name: 'Zone WKT'
          }
        };
      }
      return null;
    }
  };

  const showReserveOnMap = (reserve) => {
    if (reserve.zone) {
      const zoneData = parseZoneData(reserve.zone);
      if (zoneData) {
        setFormData(prev => ({
          ...prev,
          zone: reserve.zone
        }));
        setShowMap(true);
        
        toast({
          title: 'Réserve affichée',
          description: `${reserve.nom} est maintenant affichée sur la carte`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Erreur',
          description: 'Format de zone non reconnu',
          status: 'error',
          duration: 3000,
        });
      }
    } else {
      toast({
        title: 'Information',
        description: 'Cette réserve n\'a pas de zone définie',
        status: 'info',
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent maxW="90vw" maxH="90vh" overflowY="auto">
        <ModalHeader>
          {isReadOnly 
            ? `📋 Détails de la réserve: ${reserve?.nom}` 
            : reserve 
              ? '✏️ Modifier la réserve' 
              : '➕ Créer une nouvelle réserve'
          }
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <Tabs variant="enclosed" colorScheme="brand">
              <TabList>
                <Tab>📝 Informations</Tab>
                <Tab>🗺️ Cartographie</Tab>
                {spatialStats && <Tab>📊 Analyses</Tab>}
              </TabList>

              <TabPanels>
                {/* Onglet Informations */}
                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Nom de la réserve</FormLabel>
                      <Input
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        placeholder="Nom de la réserve"
                        isReadOnly={isReadOnly}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Localisation</FormLabel>
                      <Input
                        name="localisation"
                        value={formData.localisation}
                        onChange={handleChange}
                        placeholder="Localisation de la réserve"
                        isReadOnly={isReadOnly}
                      />
                    </FormControl>

                    <HStack spacing={4} w="full">
                      <FormControl isRequired>
                        <FormLabel>Superficie (ha)</FormLabel>
                        <NumberInput
                          value={formData.superficie}
                          onChange={(value) => handleNumberChange('superficie', value)}
                          min={0}
                          precision={2}
                          isReadOnly={isReadOnly}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Type</FormLabel>
                        <Select
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          placeholder="Sélectionner un type"
                          isDisabled={isReadOnly}
                        >
                          <option value="NATUREL">Naturelle</option>
                          <option value="ADMINISTRATIF">Administrative</option>
                          <option value="PROTEGE">Protégée</option>
                          <option value="COMMUNAUTAIRE">Communautaire</option>
                          <option value="PRIVE">Privée</option>
                        </Select>
                      </FormControl>
                    </HStack>

                    <HStack spacing={4} w="full">
                      <FormControl>
                        <FormLabel>Latitude</FormLabel>
                        <NumberInput
                          value={formData.latitude}
                          onChange={(value) => handleNumberChange('latitude', value)}
                          precision={6}
                          isReadOnly={isReadOnly}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Longitude</FormLabel>
                        <NumberInput
                          value={formData.longitude}
                          onChange={(value) => handleNumberChange('longitude', value)}
                          precision={6}
                          isReadOnly={isReadOnly}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel>Statut</FormLabel>
                      <Select
                        name="statut"
                        value={formData.statut}
                        onChange={handleChange}
                        isDisabled={isReadOnly}
                      >
                        <option value="ACTIF">Actif</option>
                        <option value="INACTIF">Inactif</option>
                        <option value="EN_MAINTENANCE">En maintenance</option>
                        <option value="EN_PROJET">En projet</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </TabPanel>

                {/* Onglet Cartographie */}
                <TabPanel>
                  <VStack spacing={4}>
                    <HStack justify="space-between" w="full">
                      <Heading size="sm">Délimitation de la zone</Heading>
                      {!isReadOnly && (
                        <Button
                          size="sm"
                          leftIcon={showMap ? <FiEye /> : <FiMap />}
                          onClick={() => setShowMap(!showMap)}
                          colorScheme="blue"
                          variant="outline"
                        >
                          {showMap ? 'Masquer la carte' : 'Afficher la carte'}
                        </Button>
                      )}
                    </HStack>
                    
                    {showMap && (
                      <InteractiveMap 
                        onZoneSelect={handleZoneSelect}
                        initialZone={formData.zone}
                        readOnly={isReadOnly}
                        existingZones={reserves.map(r => {
                          const zoneData = parseZoneData(r.zone);
                          return {
                            id: r.id,
                            name: r.nom,
                            properties: { name: r.nom },
                            geometry: zoneData?.geometry || null
                          };
                        }).filter(r => r.geometry)}
                        reserves={reserves}
                      />
                    )}

                    <FormControl>
                      <FormLabel>Zone (JSON/WKT)</FormLabel>
                      <Textarea
                        name="zone"
                        value={formData.zone}
                        onChange={handleChange}
                        rows={4}
                        isReadOnly={isReadOnly}
                        fontFamily="mono"
                        fontSize="xs"
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>

                {/* Onglet Analyses */}
                {spatialStats && (
                  <TabPanel>
                    <VStack spacing={4}>
                      <Heading size="sm">📊 Analyses Spatiales</Heading>
                      
                      <SimpleGrid columns={2} spacing={4} w="full">
                        {spatialStats.area && (
                          <Card>
                            <CardBody>
                              <Stat>
                                <StatLabel>Superficie</StatLabel>
                                <StatNumber>{spatialStats.area.squareKilometers.toFixed(2)} km²</StatNumber>
                                <StatHelpText>{spatialStats.area.hectares.toFixed(2)} hectares</StatHelpText>
                              </Stat>
                            </CardBody>
                          </Card>
                        )}
                        
                        {spatialStats.perimeter && (
                          <Card>
                            <CardBody>
                              <Stat>
                                <StatLabel>Périmètre</StatLabel>
                                <StatNumber>{spatialStats.perimeter.kilometers.toFixed(2)} km</StatNumber>
                                <StatHelpText>{spatialStats.perimeter.meters.toFixed(0)} mètres</StatHelpText>
                              </Stat>
                            </CardBody>
                          </Card>
                        )}
                      </SimpleGrid>

                      {spatialStats.bounds && (
                        <Card w="full">
                          <CardBody>
                            <Heading size="xs" mb={3}>🧭 Limites géographiques</Heading>
                            <SimpleGrid columns={2} spacing={2} fontSize="sm">
                              <Text><strong>Nord:</strong> {spatialStats.bounds.maxLat.toFixed(6)}°</Text>
                              <Text><strong>Sud:</strong> {spatialStats.bounds.minLat.toFixed(6)}°</Text>
                              <Text><strong>Est:</strong> {spatialStats.bounds.maxLng.toFixed(6)}°</Text>
                              <Text><strong>Ouest:</strong> {spatialStats.bounds.minLng.toFixed(6)}°</Text>
                            </SimpleGrid>
                          </CardBody>
                        </Card>
                      )}
                    </VStack>
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              {isReadOnly ? 'Fermer' : 'Annuler'}
            </Button>
            {!isReadOnly && (
              <Button 
                colorScheme="brand"
                type="submit"
                isLoading={isLoading}
                loadingText="Enregistrement..."
              >
                {reserve ? 'Mettre à jour' : 'Créer'}
              </Button>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

// ==================== COMPOSANT PRINCIPAL ====================
const Reserves = () => {
  const [reserves, setReserves] = useState([]);
  const [filteredReserves, setFilteredReserves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReserve, setSelectedReserve] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [stats, setStats] = useState(null);

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isAdmin } = useAuth();
  const toast = useToast();

  const fetchReserves = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await reserveService.getAll();
      setReserves(data);
      setFilteredReserves(data);
      calculateStats(data);
    } catch (err) {
      console.error('Erreur chargement réserves:', err);
      setError('Erreur lors du chargement des réserves');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalSuperficie = data.reduce((sum, r) => sum + (parseFloat(r.superficie) || 0), 0);
    const byType = data.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});
    const byStatut = data.reduce((acc, r) => {
      acc[r.statut] = (acc[r.statut] || 0) + 1;
      return acc;
    }, {});

    setStats({
      total: data.length,
      totalSuperficie: totalSuperficie,
      byType: byType,
      byStatut: byStatut
    });
  };

  useEffect(() => {
    fetchReserves();
  }, []);

  useEffect(() => {
    let filtered = reserves;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(reserve =>
        reserve.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reserve.localisation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reserve.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par type
    if (filterType) {
      filtered = filtered.filter(r => r.type === filterType);
    }

    // Filtre par statut
    if (filterStatut) {
      filtered = filtered.filter(r => r.statut === filterStatut);
    }

    setFilteredReserves(filtered);
  }, [searchTerm, filterType, filterStatut, reserves]);

  const handleDelete = async () => {
    try {
      await reserveService.delete(selectedReserve.id);
      toast({
        title: '🗑️ Réserve supprimée',
        description: 'La réserve a été supprimée avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchReserves();
      onDeleteClose();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleExport = (format) => {
    // Logique d'export selon le format
    let exportData;
    let filename;

    switch (format) {
      case 'csv':
        exportData = convertToCSV(filteredReserves);
        filename = `reserves_${Date.now()}.csv`;
        break;
      case 'geojson':
        exportData = convertToGeoJSON(filteredReserves);
        filename = `reserves_${Date.now()}.geojson`;
        break;
      case 'json':
      default:
        exportData = JSON.stringify(filteredReserves, null, 2);
        filename = `reserves_${Date.now()}.json`;
    }

    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: '💾 Export réussi',
      description: `Fichier ${filename} téléchargé`,
      status: 'success',
      duration: 3000
    });
  };

  const convertToCSV = (data) => {
    const headers = ['ID', 'Nom', 'Localisation', 'Superficie', 'Type', 'Statut', 'Latitude', 'Longitude'];
    const rows = data.map(r => [
      r.id,
      r.nom,
      r.localisation,
      r.superficie,
      r.type,
      r.statut,
      r.latitude,
      r.longitude
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const convertToGeoJSON = (data) => {
    const features = data.filter(r => r.zone).map(r => {
      try {
        const zoneData = JSON.parse(r.zone);
        return {
          ...zoneData,
          properties: {
            ...zoneData.properties,
            id: r.id,
            nom: r.nom,
            type: r.type,
            statut: r.statut
          }
        };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    return JSON.stringify({
      type: "FeatureCollection",
      features: features
    }, null, 2);
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      ACTIF: { color: 'green', text: 'Actif' },
      INACTIF: { color: 'red', text: 'Inactif' },
      EN_MAINTENANCE: { color: 'orange', text: 'En maintenance' },
      EN_PROJET: { color: 'blue', text: 'En projet' },
    };
    const config = statusConfig[statut] || { color: 'gray', text: statut };
    return <Badge colorScheme={config.color}>{config.text}</Badge>;
  };

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* En-tête avec statistiques */}
        <Flex justify="space-between" align="start" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" color="gray.700" mb={2}>
              🗺️ Gestion des Réserves (SIG Avancé)
            </Heading>
            <Text color="gray.500">
              Système d'Information Géographique pour la gestion des réserves
            </Text>
          </Box>
          
          {isAdmin() && (
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brand"
              onClick={() => {
                setSelectedReserve(null);
                onFormOpen();
              }}
              size="lg"
            >
              Nouvelle réserve
            </Button>
          )}
        </Flex>

        {/* Statistiques */}
        {stats && (
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Réserves</StatLabel>
                  <StatNumber>{stats.total}</StatNumber>
                  <StatHelpText>Enregistrées</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Superficie Totale</StatLabel>
                  <StatNumber>{stats.totalSuperficie.toFixed(0)} ha</StatNumber>
                  <StatHelpText>{(stats.totalSuperficie / 100).toFixed(2)} km²</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Réserves Actives</StatLabel>
                  <StatNumber>{stats.byStatut.ACTIF || 0}</StatNumber>
                  <StatHelpText>{stats.total > 0 ? ((stats.byStatut.ACTIF / stats.total) * 100).toFixed(0) : 0}%</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Types</StatLabel>
                  <StatNumber>{Object.keys(stats.byType).length}</StatNumber>
                  <StatHelpText>Catégories</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Barre de recherche et filtres */}
        <HStack spacing={4} flexWrap="wrap">
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Rechercher une réserve..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Menu>
            <MenuButton as={Button} leftIcon={<FiFilter />} variant="outline">
              Filtres
            </MenuButton>
            <MenuList>
              <Select 
                placeholder="Tous les types" 
                size="sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                mb={2}
                mx={2}
                width="auto"
              >
                <option value="NATUREL">Naturelle</option>
                <option value="ADMINISTRATIF">Administrative</option>
                <option value="PROTEGE">Protégée</option>
                <option value="COMMUNAUTAIRE">Communautaire</option>
                <option value="PRIVE">Privée</option>
              </Select>
              
              <Select 
                placeholder="Tous les statuts" 
                size="sm"
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                mx={2}
                width="auto"
              >
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
                <option value="EN_MAINTENANCE">En maintenance</option>
                <option value="EN_PROJET">En projet</option>
              </Select>
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} leftIcon={<FiDownload />} variant="outline" colorScheme="purple">
              Export
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleExport('csv')}>📄 CSV</MenuItem>
              <MenuItem onClick={() => handleExport('geojson')}>🌍 GeoJSON</MenuItem>
              <MenuItem onClick={() => handleExport('json')}>📋 JSON</MenuItem>
            </MenuList>
          </Menu>

          {(filterType || filterStatut || searchTerm) && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setSearchTerm('');
                setFilterType('');
                setFilterStatut('');
              }}
            >
              Réinitialiser
            </Button>
          )}
        </HStack>

        {/* Tableau */}
        <Card shadow="sm" border="1px" borderColor="gray.200">
          <CardBody>
            {isLoading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" color="brand.500" />
                <Text mt={4} color="gray.500">Chargement des réserves...</Text>
              </Box>
            ) : filteredReserves.length === 0 ? (
              <Box textAlign="center" py={8}>
                <FiMap size={48} color="gray" style={{ margin: '0 auto 16px' }} />
                <Text color="gray.500">Aucune réserve trouvée</Text>
                {(searchTerm || filterType || filterStatut) && (
                  <Button 
                    size="sm" 
                    mt={4}
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('');
                      setFilterStatut('');
                    }}
                  >
                    Voir toutes les réserves
                  </Button>
                )}
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th px={4} py={3} fontWeight="semibold" color="gray.700">Nom</Th>
                      <Th px={4} py={3} fontWeight="semibold" color="gray.700">Localisation</Th>
                      <Th px={4} py={3} fontWeight="semibold" color="gray.700">Superficie</Th>
                      <Th px={4} py={3} fontWeight="semibold" color="gray.700">Type</Th>
                      <Th px={4} py={3} fontWeight="semibold" color="gray.700">Statut</Th>
                      <Th px={4} py={3} fontWeight="semibold" color="gray.700">Coordonnées</Th>
                      <Th px={4} py={3} fontWeight="semibold" color="gray.700">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredReserves.map((reserve, index) => (
                      <Tr 
                        key={reserve.id} 
                        bg={index % 2 === 0 ? 'white' : 'gray.50'}
                        _hover={{ bg: 'blue.50', transition: 'all 0.2s' }}
                      >
                        <Td px={4} py={3} fontWeight="medium">
                          <VStack align="start" spacing={0}>
                            <Text>{reserve.nom}</Text>
                            {reserve.zone && (
                              <Badge colorScheme="purple" fontSize="xs">
                                <FiMap style={{ display: 'inline', marginRight: '4px' }} />
                                Zone définie
                              </Badge>
                            )}
                          </VStack>
                        </Td>
                        <Td px={4} py={3}>
                          <Text fontSize="sm">{reserve.localisation}</Text>
                        </Td>
                        <Td px={4} py={3}>
                          <Text fontWeight="semibold">{reserve.superficie} ha</Text>
                          <Text fontSize="xs" color="gray.500">
                            {(parseFloat(reserve.superficie) / 100).toFixed(2)} km²
                          </Text>
                        </Td>
                        <Td px={4} py={3}>
                          <Badge colorScheme="blue" variant="subtle">
                            {reserve.type}
                          </Badge>
                        </Td>
                        <Td px={4} py={3}>{getStatusBadge(reserve.statut)}</Td>
                        <Td px={4} py={3}>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.600">
                              Lat: {reserve.latitude?.toFixed(4) || 'N/A'}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              Lng: {reserve.longitude?.toFixed(4) || 'N/A'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td px={4} py={3}>
                          <HStack spacing={2}>
                            <Tooltip label="Voir les détails">
                              <IconButton
                                icon={<FiEye />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => {
                                  setSelectedReserve(reserve);
                                  onViewOpen();
                                }}
                                aria-label="Voir les détails"
                              />
                            </Tooltip>
                            
                            {isAdmin() && (
                              <>
                                <Tooltip label="Modifier">
                                  <IconButton
                                    icon={<FiEdit />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="orange"
                                    onClick={() => {
                                      setSelectedReserve(reserve);
                                      onFormOpen();
                                    }}
                                    aria-label="Modifier"
                                  />
                                </Tooltip>
                                <Tooltip label="Supprimer">
                                  <IconButton
                                    icon={<FiTrash2 />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => {
                                      setSelectedReserve(reserve);
                                      onDeleteOpen();
                                    }}
                                    aria-label="Supprimer"
                                  />
                                </Tooltip>
                              </>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Résumé des résultats */}
        {filteredReserves.length > 0 && (
          <HStack justify="space-between" px={4}>
            <Text fontSize="sm" color="gray.600">
              Affichage de {filteredReserves.length} réserve{filteredReserves.length > 1 ? 's' : ''} 
              {reserves.length !== filteredReserves.length && ` sur ${reserves.length} au total`}
            </Text>
            {(searchTerm || filterType || filterStatut) && (
              <Badge colorScheme="blue">
                Filtres actifs
              </Badge>
            )}
          </HStack>
        )}
      </VStack>

      {/* Modal de formulaire */}
      <ReserveForm
        isOpen={isFormOpen}
        onClose={onFormClose}
        reserve={selectedReserve}
        onSuccess={fetchReserves}
        isReadOnly={false}
      />

      {/* Modal de visualisation */}
      <ReserveForm
        isOpen={isViewOpen}
        onClose={onViewClose}
        reserve={selectedReserve}
        onSuccess={fetchReserves}
        isReadOnly={true}
      />

      {/* Modal de confirmation de suppression */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent>
          <ModalHeader>⚠️ Confirmer la suppression</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="warning">
                <AlertIcon />
                <Text fontSize="sm">
                  Cette action est irréversible et supprimera toutes les données associées.
                </Text>
              </Alert>
              <Text>
                Êtes-vous sûr de vouloir supprimer la réserve <strong>"{selectedReserve?.nom}"</strong> ?
              </Text>
              {selectedReserve?.zone && (
                <Text fontSize="sm" color="red.600">
                  ⚠️ La zone géographique associée sera également supprimée.
                </Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Annuler
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Supprimer définitivement
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Reserves;
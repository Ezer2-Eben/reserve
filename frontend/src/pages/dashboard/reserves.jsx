// src/pages/dashboard/reserves.jsx
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
  VStack
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
  FiEdit,
  FiEye,
  FiMap,
  FiPlus,
  FiSearch,
  FiTrash2
} from 'react-icons/fi';

import InteractiveMap from '../../components/ui/InteractiveMap';
import { useAuth } from '../../context/AuthContext';
import { reserveService } from '../../services/apiService';

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

  // Charger les réserves existantes
  useEffect(() => {
    const fetchReserves = async () => {
      try {
        const data = await reserveService.getAll();
        setReserves(data);
      } catch (error) {
        console.error('Erreur lors du chargement des réserves:', error);
      }
    };
    fetchReserves();
  }, []);

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
          title: 'Réserve mise à jour',
          description: 'La réserve a été mise à jour avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await reserveService.create(submitData);
        toast({
          title: 'Réserve créée',
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
  };

  // Fonction utilitaire pour parser les zones (JSON ou WKT)
  const parseZoneData = (zoneString) => {
    if (!zoneString) return null;

    try {
      // Essayer de parser comme JSON
      return JSON.parse(zoneString);
    } catch (error) {
      // Si ce n'est pas du JSON, essayer de parser comme WKT
      if (typeof zoneString === 'string' && zoneString.startsWith('POLYGON')) {
        // Convertir WKT en format GeoJSON simple
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[]] // Format simplifié pour l'affichage
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
          description: 'Format de zone non reconnu pour cette réserve',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: 'Information',
        description: 'Cette réserve n\'a pas de zone définie',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent maxW="90vw">
        <ModalHeader>
          {isReadOnly
            ? `Détails de la réserve: ${reserve?.nom}`
            : 'Modifier la réserve'
          }
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={6}>
              {/* Informations de base */}
              <Box w="full">
                <Heading size="md" mb={4}>Informations de base</Heading>
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
              </Box>

              {/* Carte interactive */}
              <Box w="full">
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">Délimitation de la zone</Heading>
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

                {/* Section des réserves existantes */}
                <Box w="full" mt={4}>
                  <Heading size="sm" mb={3}>Réserves existantes</Heading>
                  <Text fontSize="sm" color="gray.600" mb={3}>
                    Cliquez sur une réserve pour l'afficher sur la carte
                  </Text>
                  <Box
                    maxH="200px"
                    overflowY="auto"
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    p={3}
                    bg="gray.50"
                  >
                    {reserves.length === 0 ? (
                      <Text color="gray.500" textAlign="center" py={4}>
                        Aucune réserve existante
                      </Text>
                    ) : (
                      <VStack spacing={2} align="stretch">
                        {reserves.map((reserve) => (
                          <HStack
                            key={reserve.id}
                            justify="space-between"
                            p={2}
                            bg="white"
                            borderRadius="md"
                            border="1px"
                            borderColor="gray.200"
                            _hover={{ bg: "gray.100" }}
                            transition="all 0.2s"
                          >
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight="medium" fontSize="sm">
                                {reserve.nom}
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                {reserve.localisation} - {reserve.type}
                              </Text>
                            </VStack>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                leftIcon={<FiMap />}
                                colorScheme="blue"
                                variant="outline"
                                onClick={() => showReserveOnMap(reserve)}
                                isDisabled={!reserve.zone}
                              >
                                Voir sur carte
                              </Button>
                            </HStack>
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </Box>
                </Box>

                <FormControl mt={4}>
                  <FormLabel>Zone (JSON coordonnées)</FormLabel>
                  <Textarea
                    name="zone"
                    value={formData.zone}
                    onChange={handleChange}
                    placeholder='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[lng1,lat1],[lng2,lat2],...]]}}'
                    rows={4}
                    isReadOnly={isReadOnly}
                  />
                </FormControl>
              </Box>
            </VStack>
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
                {reserve ? 'Mettre à jour' : ''}
              </Button>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

const Reserves = () => {
  const [reserves, setReserves] = useState([]);
  const [filteredReserves, setFilteredReserves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReserve, setSelectedReserve] = useState(null);

  // Correction des hooks useDisclosure
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isAdmin } = useAuth();
  const toast = useToast();

  // Fonction de test d'insertion
  const testInsertion = async () => {
    try {
      console.log('=== TEST INSERTION ===');

      const testData = {
        nom: 'Test Réserve ' + new Date().getTime(),
        localisation: 'Test Localisation',
        superficie: 100,
        type: 'Parc National',
        statut: 'ACTIF',
        latitude: 10.5,
        longitude: 1.2,
        zone: 'POLYGON((1.2 10.5, 1.3 10.5, 1.3 10.6, 1.2 10.6, 1.2 10.5))'
      };

      console.log('Données de test:', testData);

      const result = await reserveService.create(testData);
      console.log('Résultat de test:', result);

      toast({
        title: 'Test réussi',
        description: 'Insertion de test effectuée avec succès. Vérifiez la carte pour voir le point noir.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Recharger les réserves
      fetchReserves();

      // Attendre un peu puis vérifier les réserves
      setTimeout(() => {
        console.log('Réserves après création:', reserves);
        console.log('Nombre de réserves:', reserves.length);
      }, 1000);

    } catch (error) {
      console.error('Erreur lors du test d\'insertion:', error);
      toast({
        title: 'Test échoué',
        description: error.message || 'Erreur lors du test d\'insertion',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchReserves = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await reserveService.getAll();
      setReserves(data);
      setFilteredReserves(data);
    } catch (err) {
      console.error('Erreur lors du chargement des réserves:', err);
      setError('Erreur lors du chargement des réserves');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReserves();
  }, []);

  useEffect(() => {
    const filtered = reserves.filter(reserve =>
      reserve.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserve.localisation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserve.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReserves(filtered);
  }, [searchTerm, reserves]);

  const handleDelete = async () => {
    try {
      await reserveService.delete(selectedReserve.id);
      toast({
        title: 'Réserve supprimée',
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
        {/* En-tête */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" color="gray.700" mb={2}>
              Gestion des Réserves
            </Heading>
            <Text color="gray.500">
              Gérez vos réserves administratives et naturelles
            </Text>
          </Box>
          {isAdmin() && (
            <HStack spacing={3}>
              {/* Note: Reserve creation is now handled by the mobile app */}
            </HStack>
          )}
        </Flex>

        {/* Recherche */}
        <HStack spacing={4}>
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
        </HStack>

        {/* Tableau des réserves */}
        <Card shadow="sm" border="1px" borderColor="gray.200">
          <CardBody>
            {isLoading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" color="brand.500" />
                <Text mt={4} color="gray.500">Chargement des réserves...</Text>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th px={4} py={3} fontWeight="semibold" color="gray.700">Code</Th>
                      <Th px={4} py={3} fontWeight="semibold" color="gray.700">Nom</Th>
                      <Th px={4} py={3} fontWeight="semibold" color="gray.700">Localisation</Th>
                      <Th px={4} py={3} fontWeight="semibold" color="gray.700">Superficie</Th>
                      <Th px={4} py={3} fontWeight="semibold" color="gray.700">Type</Th>
                      <Th px={4} py={3} fontWeight="semibold" color="gray.700">Statut</Th>
                      <Th px={4} py={3} fontWeight="semibold" color="gray.700">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredReserves.map((reserve, index) => (
                      <Tr
                        key={reserve.id}
                        bg={index % 2 === 0 ? 'white' : 'gray.50'}
                        _hover={{ bg: 'gray.100' }}
                        transition="background-color 0.2s"
                      >
                        <Td px={4} py={3}>
                          <Badge colorScheme="purple" fontSize="sm">
                            {reserve.code || 'N/A'}
                          </Badge>
                        </Td>
                        <Td px={4} py={3} fontWeight="medium">{reserve.nom}</Td>
                        <Td px={4} py={3}>{reserve.localisation}</Td>
                        <Td px={4} py={3}>{reserve.superficie} ha</Td>
                        <Td px={4} py={3}>{reserve.type}</Td>
                        <Td px={4} py={3}>{getStatusBadge(reserve.statut)}</Td>
                        <Td px={4} py={3}>
                          <HStack spacing={2}>
                            {/* Bouton de visualisation pour tous les utilisateurs */}
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

                            {/* Boutons CRUD seulement pour les admins */}
                            {isAdmin() && (
                              <>
                                <Tooltip label="Modifier">
                                  <IconButton
                                    icon={<FiEdit />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
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
      </VStack>

      {/* Modal de formulaire (admin seulement) */}
      <ReserveForm
        isOpen={isFormOpen}
        onClose={onFormClose}
        reserve={selectedReserve}
        onSuccess={fetchReserves}
        isReadOnly={false}
      />

      {/* Modal de visualisation (tous les utilisateurs) */}
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
          <ModalHeader>Confirmer la suppression</ModalHeader>
          <ModalBody>
            <Text>
              Êtes-vous sûr de vouloir supprimer la réserve "{selectedReserve?.nom}" ?
              Cette action est irréversible.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Annuler
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Supprimer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Reserves;

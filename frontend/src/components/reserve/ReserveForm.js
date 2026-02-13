// src/components/reserve/ReserveForm.js
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,


  Select,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { reserveService } from '../../services/apiService';
import geocodingService from '../../services/geocodingService';

const ReserveForm = ({ zone, onSuccess, onCancel, reserves = [] }) => {
  const toast = useToast();

  // Champs saisis manuellement :
  const [nom, setNom] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [superficie, setSuperficie] = useState('');
  const [type, setType] = useState('');
  const [statut, setStatut] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // État pour les informations de localisation détectées
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Si zone change, détecter automatiquement la localisation
  useEffect(() => {
    if (zone) {
      detectLocationFromZone(zone);
    }
  }, [zone]);

  // Fonction pour détecter la localisation à partir de la zone
  const detectLocationFromZone = async (wktZone) => {
    setIsDetectingLocation(true);
    try {
      const center = geocodingService.calculateZoneCenter(wktZone);
      if (center) {
        const locationInfo = await geocodingService.reverseGeocode(center.lat, center.lng);
        setDetectedLocation(locationInfo);
        
        // Pré-remplir automatiquement les champs
        if (locationInfo.fullLocation) {
          setLocalisation(locationInfo.fullLocation);
        }
        if (locationInfo.primaryLocation) {
          const suggestedName = geocodingService.generateReserveName(locationInfo);
          setNom(suggestedName);
        }
        if (center.lat && center.lng) {
          setLatitude(center.lat.toFixed(6));
          setLongitude(center.lng.toFixed(6));
        }
      }
    } catch (error) {
      console.warn('Impossible de détecter la localisation:', error);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!zone) {
      toast({
        title: 'Zone manquante',
        description: 'Veuillez délimiter une zone sur la carte.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validation des champs requis
    if (!nom.trim()) {
      toast({
        title: 'Nom manquant',
        description: 'Veuillez saisir un nom pour la réserve.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!localisation.trim()) {
      toast({
        title: 'Localisation manquante',
        description: 'Veuillez saisir une localisation pour la réserve.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      console.log('=== DEBUG ReserveForm.handleSubmit ===');
      console.log('Données à envoyer:', {
        nom,
        localisation,
        superficie: superficie ? parseFloat(superficie) : null,
        type,
        statut,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        zone
      });

      const payload = {
        nom: nom.trim(),
        localisation: localisation.trim(),
        superficie: superficie ? parseFloat(superficie) : null,
        type: type || null,
        statut: statut || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        zone: zone.trim()
      };

      console.log('Payload final:', payload);

      const result = await reserveService.create(payload);
      console.log('Résultat de la création:', result);

      toast({
        title: 'Réserve créée',
        description: 'La réserve a bien été enregistrée.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Réinitialiser uniquement les champs manuels :
      setNom('');
      setLocalisation('');
      setSuperficie('');
      setType('');
      setStatut('');
      setLatitude('');
      setLongitude('');

      // Ne pas réinitialiser `zone` ici : la carte garde ton dessin
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('=== ERREUR ReserveForm.handleSubmit ===');
      console.error('Erreur complète:', error);
      console.error('Message d\'erreur:', error.message);
      console.error('Réponse API:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      let errorMessage = "Impossible d'enregistrer la réserve.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Erreur',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        {/* Alerte si zone non définie */}
        {!zone && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              Veuillez d'abord dessiner une zone sur la carte pour définir les limites de votre réserve.
            </Text>
          </Alert>
        )}

        {/* Alerte si zone définie */}
        {zone && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              Zone définie avec succès ! {isDetectingLocation ? 'Détection de la localisation en cours...' : 'Informations de localisation détectées automatiquement.'}
            </Text>
          </Alert>
        )}

        {/* Affichage des informations détectées */}
        {detectedLocation && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="semibold">
                📍 Localisation détectée automatiquement :
              </Text>
              <Text fontSize="xs" color="gray.600">
                <strong>Quartier/Ville :</strong> {detectedLocation.primaryLocation || 'Non détecté'}
              </Text>
              <Text fontSize="xs" color="gray.600">
                <strong>Adresse complète :</strong> {detectedLocation.formattedAddress || 'Non détectée'}
              </Text>
              <Text fontSize="xs" color="gray.500" fontStyle="italic">
                Vous pouvez modifier ces informations ci-dessous si nécessaire.
              </Text>
            </VStack>
          </Alert>
        )}

        <FormControl isRequired>
          <FormLabel fontWeight="semibold" color="gray.700">
            Nom de la réserve
            {detectedLocation && (
              <Text as="span" fontSize="xs" color="blue.500" ml={2}>
                (pré-rempli automatiquement)
              </Text>
            )}
          </FormLabel>
          <Input 
            value={nom} 
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex: Parc National de la Pendjari"
            size="md"
            bg={detectedLocation ? "blue.50" : "white"}
            borderColor={detectedLocation ? "blue.200" : "gray.300"}
          />
          {detectedLocation && (
            <Text fontSize="xs" color="blue.600" mt={1}>
              💡 Suggestion basée sur la localisation détectée. Vous pouvez modifier le nom selon vos besoins.
            </Text>
          )}
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontWeight="semibold" color="gray.700">
            Localisation
            {detectedLocation && (
              <Text as="span" fontSize="xs" color="blue.500" ml={2}>
                (pré-rempli automatiquement)
              </Text>
            )}
          </FormLabel>
          <Input 
            value={localisation} 
            onChange={(e) => setLocalisation(e.target.value)}
            placeholder="Ex: Atacora, Bénin"
            size="md"
            bg={detectedLocation ? "blue.50" : "white"}
            borderColor={detectedLocation ? "blue.200" : "gray.300"}
          />
          {detectedLocation && (
            <Text fontSize="xs" color="blue.600" mt={1}>
              📍 Localisation détectée : {detectedLocation.formattedAddress}
            </Text>
          )}
        </FormControl>

        <FormControl>
          <FormLabel fontWeight="semibold" color="gray.700">Superficie (km²)</FormLabel>
          <Input
            type="number"
            value={superficie}
            onChange={(e) => setSuperficie(e.target.value)}
            placeholder="Ex: 2755"
            size="md"
          />
        </FormControl>

        <FormControl>
          <FormLabel fontWeight="semibold" color="gray.700">Type de réserve</FormLabel>
          <Select value={type} onChange={(e) => setType(e.target.value)} size="md">
            <option value="">Sélectionner un type</option>
            <option value="Parc National">Parc National</option>
            <option value="Réserve Naturelle">Réserve Naturelle</option>
            <option value="Forêt Classée">Forêt Classée</option>
            <option value="Zone de Protection">Zone de Protection</option>
            <option value="Réserve de Biosphère">Réserve de Biosphère</option>
          </Select>
          {detectedLocation && type && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              mt={2}
              onClick={() => {
                const newName = geocodingService.generateReserveName(detectedLocation, type);
                setNom(newName);
              }}
            >
              🔄 Régénérer le nom avec le type sélectionné
            </Button>
          )}
        </FormControl>

        <FormControl>
          <FormLabel fontWeight="semibold" color="gray.700">Statut</FormLabel>
          <Select value={statut} onChange={(e) => setStatut(e.target.value)} size="md">
            <option value="">Sélectionner un statut</option>
            <option value="Active">Active</option>
            <option value="Protégée">Protégée</option>
            <option value="En cours de création">En cours de création</option>
            <option value="Proposée">Proposée</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontWeight="semibold" color="gray.700">Latitude</FormLabel>
          <Input
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="Ex: 10.5"
            size="md"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontWeight="semibold" color="gray.700">Longitude</FormLabel>
          <Input
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Ex: 1.2"
            size="md"
          />
        </FormControl>

        <FormControl>
          <FormLabel fontWeight="semibold" color="gray.700">Zone géographique (WKT)</FormLabel>
          <Textarea 
            value={zone} 
            isReadOnly 
            rows={3} 
            size="md"
            bg="gray.50"
            fontSize="xs"
            fontFamily="mono"
          />
          <Text fontSize="xs" color="gray.500" mt={1}>
            Coordonnées géographiques de la zone délimitée
          </Text>
        </FormControl>

        {/* Boutons d'action */}
        <HStack spacing={3} pt={2}>
          <Button 
            type="submit" 
            colorScheme="green" 
            size="md"
            flex={1}
            isDisabled={!zone}
          >
          Enregistrer la réserve
        </Button>
          <Button 
            type="button"
            variant="outline" 
            colorScheme="gray" 
            size="md"
            flex={1}
            onClick={handleCancel}
          >
            Annuler
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ReserveForm;

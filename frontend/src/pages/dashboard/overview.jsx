// src/pages/dashboard/overview.jsx
import {
    Alert,
    AlertIcon,
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    Center,
    Grid,
    Heading,
    HStack,
    Icon,
    SimpleGrid,
    Spinner,
    Stat,
    StatArrow,
    StatHelpText,
    StatNumber,
    Text,
    VStack
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
    FiAlertTriangle,
    FiClock,
    FiFileText,
    FiFolder,
    FiMap,
    FiUsers
} from 'react-icons/fi';

import { useAuth } from '../../context/AuthContext';
import {
    alerteService,
    documentService,
    historiqueService,
    projetService,
    reserveService,
    utilisateurService
} from '../../services/apiService';
import { testAllAPIs } from '../../utils/testAPI';

const StatCard = ({ title, value, icon, change, changeType, color, isLoading }) => {
  if (isLoading) {
    return (
      <Card shadow="sm" border="1px" borderColor="gray.200">
        <CardBody>
          <Center py={8}>
            <Spinner size="md" color="blue.500" />
          </Center>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card shadow="sm" border="1px" borderColor="gray.200" _hover={{ shadow: 'md' }} transition="all 0.2s">
      <CardBody>
        <HStack justify="space-between" align="flex-start">
          <VStack align="flex-start" spacing={2} flex={1}>
            <Text fontSize="sm" color="gray.500" fontWeight="medium">
              {title}
            </Text>
            <Stat>
              <StatNumber fontSize="2xl" fontWeight="bold" color={`${color}.500`}>
                {value}
              </StatNumber>
              {change && (
                <StatHelpText>
                  <StatArrow type={changeType} />
                  {change}
                </StatHelpText>
              )}
            </Stat>
          </VStack>
          <Box
            p={3}
            borderRadius="lg"
            bg={`${color}.50`}
            color={`${color}.500`}
          >
            <Icon as={icon} boxSize={6} />
          </Box>
        </HStack>
      </CardBody>
    </Card>
  );
};

const RecentActivity = ({ activities, isLoading }) => {
  return (
    <Card shadow="sm" border="1px" borderColor="gray.200">
      <CardBody>
        <VStack align="flex-start" spacing={4}>
          <Heading size="md" color="gray.700">
            Activité récente
          </Heading>
          {isLoading ? (
            <Center py={8}>
              <Spinner size="md" color="blue.500" />
            </Center>
          ) : activities.length > 0 ? (
            <VStack spacing={3} w="full">
              {activities.slice(0, 5).map((activity, index) => (
                <HStack key={index} w="full" justify="space-between" p={3} borderRadius="md" bg="gray.50">
                  <VStack align="flex-start" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      {activity.title}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {activity.description}
                    </Text>
                  </VStack>
                  <Badge colorScheme={activity.status === 'success' ? 'green' : 'orange'}>
                    {activity.status}
                  </Badge>
                </HStack>
              ))}
            </VStack>
          ) : (
            <Text color="gray.500" fontSize="sm">
              Aucune activité récente
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

const Overview = () => {
  const [stats, setStats] = useState({
    reserves: 0,
    alertes: 0,
    projets: 0,
    documents: 0,
    utilisateurs: 0,
    historiques: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('=== DEBUG Overview.fetchDashboardData ===');
        
        // Appels API de base pour tous les utilisateurs
        const [
          reserves,
          alertes,
          projets,
          documents,
          historiques
        ] = await Promise.all([
          reserveService.getAll().catch(err => {
            console.warn('Erreur lors du chargement des réserves:', err);
            return [];
          }),
          alerteService.getAll().catch(err => {
            console.warn('Erreur lors du chargement des alertes:', err);
            return [];
          }),
          projetService.getAll().catch(err => {
            console.warn('Erreur lors du chargement des projets:', err);
            return [];
          }),
          documentService.getAll().catch(err => {
            console.warn('Erreur lors du chargement des documents:', err);
            return [];
          }),
          historiqueService.getAll().catch(err => {
            console.warn('Erreur lors du chargement de l\'historique:', err);
            return [];
          })
        ]);

        // Appel API utilisateurs seulement pour les admins
        let utilisateurs = [];
        if (isAdmin()) {
          try {
            utilisateurs = await utilisateurService.getAll();
          } catch (err) {
            console.warn('Erreur lors du chargement des utilisateurs (admin seulement):', err);
            // On continue sans les utilisateurs si l'erreur survient
          }
        }

        console.log('Données récupérées:', {
          reserves: reserves.length,
          alertes: alertes.length,
          projets: projets.length,
          documents: documents.length,
          utilisateurs: utilisateurs.length,
          historiques: historiques.length,
        });

        setStats({
          reserves: reserves.length,
          alertes: alertes.length,
          projets: projets.length,
          documents: documents.length,
          utilisateurs: utilisateurs.length,
          historiques: historiques.length,
        });

        // Simuler des activités récentes
        const activities = [
          {
            title: 'Nouvelle réserve créée',
            description: 'Réserve "Parc National" ajoutée',
            status: 'success',
          },
          {
            title: 'Alerte mise à jour',
            description: 'Alerte #123 mise à jour',
            status: 'warning',
          },
          {
            title: 'Document uploadé',
            description: 'Plan de gestion uploadé',
            status: 'success',
          },
        ];

        setRecentActivities(activities);
        console.log('=== FIN DEBUG ===');
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données du tableau de bord');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  const statCards = [
    {
      title: 'Réserves',
      value: stats.reserves,
      icon: FiMap,
      color: 'blue',
      change: '+12%',
      changeType: 'increase',
    },
    {
      title: 'Alertes',
      value: stats.alertes,
      icon: FiAlertTriangle,
      color: 'orange',
      change: '+5%',
      changeType: 'increase',
    },
    {
      title: 'Projets',
      value: stats.projets,
      icon: FiFolder,
      color: 'green',
      change: '+8%',
      changeType: 'increase',
    },
    {
      title: 'Documents',
      value: stats.documents,
      icon: FiFileText,
      color: 'purple',
      change: '+15%',
      changeType: 'increase',
    },
    {
      title: 'Historique',
      value: stats.historiques,
      icon: FiClock,
      color: 'teal',
      change: '+3%',
      changeType: 'increase',
    },
    ...(isAdmin() ? [{
      title: 'Utilisateurs',
      value: stats.utilisateurs,
      icon: FiUsers,
      color: 'cyan',
      change: '+2%',
      changeType: 'increase',
    }] : []),
  ];

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
        <Box>
          <HStack justify="space-between" align="center">
            <Box>
              <Heading size="lg" color="gray.700" mb={2}>
                Tableau de bord
              </Heading>
              <Text color="gray.500">
                Vue d'ensemble de votre système de gestion des réserves
              </Text>
            </Box>
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={async () => {
                console.log('Test des APIs...');
                const results = await testAllAPIs();
                console.log('Résultats des tests:', results);
              }}
            >
              Test APIs
            </Button>
          </HStack>
        </Box>

        {/* Statistiques */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {statCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
              icon={card.icon}
              change={card.change}
              changeType={card.changeType}
              color={card.color}
              isLoading={isLoading}
            />
          ))}
        </SimpleGrid>

        {/* Activité récente */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          <RecentActivity activities={recentActivities} isLoading={isLoading} />
          
          {/* Carte d'informations */}
          <Card shadow="sm" border="1px" borderColor="gray.200">
            <CardBody>
              <VStack align="flex-start" spacing={4}>
                <Heading size="md" color="gray.700">
                  Informations système
                </Heading>
                <VStack spacing={3} w="full">
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">
                      Version
                    </Text>
                    <Badge colorScheme="green">1.0.0</Badge>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">
                      Statut API
                    </Text>
                    <Badge colorScheme="green">Connecté</Badge>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">
                      Dernière mise à jour
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Aujourd'hui
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      </VStack>
    </Box>
  );
};

export default Overview;






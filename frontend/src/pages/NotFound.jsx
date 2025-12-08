// src/pages/NotFound.jsx
import {
    Box,
    Button,
    Container,
    Heading,
    Image,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box minH="100vh" bg={bgColor} py={20}>
      <Container maxW="md">
        <VStack spacing={8} textAlign="center">
          {/* Illustration */}
          <Image
            src="https://via.placeholder.com/300x200/0967D2/FFFFFF?text=404"
            alt="Page non trouvée"
            borderRadius="lg"
            shadow="lg"
          />

          {/* Contenu */}
          <VStack spacing={4}>
            <Heading size="2xl" color="brand.600">
              404
            </Heading>
            <Heading size="lg" color="gray.600">
              Page non trouvée
            </Heading>
            <Text color="gray.500" fontSize="lg">
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
            </Text>
          </VStack>

          {/* Actions */}
          <VStack spacing={4} w="full">
            <Button
              colorScheme="brand"
              size="lg"
              w="full"
              onClick={() => navigate('/dashboard')}
            >
              Retour au tableau de bord
            </Button>
            <Button
              variant="outline"
              size="lg"
              w="full"
              onClick={() => navigate('/')}
            >
              Retour à l'accueil
            </Button>
          </VStack>

          {/* Informations supplémentaires */}
          <Text fontSize="sm" color="gray.400">
            Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default NotFound;

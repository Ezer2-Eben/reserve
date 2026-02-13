// src/components/ProtectedRoute.js
import { Box, Center, Spinner, Text, VStack } from '@chakra-ui/react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Afficher un spinner pendant le chargement
  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Center h="100vh">
          <VStack spacing={4}>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="brand.500"
              size="xl"
            />
            <Text color="gray.600" fontSize="lg">
              Chargement...
            </Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Afficher le contenu protégé si authentifié
  return children;
};

export default ProtectedRoute;

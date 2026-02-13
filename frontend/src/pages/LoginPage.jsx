// src/pages/LoginPage.jsx
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import Logo from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Effacer les erreurs quand l'utilisateur tape
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [credentials, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(credentials);
      
      if (result.success) {
        toast({
          title: 'Connexion réussie',
          description: 'Bienvenue dans votre espace de gestion des réserves',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Erreur de connexion',
          description: result.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur inattendue s\'est produite',
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
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="md">
        <VStack spacing={8}>
          {/* Logo et titre */}
          <VStack spacing={6}>
            <Logo size="100px" />
            
            <VStack spacing={2}>
              <Heading 
                size="xl" 
                color="brand.600"
                bgGradient="linear(to-r, brand.600, blue.500)"
                bgClip="text"
                fontWeight="bold"
              >
                Gestion des Réserves
              </Heading>
              <Text 
                color="gray.600" 
                textAlign="center"
                fontSize="lg"
                fontWeight="medium"
              >
                Connectez-vous à votre espace d'administration
              </Text>
            </VStack>
          </VStack>

          {/* Formulaire de connexion */}
          <Card w="full" shadow="lg">
            <CardBody p={8}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <Input
                      name="username"
                      value={credentials.username}
                      onChange={handleChange}
                      placeholder="Entrez votre nom d'utilisateur"
                      size="lg"
                      autoComplete="username"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Mot de passe</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="Entrez votre mot de passe"
                        autoComplete="current-password"
                      />
                      <InputRightElement>
                        <IconButton
                          icon={showPassword ? <FiEyeOff /> : <FiEye />}
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                    loadingText="Connexion..."
                  >
                    Se connecter
                  </Button>

                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Pas encore de compte ?{' '}
                    <Link as={RouterLink} to="/register" color="brand.500" fontWeight="semibold">
                      S'inscrire
                    </Link>
                  </Text>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Informations supplémentaires */}
          <VStack spacing={4} textAlign="center">
            <Text fontSize="sm" color="gray.500">
              Système de gestion des réserves administratives
            </Text>
            <Text fontSize="xs" color="gray.400">
              Version 1.0.0
            </Text>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default LoginPage;

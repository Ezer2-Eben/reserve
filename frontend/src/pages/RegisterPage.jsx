// src/pages/RegisterPage.jsx
import {
    Box,
    Button,
    Card,
    CardBody,
    Container,
    FormControl,
    FormErrorMessage,
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

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register, error, clearError, isAuthenticated } = useAuth();
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
  }, [formData, clearError]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        username: formData.username,
        password: formData.password,
      });
      
      if (result.success) {
        toast({
          title: 'Inscription réussie',
          description: 'Votre compte a été créé avec succès',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Erreur d\'inscription',
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
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
                Créer un compte
              </Heading>
              <Text 
                color="gray.600" 
                textAlign="center"
                fontSize="lg"
                fontWeight="medium"
              >
                Rejoignez notre système de gestion des réserves
              </Text>
            </VStack>
          </VStack>

          {/* Formulaire d'inscription */}
          <Card w="full" shadow="lg">
            <CardBody p={8}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <FormControl isRequired isInvalid={!!errors.username}>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <Input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choisissez un nom d'utilisateur"
                      size="lg"
                      autoComplete="username"
                    />
                    <FormErrorMessage>{errors.username}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.password}>
                    <FormLabel>Mot de passe</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Créez un mot de passe"
                        autoComplete="new-password"
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
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.confirmPassword}>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirmez votre mot de passe"
                        autoComplete="new-password"
                      />
                      <InputRightElement>
                        <IconButton
                          icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          variant="ghost"
                          aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                    loadingText="Création du compte..."
                  >
                    Créer mon compte
                  </Button>

                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Déjà un compte ?{' '}
                    <Link as={RouterLink} to="/login" color="brand.500" fontWeight="semibold">
                      Se connecter
                    </Link>
                  </Text>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Informations supplémentaires */}
          <VStack spacing={4} textAlign="center">
            <Text fontSize="sm" color="gray.500">
              En créant un compte, vous acceptez nos conditions d'utilisation
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

export default RegisterPage;

// src/components/ui/LoadingSpinner.jsx
import {
    Box,
    Center,
    Spinner,
    Text,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

// Animation de pulsation pour le spinner
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

// Animation de rotation pour le spinner
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoadingSpinner = ({
  size = 'md',
  text = 'Chargement...', 
  variant = 'default',
  fullScreen = false 
}) => {
  const bg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const variants = {
    default: {
      spinner: <Spinner size={size} color="brand.500" thickness="3px" speed="0.65s" />,
      animation: spin,
    },
    pulse: {
      spinner: (
        <Box
          w={size === 'sm' ? '20px' : size === 'md' ? '32px' : '48px'}
          h={size === 'sm' ? '20px' : size === 'md' ? '32px' : '48px'}
          borderRadius="full"
          bg="brand.500"
          animation={`${pulse} 1.5s ease-in-out infinite`}
        />
      ),
      animation: pulse,
    },
    dots: {
      spinner: (
        <Box display="flex" gap={2}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              w="8px"
              h="8px"
              borderRadius="full"
              bg="brand.500"
              animation={`${pulse} 1.4s ease-in-out infinite`}
              animationDelay={`${i * 0.2}s`}
            />
          ))}
        </Box>
      ),
      animation: pulse,
    },
  };

  const currentVariant = variants[variant] || variants.default;

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={bg}
        zIndex={9999}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          {currentVariant.spinner}
          {text && (
            <Text color={textColor} fontSize="sm" fontWeight="medium">
              {text}
          </Text>
          )}
        </VStack>
      </Box>
    );
  }

  return (
    <Center py={8}>
      <VStack spacing={4}>
        {currentVariant.spinner}
        {text && (
          <Text color={textColor} fontSize="sm" fontWeight="medium">
            {text}
          </Text>
        )}
      </VStack>
    </Center>
  );
};

// Composant de chargement pour les cartes
export const CardLoadingSpinner = ({ height = '200px' }) => {
  const bg = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Box
      height={height}
      bg={bg}
      borderRadius="lg"
      display="flex"
      alignItems="center"
      justifyContent="center"
      border="1px dashed"
      borderColor="gray.300"
    >
      <LoadingSpinner size="md" text="Chargement..." />
    </Box>
  );
};

// Composant de chargement pour les tableaux
export const TableLoadingSpinner = ({ rows = 5 }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box>
      {Array.from({ length: rows }).map((_, index) => (
        <Box
          key={index}
          p={4}
          borderBottom="1px"
          borderColor={borderColor}
          bg={bg}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <LoadingSpinner size="sm" text="" />
        </Box>
      ))}
    </Box>
  );
};

export default LoadingSpinner;

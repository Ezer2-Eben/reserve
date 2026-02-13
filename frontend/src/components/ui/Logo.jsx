// src/components/ui/Logo.jsx
import { Box, Image } from '@chakra-ui/react';


const Logo = ({ 
  size = "100px", 
  showAnimation = true, 
  showBorder = true,
  showShadow = true,
  ...props 
}) => {
  return (
    <Box
      position="relative"
      {...(showAnimation && {
        _hover: {
          transform: "scale(1.05)",
          transition: "transform 0.3s ease-in-out"
        }
      })}
      {...props}
    >
      <Image
        src="/logo.svg"
        alt="Logo Gestion des Réserves"
        boxSize={size}
        fallbackSrc="/logo-simple.svg"
        {...(showShadow && {
          filter: "drop-shadow(0 4px 8px rgba(9, 103, 210, 0.2))"
        })}
        {...(showBorder && {
          borderRadius: "full",
          border: "3px solid",
          borderColor: "blue.100",
          bg: "white",
          p: 2
        })}
      />
      
      {/* Effet de brillance */}
      {showAnimation && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          borderRadius="full"
          background="linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)"
          opacity="0"
          _hover={{ opacity: 1 }}
          transition="opacity 0.3s ease-in-out"
        />
      )}
    </Box>
  );
};

export default Logo;




// src/components/layouts/DashboardLayout.jsx
import {
    Avatar,
    Box,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    HStack,
    IconButton,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Text,
    useColorModeValue,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useMemo, useState } from 'react';
import {
    FiAlertTriangle,
    FiChevronDown,
    FiClock,
    FiFileText,
    FiFolder,
    FiHome,
    FiLogOut,
    FiMap,
    FiMenu,
    FiSettings,
    FiUsers,
    FiX,
} from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

// Animation pour l'entrée de la sidebar
const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

// Animation pour les éléments du menu
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Icônes pour les menus
const icons = {
  FiHome,
  FiMap,
  FiAlertTriangle,
  FiFileText,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiFolder,
  FiClock,
};

// Menu items définis en dehors du composant
  const menuItems = [
    {
      name: 'Tableau de bord',
      icon: 'FiHome',
      path: '/dashboard',
      roles: ['ADMIN', 'USER'],
    },
    {
      name: 'Réserves',
      icon: 'FiMap',
      path: '/dashboard/reserves',
      roles: ['ADMIN', 'USER'],
    },
    {
      name: 'Alertes',
      icon: 'FiAlertTriangle',
      path: '/dashboard/alertes',
      roles: ['ADMIN', 'USER'],
    },
    {
      name: 'Projets',
      icon: 'FiFolder',
      path: '/dashboard/projets',
      roles: ['ADMIN', 'USER'],
    },
    {
      name: 'Documents',
      icon: 'FiFileText',
      path: '/dashboard/documents',
      roles: ['ADMIN', 'USER'],
    },
    {
      name: 'Historique',
      icon: 'FiClock',
      path: '/dashboard/historique',
      roles: ['ADMIN', 'USER'],
    },
    {
      name: 'Utilisateurs',
      icon: 'FiUsers',
      path: '/dashboard/utilisateurs',
      roles: ['ADMIN'],
    },
  ];

const DashboardLayout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile] = useState(window.innerWidth < 768);
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Optimisation avec useMemo pour éviter les re-renders inutiles
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => item.roles.includes(user?.role));
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Déconnexion',
      description: 'Vous avez été déconnecté avec succès',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    navigate('/login');
  };

  const SidebarContent = ({ onClose, ...rest }) => {
    return (
      <Box
        animation={`${slideIn} 0.3s ease-out`}
        bg={bg}
        borderRight="1px"
        borderRightColor={borderColor}
        w={{ base: 'full', md: 60 }}
        pos="fixed"
        h="full"
        boxShadow="lg"
        {...rest}
      >
        <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
          <Text 
            fontSize="2xl" 
            fontWeight="bold" 
            color="brand.600"
            animation={`${fadeInUp} 0.5s ease-out 0.1s both`}
          >
            Réserves Admin
          </Text>
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onClose}
            variant="ghost"
            icon={<FiX />}
            aria-label="Fermer le menu"
          />
        </Flex>
        <VStack spacing={2} align="stretch" px={4}>
          {filteredMenuItems.map((item, index) => {
              const Icon = icons[item.icon];
              const isActive = location.pathname === item.path;
              
              return (
                <Box
                  key={item.name}
                  as="button"
                  w="full"
                  p={3}
                  borderRadius="lg"
                  bg={isActive ? 'brand.50' : 'transparent'}
                  color={isActive ? 'brand.600' : 'gray.600'}
                  _hover={{
                    bg: isActive ? 'brand.100' : 'gray.100',
                  transform: 'translateX(4px)',
                  }}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) onClose();
                  }}
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-start"
                transition="all 0.2s ease-smooth"
                animation={`${fadeInUp} 0.4s ease-out ${0.1 + index * 0.05}s both`}
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: isActive ? '4px' : '0px',
                  bg: 'brand.500',
                  borderRadius: '0 2px 2px 0',
                  transition: 'width 0.2s ease-smooth',
                }}
                >
                  <Icon size={20} />
                  <Text ml={3} fontWeight={isActive ? 'semibold' : 'normal'}>
                    {item.name}
                  </Text>
                </Box>
              );
            })}
        </VStack>
      </Box>
    );
  };

  const MobileNav = ({ onOpen, ...rest }) => {
    return (
      <Flex
        ml={{ base: 0, md: 60 }}
        px={{ base: 4, md: 4 }}
        height="20"
        alignItems="center"
        bg={bg}
        borderBottomWidth="1px"
        borderBottomColor={borderColor}
        justifyContent={{ base: 'space-between', md: 'flex-end' }}
        {...rest}
      >
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          variant="outline"
          aria-label="open menu"
          icon={<FiMenu />}
        />

        <Text
          display={{ base: 'flex', md: 'none' }}
          fontSize="2xl"
          fontWeight="bold"
          color="brand.600"
        >
          Réserves Admin
        </Text>

        <HStack spacing={{ base: '0', md: '6' }}>
          <Flex alignItems="center">
            <Menu>
              <MenuButton
                py={2}
                transition="all 0.3s"
                _focus={{ boxShadow: 'none' }}
              >
                <HStack>
                  <Avatar
                    size="sm"
                    name={user?.username}
                    bg="brand.500"
                    color="white"
                  />
                  <VStack
                    display={{ base: 'none', md: 'flex' }}
                    alignItems="flex-start"
                    spacing="1px"
                    ml="2"
                  >
                    <Text fontSize="sm" fontWeight="semibold">
                      {user?.username}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {user?.role}
                    </Text>
                  </VStack>
                  <Box display={{ base: 'none', md: 'flex' }}>
                    <FiChevronDown />
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList bg={bg} borderColor={borderColor}>
                <MenuItem onClick={() => navigate('/dashboard')}>
                  <FiHome />
                  <Text ml={2}>Tableau de bord</Text>
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout} color="red.500">
                  <FiLogOut />
                  <Text ml={2}>Déconnexion</Text>
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </HStack>
      </Flex>
    );
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Réserves Admin
          </DrawerHeader>
          <DrawerBody>
            <SidebarContent onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      
      <MobileNav onOpen={onOpen} />
      
      <Box 
        ml={{ base: 0, md: 60 }} 
        p="4"
        animation={`${fadeInUp} 0.6s ease-out 0.2s both`}
      >
        <Box
          p={4}
          bg={bg}
          borderRadius="lg"
          shadow="sm"
          border="1px"
          borderColor={borderColor}
          transition="all 0.3s ease-smooth"
          _hover={{
            shadow: 'md',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

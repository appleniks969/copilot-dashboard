/**
 * Layout.js
 * Main layout component for the application
 */

import React from 'react';
import { Box, Container, Flex, useColorModeValue } from '@chakra-ui/react';

const Layout = ({ children }) => {
  return (
    <Box 
      minH="100vh"
      bg={useColorModeValue('gray.50', 'gray.900')}
    >
      <Container
        maxW="container.xl"
        py={8}
        px={{ base: 4, md: 8 }}
      >
        <Flex 
          direction="column"
          minH="calc(100vh - 4rem)"
        >
          <Box as="main" flex="1">
            {children}
          </Box>
          
          <Box 
            as="footer" 
            textAlign="center" 
            py={4} 
            fontSize="sm" 
            color={useColorModeValue('gray.500', 'gray.400')}
            mt={8}
          >
            GitHub Copilot Dashboard {new Date().getFullYear()}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Layout;
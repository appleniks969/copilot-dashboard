import React from 'react';
import { Box, Container, Flex, Button, useColorModeValue, HStack, Text, Badge } from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Layout = ({ children, title = 'GitHub Copilot Usage Dashboard' }) => {
  const router = useRouter();
  const bgGradient = useColorModeValue(
    'linear(to-b, white, gray.50)',
    'linear(to-b, gray.900, gray.800)'
  );
  const navBg = useColorModeValue('white', 'gray.800');
  const navBorderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.300');

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="GitHub Copilot Usage Dashboard for tracking and analyzing Copilot usage metrics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <Box 
        minH="100vh" 
        bgGradient={bgGradient}
        backgroundAttachment="fixed"
      >
        {/* Navigation */}
        <Box 
          as="nav"
          py={3}
          bg={navBg}
          borderBottomWidth="1px"
          borderColor={navBorderColor}
          position="sticky"
          top={0}
          zIndex={10}
          boxShadow="sm"
        >
          <Container maxW="container.xl">
            <Flex justify="space-between" align="center">
              <Text fontWeight="bold" fontSize="xl" color={activeColor}>
                Copilot Dashboard
              </Text>
              
              <HStack spacing={4}>
                <Link href="/" passHref>
                  <Button 
                    as="a"
                    variant={router.pathname === '/' ? "solid" : "ghost"}
                    colorScheme={router.pathname === '/' ? "blue" : "gray"}
                    size="sm"
                  >
                    Standard
                  </Button>
                </Link>
                
                <Link href="/redesign" passHref>
                  <Button 
                    as="a"
                    variant={router.pathname === '/redesign' ? "solid" : "ghost"}
                    colorScheme={router.pathname === '/redesign' ? "blue" : "gray"}
                    size="sm"
                  >
                    Redesign
                    <Badge ml={2} colorScheme="green" variant="solid" fontSize="0.6em">
                      NEW
                    </Badge>
                  </Button>
                </Link>
              </HStack>
            </Flex>
          </Container>
        </Box>
        
        {/* Main content */}
        <Container 
          maxW="container.xl" 
          pt={6} 
          pb={12}
          px={{ base: 4, md: 6 }}
        >
          {children}
        </Container>
      </Box>
    </>
  );
};

export default Layout;
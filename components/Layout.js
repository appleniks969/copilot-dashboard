import React from 'react';
import { Box, Container, useColorModeValue } from '@chakra-ui/react';
import Head from 'next/head';

const Layout = ({ children, title = 'GitHub Copilot Usage Dashboard' }) => {
  const bgGradient = useColorModeValue(
    'linear(to-b, white, gray.50)',
    'linear(to-b, gray.900, gray.800)'
  );

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
import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import Head from 'next/head';

const Layout = ({ children, title = 'GitHub Copilot Usage Dashboard' }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="GitHub Copilot Usage Dashboard for tracking and analyzing Copilot usage metrics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Box minH="100vh" bg="gray.50">
        <Container maxW="container.xl" pt={4} pb={8}>
          {children}
        </Container>
      </Box>
    </>
  );
};

export default Layout;
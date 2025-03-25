import React from 'react';
import { Box, Container, useColorModeValue } from '@chakra-ui/react';
import Layout from '../components/Layout';
import DashboardRedesign from '../components/DashboardRedesign';
import { CopilotProvider } from '../lib/CopilotContext';

/**
 * Redesign Page - Showcases the redesigned dashboard
 * 
 * This page integrates the new dashboard UI components into a route
 * with the existing layout and context providers.
 */
const RedesignPage = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <CopilotProvider>
      <Layout title="Copilot Impact Center">
        <Box 
          bg={bgColor}
          minH="calc(100vh - 80px)"
          py={6}
        >
          <Container maxW="container.xl">
            <DashboardRedesign />
          </Container>
        </Box>
      </Layout>
    </CopilotProvider>
  );
};

export default RedesignPage;
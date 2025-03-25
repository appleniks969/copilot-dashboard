import React, { useState } from 'react';
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Heading, Text, Flex, Button, 
  Code, Spinner, useColorModeValue, Badge, Container, Icon } from '@chakra-ui/react';
import FilterBar from './FilterBar';
import UserEngagementReport from './reports/UserEngagementReport';
import ProductivityReport from './reports/ProductivityReport';
import ROIReport from './reports/ROIReport';
import LanguageEditorReport from './reports/LanguageEditorReport';
import TeamComparisonReport from './reports/TeamComparisonReport';
import { useCopilot } from '../lib/CopilotContext';

// Raw Data component to display the raw API data
const RawDataReport = () => {
  const { rawData, orgData, metrics, team, dateRange } = useCopilot();
  
  if (!rawData) {
    return (
      <Box p={4}>
        <Text>No raw data available.</Text>
      </Box>
    );
  }
  
  // Extract useful metadata to display along with raw data
  const metaInfo = {
    dataSource: metrics?.dataSource || 'unknown',
    teamSlug: team || 'organization level',
    dateRange: dateRange,
    processed: {
      activeUsers: metrics?.totalActiveUsers || 0,
      totalSuggestions: metrics?.totalSuggestions || 0,
      acceptedSuggestions: metrics?.acceptedSuggestions || 0,
      languages: metrics?.languages?.length || 0,
      editors: metrics?.editors?.length || 0
    },
    dataPoints: orgData?.dataPoints || (Array.isArray(rawData) ? rawData.length : 1),
    processedDays: orgData?.processedDays || 0
  };
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Raw API Data</Heading>
      <Text mb={6}>This view shows the raw data returned from the GitHub Copilot API for debugging and verification purposes.</Text>
      
      {/* Data validation summary */}
      <Box 
        p={4} 
        mb={4}
        bg={useColorModeValue('blue.50', 'blue.900')} 
        borderRadius="md"
        borderWidth="1px"
        borderColor={useColorModeValue('blue.200', 'blue.600')}
      >
        <Heading size="md" mb={3}>Data Validation Summary</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Box>
            <Text fontWeight="bold">Data Source:</Text>
            <Text>{metaInfo.dataSource}</Text>

            <Text fontWeight="bold" mt={2}>Team:</Text>
            <Text>{metaInfo.teamSlug}</Text>

            <Text fontWeight="bold" mt={2}>Date Range:</Text>
            <Text>Last {metaInfo.dateRange}</Text>
          </Box>
          
          <Box>
            <Text fontWeight="bold">Processed Data Points:</Text>
            <Text>{metaInfo.dataPoints} (days processed: {metaInfo.processedDays})</Text>
            
            <Text fontWeight="bold" mt={2}>Processed Metrics:</Text>
            <Text>Users: {metaInfo.processed.activeUsers}, Suggestions: {metaInfo.processed.totalSuggestions}, Accepted: {metaInfo.processed.acceptedSuggestions}</Text>
            
            <Text fontWeight="bold" mt={2}>Data Categories:</Text>
            <Text>Languages: {metaInfo.processed.languages}, Editors: {metaInfo.processed.editors}</Text>
          </Box>
        </SimpleGrid>
      </Box>
      
      {/* Raw JSON data */}
      <Box 
        p={4} 
        bg={useColorModeValue('gray.50', 'gray.800')} 
        overflowX="auto" 
        borderRadius="md"
        borderWidth="1px"
        borderColor={useColorModeValue('gray.200', 'gray.600')}
        fontFamily="monospace"
        fontSize="sm"
        whiteSpace="pre-wrap"
      >
        <Code width="100%" p={4} display="block" overflowX="auto">
          {JSON.stringify(rawData, null, 2)}
        </Code>
      </Box>
    </Box>
  );
};

const Dashboard = () => {
  const { isLoading, error, organization, team, dateRange, authToken, updateAuthToken } = useCopilot();
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('github_token');
    updateAuthToken('');
  };

  if (!authToken) {
    return null; // AuthForm will be shown in parent component
  }

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const headerBg = useColorModeValue('blue.50', 'blue.900');

  return (
    <Container maxW="container.xl" p={0}>
      <Box 
        bg={headerBg} 
        p={6} 
        borderBottomWidth="1px" 
        borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
        borderRadius="md"
        mb={6}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            <Heading>GitHub Copilot Dashboard</Heading>
            <Flex mt={2} alignItems="center" flexWrap="wrap">
              {team && (
                <Badge colorScheme="blue" fontSize="md" mr={2} p={1}>
                  Team: {team}
                </Badge>
              )}
              <Badge colorScheme="green" fontSize="md" mr={2} p={1}>
                Org: {organization}
              </Badge>
              <Badge colorScheme="purple" fontSize="md" p={1}>
                Last {dateRange}
              </Badge>
            </Flex>
          </Box>
          <Button 
            colorScheme="red" 
            variant="solid" 
            onClick={handleLogout}
            _hover={{ bg: 'red.600' }}
          >
            Logout
          </Button>
        </Flex>
      </Box>
      
      <FilterBar />

      {isLoading && (
        <Box p={8} textAlign="center">
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text mt={4} fontSize="lg">Loading Copilot data...</Text>
        </Box>
      )}

      {error && (
        <Box p={6} bg="red.50" color="red.600" borderRadius="md" mb={6} borderWidth="1px" borderColor="red.300">
          <Heading size="md" mb={2}>Error Loading Data</Heading>
          <Text>{error}</Text>
        </Box>
      )}

      {!isLoading && !error && (
        <Box 
          bg={bgColor} 
          color={textColor} 
          borderRadius="lg" 
          boxShadow="md" 
          overflow="hidden"
        >
          <Tabs colorScheme="blue" isLazy variant="enclosed">
            <TabList 
              borderBottomWidth="1px" 
              borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
              bg={useColorModeValue('gray.50', 'gray.900')}
              overflowX="auto" 
              p={2}
            >
              <Tab _selected={{ color: 'blue.500', borderColor: 'blue.500', borderBottomColor: 'white' }}>User Engagement</Tab>
              <Tab _selected={{ color: 'blue.500', borderColor: 'blue.500', borderBottomColor: 'white' }}>Productivity</Tab>
              <Tab _selected={{ color: 'blue.500', borderColor: 'blue.500', borderBottomColor: 'white' }}>ROI Calculation</Tab>
              <Tab _selected={{ color: 'blue.500', borderColor: 'blue.500', borderBottomColor: 'white' }}>Language & Editor</Tab>
              <Tab _selected={{ color: 'blue.500', borderColor: 'blue.500', borderBottomColor: 'white' }}>Team Comparison</Tab>
              <Tab _selected={{ color: 'blue.500', borderColor: 'blue.500', borderBottomColor: 'white' }}>Raw Data</Tab>
            </TabList>

            <TabPanels p={6}>
              <TabPanel>
                <UserEngagementReport />
              </TabPanel>
              <TabPanel>
                <ProductivityReport />
              </TabPanel>
              <TabPanel>
                <ROIReport />
              </TabPanel>
              <TabPanel>
                <LanguageEditorReport />
              </TabPanel>
              <TabPanel>
                <TeamComparisonReport />
              </TabPanel>
              <TabPanel>
                <RawDataReport />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
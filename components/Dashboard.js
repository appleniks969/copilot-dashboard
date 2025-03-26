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
  const { rawData, teamData, metrics, team, dateRange } = useCopilot();
  
  if (!rawData || !team) {
    return (
      <Box p={4}>
        <Text>No raw data available. Please select a team to view data.</Text>
      </Box>
    );
  }
  
  // Extract useful metadata to display along with raw data
  const metaInfo = {
    dataSource: 'team',
    teamSlug: team,
    dateRange: dateRange,
    processed: {
      activeUsers: metrics?.totalActiveUsers || 0,
      totalSuggestions: metrics?.totalSuggestions || 0,
      acceptedSuggestions: metrics?.acceptedSuggestions || 0,
      languages: metrics?.languages?.length || 0,
      editors: metrics?.editors?.length || 0
    },
    dataPoints: Array.isArray(rawData) ? rawData.length : 1,
    processedDays: teamData?.processedDays || 0
  };
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Team Raw API Data</Heading>
      <Text mb={6}>This view shows the raw data returned from the GitHub Copilot API for team: <strong>{team}</strong>.</Text>
      
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
            <Text fontWeight="bold">Team:</Text>
            <Text>{metaInfo.teamSlug}</Text>

            <Text fontWeight="bold" mt={2}>Date Range:</Text>
            <Text>All Available Data (28 Days)</Text>
            
            <Text fontWeight="bold" mt={2}>Data Source:</Text>
            <Text>GitHub Copilot Team Analytics API</Text>
          </Box>
          
          <Box>
            <Text fontWeight="bold">Processed Data Points:</Text>
            <Text>{metaInfo.dataPoints} days of data</Text>
            
            <Text fontWeight="bold" mt={2}>User Metrics:</Text>
            <Text>Active Users: {metaInfo.processed.activeUsers}, Engaged Users: {metrics?.totalEngagedUsers || 0}</Text>
            
            <Text fontWeight="bold" mt={2}>Suggestion Metrics:</Text>
            <Text>Suggestions: {metaInfo.processed.totalSuggestions}, Accepted: {metaInfo.processed.acceptedSuggestions}</Text>
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
  
  if (!team) {
    return (
      <Box p={8} borderRadius="xl" bg="white" boxShadow="lg" textAlign="center">
        <Heading size="lg" mb={4}>Please Select a Team</Heading>
        <Text mb={6}>A team must be selected to view Copilot usage data.</Text>
        <FilterBar />
      </Box>
    );
  }

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const headerBg = useColorModeValue('blue.50', 'blue.900');

  return (
    <Container maxW="container.xl" p={0}>
      <Box 
        bg={useColorModeValue('white', 'gray.800')} 
        p={6} 
        borderWidth="1px" 
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        borderRadius="xl"
        mb={8}
        boxShadow="lg"
        position="relative"
        overflow="hidden"
      >
        <Box 
          position="absolute" 
          top="0" 
          left="0" 
          right="0" 
          height="5px" 
          bgGradient="linear(to-r, brand.400, brand.600)" 
        />
        
        <Flex 
          justifyContent="space-between" 
          alignItems={{ base: "flex-start", md: "center" }}
          flexDirection={{ base: "column", md: "row" }}
          gap={{ base: 4, md: 0 }}
        >
          <Box>
            <Heading 
              bgGradient="linear(to-r, brand.500, blue.600)" 
              bgClip="text"
              fontWeight="bold"
              letterSpacing="tight"
            >
              GitHub Copilot Dashboard
            </Heading>
            <Flex mt={3} alignItems="center" flexWrap="wrap" gap={2}>
              {team && (
                <Badge 
                  colorScheme="brand" 
                  fontSize="sm" 
                  px={3} 
                  py={1} 
                  borderRadius="full"
                  boxShadow="sm"
                  fontWeight="medium"
                >
                  Team: {team}
                </Badge>
              )}
              <Badge 
                colorScheme="green" 
                fontSize="sm" 
                px={3} 
                py={1} 
                borderRadius="full"
                boxShadow="sm"
                fontWeight="medium"
              >
                Org: {organization}
              </Badge>
              <Badge 
                colorScheme="purple" 
                fontSize="sm" 
                px={3} 
                py={1} 
                borderRadius="full"
                boxShadow="sm"
                fontWeight="medium"
              >
                All Available Data (28 Days)
              </Badge>
            </Flex>
          </Box>
          <Button 
            colorScheme="red" 
            variant="outline" 
            onClick={handleLogout}
            size="md"
            _hover={{ bg: 'red.50', borderColor: 'red.500' }}
            borderRadius="full"
            px={6}
            fontWeight="medium"
          >
            Logout
          </Button>
        </Flex>
      </Box>
      
      <FilterBar />

      {isLoading && (
        <Box 
          p={10} 
          textAlign="center" 
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="xl"
          boxShadow="md"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.100', 'gray.700')}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={5}
        >
          <Spinner 
            size="xl" 
            thickness="4px"
            speed="0.65s"
            emptyColor={useColorModeValue('gray.200', 'gray.700')}
            color="brand.500"
          />
          <Text 
            fontSize="lg" 
            fontWeight="medium"
            color={useColorModeValue('gray.600', 'gray.300')}
          >
            Loading Copilot data...
          </Text>
        </Box>
      )}

      {error && (
        <Box 
          p={8} 
          bg={useColorModeValue('red.50', 'rgba(254, 178, 178, 0.1)')} 
          color={useColorModeValue('red.600', 'red.300')} 
          borderRadius="lg" 
          mb={6} 
          borderWidth="1px" 
          borderColor={useColorModeValue('red.200', 'red.700')}
          boxShadow="md"
        >
          <Heading size="md" mb={3}>Error Loading Data</Heading>
          <Text fontSize="md">{error}</Text>
        </Box>
      )}

      {!isLoading && !error && (
        <Box 
          bg={useColorModeValue('white', 'gray.800')}
          color={textColor} 
          borderRadius="xl" 
          boxShadow="lg" 
          overflow="hidden"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <Tabs 
            colorScheme="brand" 
            isLazy 
            variant="enclosed"
            size="md"
          >
            <TabList 
              borderBottomWidth="1px" 
              borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
              bg={useColorModeValue('gray.50', 'gray.900')}
              overflowX="auto" 
              px={4}
              py={2}
              gap={2}
            >
              <Tab 
                borderRadius="md" 
                fontWeight="medium"
                _selected={{ 
                  color: 'brand.600', 
                  bg: 'white', 
                  borderColor: 'gray.200', 
                  borderBottomColor: 'white',
                  fontWeight: 'semibold',
                }}
              >
                User Engagement
              </Tab>
              <Tab 
                borderRadius="md" 
                fontWeight="medium"
                _selected={{ 
                  color: 'brand.600', 
                  bg: 'white', 
                  borderColor: 'gray.200', 
                  borderBottomColor: 'white',
                  fontWeight: 'semibold',
                }}
              >
                Productivity
              </Tab>
              <Tab 
                borderRadius="md" 
                fontWeight="medium"
                _selected={{ 
                  color: 'brand.600', 
                  bg: 'white', 
                  borderColor: 'gray.200', 
                  borderBottomColor: 'white',
                  fontWeight: 'semibold',
                }}
              >
                ROI Calculation
              </Tab>
              <Tab 
                borderRadius="md" 
                fontWeight="medium"
                _selected={{ 
                  color: 'brand.600', 
                  bg: 'white', 
                  borderColor: 'gray.200', 
                  borderBottomColor: 'white',
                  fontWeight: 'semibold',
                }}
              >
                Language & Editor
              </Tab>
              <Tab 
                borderRadius="md" 
                fontWeight="medium"
                _selected={{ 
                  color: 'brand.600', 
                  bg: 'white', 
                  borderColor: 'gray.200', 
                  borderBottomColor: 'white',
                  fontWeight: 'semibold',
                }}
              >
                Team Comparison
              </Tab>
              <Tab 
                borderRadius="md" 
                fontWeight="medium"
                _selected={{ 
                  color: 'brand.600', 
                  bg: 'white', 
                  borderColor: 'gray.200', 
                  borderBottomColor: 'white',
                  fontWeight: 'semibold',
                }}
              >
                Raw Data
              </Tab>
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
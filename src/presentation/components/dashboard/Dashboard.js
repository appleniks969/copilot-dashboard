/**
 * Dashboard.js
 * Main dashboard component that coordinates the display of reports
 */

import React from 'react';
import { 
  Box, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  Heading, 
  Text, 
  Flex, 
  Button, 
  Spinner, 
  useColorModeValue, 
  Badge, 
  Container 
} from '@chakra-ui/react';
import FilterBar from './FilterBar';
import UserEngagementReport from './reports/UserEngagementReport';
import ProductivityReport from './reports/ProductivityReport';
import ROIReport from './reports/ROIReport';
import LanguageEditorReport from './reports/LanguageEditorReport';
import TeamComparisonReport from './reports/TeamComparisonReport';
import RawDataReport from './reports/RawDataReport';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';

const Dashboard = () => {
  const { authToken, logout } = useAuth();
  const { organization, team } = useConfig();
  const { isLoading, error } = useAnalytics();
  
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
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="container.xl" p={0}>
      <Box 
        bg={bgColor} 
        p={6} 
        borderWidth="1px" 
        borderColor={borderColor}
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
          bgGradient="linear(to-r, blue.400, blue.600)" 
        />
        
        <Flex 
          justifyContent="space-between" 
          alignItems={{ base: "flex-start", md: "center" }}
          flexDirection={{ base: "column", md: "row" }}
          gap={{ base: 4, md: 0 }}
        >
          <Box>
            <Heading 
              bgGradient="linear(to-r, blue.500, blue.600)" 
              bgClip="text"
              fontWeight="bold"
              letterSpacing="tight"
            >
              GitHub Copilot Dashboard
            </Heading>
            <Flex mt={3} alignItems="center" flexWrap="wrap" gap={2}>
              {team && (
                <Badge 
                  colorScheme="blue" 
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
            </Flex>
          </Box>
          <Button 
            colorScheme="red" 
            variant="outline" 
            onClick={logout}
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
          bg={bgColor}
          borderRadius="xl"
          boxShadow="md"
          borderWidth="1px"
          borderColor={borderColor}
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
            color="blue.500"
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
          bg={bgColor}
          color={textColor} 
          borderRadius="xl" 
          boxShadow="lg" 
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Tabs 
            colorScheme="blue" 
            isLazy 
            variant="enclosed"
            size="md"
          >
            <TabList 
              borderBottomWidth="1px" 
              borderBottomColor={borderColor}
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
                  color: 'blue.600', 
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
                  color: 'blue.600', 
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
                  color: 'blue.600', 
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
                  color: 'blue.600', 
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
                  color: 'blue.600', 
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
                  color: 'blue.600', 
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
import React, { useState } from 'react';
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Heading, Text, Flex, Button, Icon } from '@chakra-ui/react';
import FilterBar from './FilterBar';
import UserEngagementReport from './reports/UserEngagementReport';
import ProductivityReport from './reports/ProductivityReport';
import ROIReport from './reports/ROIReport';
import LanguageEditorReport from './reports/LanguageEditorReport';
import TeamComparisonReport from './reports/TeamComparisonReport';
import { useCopilot } from '../lib/CopilotContext';

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

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading>GitHub Copilot Dashboard</Heading>
          <Text color="gray.600">
            {team ? (
              <>Team: <strong>{team}</strong> | Organization: {organization} | Timeframe: Last {dateRange} days</>
            ) : (
              <>Organization: <strong>{organization}</strong> | Timeframe: Last {dateRange} days</>
            )}
          </Text>
        </Box>
        <Button colorScheme="red" variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </Flex>
      
      <FilterBar />

      {isLoading && (
        <Box p={4} textAlign="center">
          <Text>Loading data...</Text>
        </Box>
      )}

      {error && (
        <Box p={4} bg="red.50" color="red.500" borderRadius="md" mb={6}>
          <Text>{error}</Text>
        </Box>
      )}

      {!isLoading && !error && (
        <Tabs colorScheme="blue" isLazy>
          <TabList overflowX="auto" flexWrap="nowrap">
            <Tab>User Engagement</Tab>
            <Tab>Productivity</Tab>
            <Tab>ROI Calculation</Tab>
            <Tab>Language & Editor Usage</Tab>
            <Tab>Team Comparison</Tab>
          </TabList>

          <TabPanels>
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
          </TabPanels>
        </Tabs>
      )}
    </Box>
  );
};

export default Dashboard;
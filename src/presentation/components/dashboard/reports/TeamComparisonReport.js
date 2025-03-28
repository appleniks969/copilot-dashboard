/**
 * TeamComparisonReport.js
 * Component to compare metrics across different teams
 */

import React from 'react';
import { 
  Box, 
  Heading, 
  Text,
  Spinner,
  Flex
} from '@chakra-ui/react';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { useConfig } from '../../../contexts/ConfigContext';

const TeamComparisonReport = () => {
  const reportId = 'teamComparison';
  
  // Get analytics data from context
  const { isLoading, teamComparisonMetrics } = useAnalytics();
  
  // Get report configuration from context
  const { reportConfigs } = useConfig();
  
  // Get report configuration
  const reportConfig = reportConfigs[reportId] || { dateRange: '28 days', teams: [] };
  
  // Display loading state
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="400px" direction="column" gap={4}>
        <Spinner size="xl" thickness="4px" color="blue.500" />
        <Text>Loading team comparison data...</Text>
      </Flex>
    );
  }
  
  // Display empty state
  if (!teamComparisonMetrics || teamComparisonMetrics.length === 0) {
    return (
      <Box p={4}>
        <Text>No team comparison data available. Please configure multiple teams to compare.</Text>
      </Box>
    );
  }
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Team Comparison Report</Heading>
      <Text mb={6}>
        This report allows you to compare Copilot usage metrics across different teams.
      </Text>
      
      {/* Placeholder for actual implementation */}
      <Box p={6} borderWidth="1px" borderRadius="md">
        <Text>Team comparison report implementation would go here.</Text>
        <Text mt={4}>The report would show comparative metrics like:</Text>
        <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
          <li>Active users by team</li>
          <li>Acceptance rates comparison</li>
          <li>Productivity metrics comparison</li>
          <li>ROI comparison</li>
        </ul>
        <Text mt={4}>Teams being compared: {teamComparisonMetrics.map(team => team.teamSlug).join(', ')}</Text>
      </Box>
    </Box>
  );
};

export default TeamComparisonReport;
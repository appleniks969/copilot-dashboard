/**
 * RawDataReport.js
 * Component to display raw API data
 */

import React from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Code,
  useColorModeValue,
  SimpleGrid
} from '@chakra-ui/react';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { formatNumber } from '../../../../utils/formatUtils';

const RawDataReport = () => {
  const { rawData, getMetricsForReport } = useAnalytics();
  const { team } = useConfig();
  
  const metrics = getMetricsForReport('rawData');
  
  if (!rawData || !team) {
    return (
      <Box p={4}>
        <Text>No raw data available. Please select a team to view data.</Text>
      </Box>
    );
  }
  
  // Extract useful metadata to display along with raw data
  const metaInfo = {
    dataSource: metrics?.dataSource || 'team',
    teamSlug: team,
    processed: {
      activeUsers: metrics?.avgDailyActiveUsers || 0,
      totalSuggestions: metrics?.totalSuggestions || 0,
      acceptedSuggestions: metrics?.acceptedSuggestions || 0,
      languages: metrics?.languages?.length || 0,
      editors: metrics?.editors?.length || 0
    },
    dataPoints: Array.isArray(rawData) ? rawData.length : 1,
    processedDays: metrics?.processedDays || 0
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

            <Text fontWeight="bold" mt={2}>Data Source:</Text>
            <Text>GitHub Copilot Team Analytics API</Text>
          </Box>
          
          <Box>
            <Text fontWeight="bold">Processed Data Points:</Text>
            <Text>{metaInfo.dataPoints} days of data</Text>
            
            <Text fontWeight="bold" mt={2}>User Metrics:</Text>
            <Text>Active Users: {formatNumber(metaInfo.processed.activeUsers)}</Text>
            
            <Text fontWeight="bold" mt={2}>Suggestion Metrics:</Text>
            <Text>
              Suggestions: {formatNumber(metaInfo.processed.totalSuggestions)}, 
              Accepted: {formatNumber(metaInfo.processed.acceptedSuggestions)}
            </Text>
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

export default RawDataReport;
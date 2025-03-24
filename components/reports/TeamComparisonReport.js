import React from 'react';
import { 
  Box, 
  Text,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
  Link,
} from '@chakra-ui/react';
import { useCopilot } from '../../lib/CopilotContext';

const TeamComparisonReport = () => {
  const { team, metrics } = useCopilot();
  
  // This report doesn't apply when we're only showing a single team
  return (
    <Box>
      <Heading size="lg" mb={6}>Team Comparison Report</Heading>
      
      <Alert status="info" borderRadius="md" mb={6}>
        <AlertIcon />
        <Box>
          <AlertTitle mb={2}>Currently viewing a single team</AlertTitle>
          <AlertDescription>
            You are currently viewing data for team: <strong>{team}</strong>. To compare multiple teams, 
            you would need access to the GitHub organization-level Copilot metrics API.
          </AlertDescription>
        </Box>
      </Alert>
      
      <VStack align="start" spacing={4} p={5} bg="white" borderRadius="md" shadow="sm">
        <Text>
          The team comparison report is designed to compare Copilot usage across different teams in your organization.
          Since we are currently only viewing data for a single team, this report is not applicable.
        </Text>
        
        <Text>
          To see team comparison data, you would need access to:
        </Text>
        
        <Box pl={4}>
          <Text>• GitHub organization-level Copilot metrics API</Text>
          <Text>• Permission to view metrics for multiple teams</Text>
        </Box>
        
        <Button
          colorScheme="blue"
          size="sm"
          as={Link}
          href="https://docs.github.com/en/copilot/github-copilot-for-business/overview/about-github-copilot-analytics#about-the-github-copilot-analytics-dashboard"
          isExternal
        >
          Learn More About Copilot Analytics
        </Button>
      </VStack>
    </Box>
  );
};

export default TeamComparisonReport;
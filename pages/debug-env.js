import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Code, VStack, Divider } from '@chakra-ui/react';

// Import Next.js config
import getConfig from 'next/config';

const EnvDebugPage = () => {
  const [envVars, setEnvVars] = useState({
    processEnv: {},
    runtimeConfig: {},
    parsedTeams: []
  });

  useEffect(() => {
    // Get environment variables from various sources
    const { publicRuntimeConfig } = getConfig() || { publicRuntimeConfig: {} };
    
    // Get teams list
    const teamsString = process.env.NEXT_PUBLIC_TEAMS || publicRuntimeConfig.NEXT_PUBLIC_TEAMS || '';
    const parsedTeams = teamsString ? teamsString.split(',').map(team => team.trim()) : [];

    setEnvVars({
      processEnv: {
        NEXT_PUBLIC_TEAMS: process.env.NEXT_PUBLIC_TEAMS || 'undefined',
        NEXT_PUBLIC_ORGANIZATION: process.env.NEXT_PUBLIC_ORGANIZATION || 'undefined',
        NODE_ENV: process.env.NODE_ENV || 'undefined'
      },
      runtimeConfig: {
        NEXT_PUBLIC_TEAMS: publicRuntimeConfig.NEXT_PUBLIC_TEAMS || 'undefined',
        NEXT_PUBLIC_ORGANIZATION: publicRuntimeConfig.NEXT_PUBLIC_ORGANIZATION || 'undefined'
      },
      parsedTeams
    });
  }, []);

  return (
    <Box p={8}>
      <Heading as="h1" mb={6}>Environment Variables Debug</Heading>
      
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h2" size="md" mb={2}>process.env Values</Heading>
          <Code p={4} borderRadius="md" whiteSpace="pre" display="block">
            {JSON.stringify(envVars.processEnv, null, 2)}
          </Code>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading as="h2" size="md" mb={2}>Next.js Runtime Config</Heading>
          <Code p={4} borderRadius="md" whiteSpace="pre" display="block">
            {JSON.stringify(envVars.runtimeConfig, null, 2)}
          </Code>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading as="h2" size="md" mb={2}>Parsed Teams List</Heading>
          {envVars.parsedTeams.length > 0 ? (
            <Code p={4} borderRadius="md" whiteSpace="pre" display="block">
              {JSON.stringify(envVars.parsedTeams, null, 2)}
            </Code>
          ) : (
            <Text>No teams found</Text>
          )}
        </Box>

        <Divider />
        
        <Box>
          <Heading as="h2" size="md" mb={2}>.env.local File Content</Heading>
          <Text>Your .env.local file should contain:</Text>
          <Code p={4} borderRadius="md" whiteSpace="pre" display="block">
            NEXT_PUBLIC_TEAMS=mobile,backend,frontend
            NEXT_PUBLIC_ORGANIZATION=my-github-org
          </Code>
        </Box>
      </VStack>
    </Box>
  );
};

export default EnvDebugPage;

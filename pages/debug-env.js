import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Code, VStack, Divider, Alert, AlertIcon } from '@chakra-ui/react';
import path from 'path';

const EnvDebugPage = () => {
  const [envVars, setEnvVars] = useState({
    processEnv: {},
    envFileLocation: '',
    parsedTeams: []
  });

  useEffect(() => {
    // Extract all NEXT_PUBLIC_ environment variables
    const publicEnvVars = Object.keys(process.env)
      .filter(key => key.startsWith('NEXT_PUBLIC_'))
      .reduce((obj, key) => {
        obj[key] = process.env[key];
        return obj;
      }, {});
    
    // Get teams list
    const teamsString = process.env.NEXT_PUBLIC_TEAMS || '';
    const parsedTeams = teamsString ? teamsString.split(',').map(team => team.trim()) : [];

    // Get current working directory
    const cwd = process.cwd();

    setEnvVars({
      processEnv: {
        ...publicEnvVars,
        NODE_ENV: process.env.NODE_ENV || 'undefined'
      },
      envFileLocation: path.join(cwd, '.env.local'),
      parsedTeams
    });
  }, []);

  return (
    <Box p={8}>
      <Heading as="h1" mb={6}>Environment Variables Debug</Heading>
      
      {(!envVars.processEnv.NEXT_PUBLIC_ORGANIZATION || envVars.processEnv.NEXT_PUBLIC_ORGANIZATION === 'undefined') && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          NEXT_PUBLIC_ORGANIZATION is not set or not loaded properly!
        </Alert>
      )}

      {(!envVars.processEnv.NEXT_PUBLIC_TEAMS || envVars.processEnv.NEXT_PUBLIC_TEAMS === 'undefined') && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          NEXT_PUBLIC_TEAMS is not set or not loaded properly!
        </Alert>
      )}
      
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h2" size="md" mb={2}>Available Environment Variables</Heading>
          <Code p={4} borderRadius="md" whiteSpace="pre" display="block">
            {JSON.stringify(envVars.processEnv, null, 2)}
          </Code>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading as="h2" size="md" mb={2}>Environment File Location</Heading>
          <Text>Your .env.local file should be located at:</Text>
          <Code p={4} borderRadius="md" whiteSpace="pre" display="block">
            {envVars.envFileLocation}
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
          <Heading as="h2" size="md" mb={2}>Troubleshooting Steps</Heading>
          <VStack align="start" spacing={2}>
            <Text>1. Make sure your .env.local file exists at the root of the project</Text>
            <Text>2. Ensure the file has the correct format (no quotes around values)</Text>
            <Text>3. Restart your Next.js server after making changes</Text>
            <Text>4. Check that the file doesn't have any hidden characters or encoding issues</Text>
            <Text>5. Verify Next.js version supports .env.local (10.0+ does)</Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default EnvDebugPage;

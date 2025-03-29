/**
 * EnvDebugInfo.js - Simplified debugging component
 * Only appears in development mode
 */

import React from 'react';
import { Box, Text, Badge, HStack } from '@chakra-ui/react';
import { useConfig } from '../../contexts/ConfigContext';

const EnvDebugInfo = () => {
  // Only render in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const { organization, teamsList, team } = useConfig();
  
  return (
    <Box fontSize="xs" color="gray.500" p={2} mt={2} bg="gray.50" borderRadius="md">
      <Text fontWeight="medium">Environment Variables:</Text>
      <HStack spacing={2} mt={1} wrap="wrap">
        <Badge colorScheme="blue">Organization: {organization || 'Not set'}</Badge>
        <Badge colorScheme="green">Teams: {teamsList?.join(', ') || 'None'}</Badge>
      </HStack>
      <Text mt={1} fontSize="xs">Current Selection: {team || 'No team selected'}</Text>
    </Box>
  );
};

export default EnvDebugInfo;

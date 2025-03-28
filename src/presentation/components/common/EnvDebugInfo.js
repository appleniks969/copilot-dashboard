/**
 * EnvDebugInfo.js
 * A small component to display current environment variables for debugging
 */

import React from 'react';
import { Box, Text, Badge, HStack } from '@chakra-ui/react';
import { useConfig } from '../../contexts/ConfigContext';
// Removed unused imports: logEnvState, getEnvVar, Code, useEffect, useState

const EnvDebugInfo = () => {
  const { organization, teamsList } = useConfig();

  // This component now only shows the values as loaded by the ConfigContext
  return (
    <Box fontSize="xs" color="gray.500" p={2} mt={2} bg="gray.50" borderRadius="md">
      <Text fontWeight="medium">Environment Debug Info (from ConfigContext):</Text>
      <HStack spacing={2} mt={1} wrap="wrap">
        <Badge colorScheme="blue">Organization: {organization || 'Not set'}</Badge>
        <Badge colorScheme="green">Teams: {teamsList && teamsList.length ? teamsList.join(', ') : 'None'}</Badge>
      </HStack>
      {/* Removed the section attempting to read raw process.env */}
    </Box>
  );
};

export default EnvDebugInfo;

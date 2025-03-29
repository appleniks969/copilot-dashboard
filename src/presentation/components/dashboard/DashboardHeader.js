/**
 * DashboardHeader.js
 * A simple header that displays environment information without filtering
 */

import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';

// Direct access to environment variables for simplicity
const ORGANIZATION = process.env.NEXT_PUBLIC_ORGANIZATION || 'Default Organization';
const TEAMS = process.env.NEXT_PUBLIC_TEAMS 
  ? process.env.NEXT_PUBLIC_TEAMS.split(',').map(team => team.trim())
  : [];

const DashboardHeader = () => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box 
      p={4} 
      mb={6} 
      borderWidth="1px" 
      borderRadius="lg" 
      borderColor={borderColor}
      bg={bgColor}
      boxShadow="sm"
    >
      <Flex direction="column" align="flex-start">
        <Heading size="md" mb={2}>GitHub Copilot Dashboard</Heading>
        
        <HStack spacing={4} mt={2}>
          <Box>
            <Text fontSize="sm" fontWeight="medium">Organization:</Text>
            <Badge colorScheme="blue" fontSize="md">{ORGANIZATION}</Badge>
          </Box>
          
          <Box>
            <Text fontSize="sm" fontWeight="medium">Available Teams:</Text>
            <HStack spacing={2}>
              {TEAMS.map(team => (
                <Badge key={team} colorScheme="green" fontSize="md">{team}</Badge>
              ))}
            </HStack>
          </Box>
          
          {/* Add a timestamp to confirm this is using current environment variables */}
          <Box ml="auto">
            <Text fontSize="xs" color="gray.500">
              Environment loaded at: {new Date().toLocaleTimeString()}
            </Text>
          </Box>
        </HStack>
        
        {/* Debug information */}
        <Box fontSize="xs" color="gray.500" mt={4} p={2} bg="gray.50" borderRadius="md" alignSelf="stretch">
          <Text fontWeight="medium">Environment Debug:</Text>
          <Text>NEXT_PUBLIC_ORGANIZATION: {process.env.NEXT_PUBLIC_ORGANIZATION || 'Not set'}</Text>
          <Text>NEXT_PUBLIC_TEAMS: {process.env.NEXT_PUBLIC_TEAMS || 'Not set'}</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default DashboardHeader;

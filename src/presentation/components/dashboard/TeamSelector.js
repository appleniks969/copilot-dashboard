/**
 * TeamSelector.js
 * A simpler component that directly uses environment variables
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Button,
  useColorModeValue,
  Text,
  Stack,
  HStack,
  Heading,
  Badge,
} from '@chakra-ui/react';
import { DATE_RANGES } from '../../../config/constants';

// Direct access to environment variables
const organization = process.env.NEXT_PUBLIC_ORGANIZATION || '';
const teamsString = process.env.NEXT_PUBLIC_TEAMS || '';
const teams = teamsString ? teamsString.split(',').map(team => team.trim()) : [];

const TeamSelector = ({ onTeamChange, onDateRangeChange }) => {
  // State for selected values
  const [selectedTeam, setSelectedTeam] = useState(teams.length > 0 ? teams[0] : '');
  const [selectedDateRange, setSelectedDateRange] = useState(DATE_RANGES.LAST_28_DAYS);
  
  // Notify parent when selection changes
  useEffect(() => {
    if (onTeamChange && selectedTeam) {
      onTeamChange(selectedTeam);
    }
    
    if (onDateRangeChange && selectedDateRange) {
      onDateRangeChange(selectedDateRange);
    }
  }, [selectedTeam, selectedDateRange, onTeamChange, onDateRangeChange]);
  
  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value);
  };
  
  const handleDateRangeChange = (e) => {
    setSelectedDateRange(e.target.value);
  };
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box p={4} mb={6} borderWidth="1px" borderRadius="lg" bg={bgColor} borderColor={borderColor}>
      <Stack spacing={4}>
        {/* Header with organization info */}
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="md">{organization}</Heading>
          <Badge colorScheme="blue">Environment: {process.env.NODE_ENV}</Badge>
        </Flex>
        
        {/* Simple selectors */}
        <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
          <FormControl>
            <FormLabel>Team</FormLabel>
            <Select value={selectedTeam} onChange={handleTeamChange}>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>Time Range</FormLabel>
            <Select value={selectedDateRange} onChange={handleDateRangeChange}>
              <option value={DATE_RANGES.LAST_7_DAYS}>{DATE_RANGES.LAST_7_DAYS}</option>
              <option value={DATE_RANGES.LAST_14_DAYS}>{DATE_RANGES.LAST_14_DAYS}</option>
              <option value={DATE_RANGES.LAST_28_DAYS}>{DATE_RANGES.LAST_28_DAYS}</option>
            </Select>
          </FormControl>
        </Flex>
        
        {/* Debug section */}
        {process.env.NODE_ENV !== 'production' && (
          <Box mt={2} p={2} bg="gray.50" borderRadius="md">
            <Text fontSize="xs" color="gray.500" fontWeight="bold">Environment Variables:</Text>
            <HStack mt={1} spacing={2}>
              <Badge colorScheme="green">ORGANIZATION: {organization || 'NOT SET'}</Badge>
              <Badge colorScheme="blue">TEAMS: {teams.join(', ') || 'NONE'}</Badge>
              <Badge colorScheme="purple">SELECTED: {selectedTeam}</Badge>
            </HStack>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default TeamSelector;

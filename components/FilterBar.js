import React from 'react';
import { Flex, Select, Input, Button, FormControl, FormLabel, Stack, Text } from '@chakra-ui/react';
import { DATE_RANGES, TEAMS_LIST } from '../lib/config';
import { useCopilot } from '../lib/CopilotContext';

const FilterBar = () => {
  const {
    organization,
    setOrganization,
    team,
    setTeam,
    dateRange,
    setDateRange,
    multiTeamData,
  } = useCopilot();

  return (
    <Flex 
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      align="flex-end"
      wrap="wrap"
      gap={4}
      mb={6}
      p={4}
      bg="white"
      shadow="sm"
      borderRadius="md"
    >
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4} flex="1">
        <FormControl>
          <FormLabel>Organization</FormLabel>
          <Input 
            value={organization} 
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Enter GitHub organization"
            bg="white"
          />
        </FormControl>
        
        <FormControl>
          <FormLabel fontWeight="bold">Team</FormLabel>
          {TEAMS_LIST.length > 0 ? (
            <Select 
              value={team} 
              onChange={(e) => setTeam(e.target.value)}
              bg="white"
              borderColor="blue.300"
              _focus={{ borderColor: "blue.500" }}
            >
              {TEAMS_LIST.map((teamName, index) => (
                <option key={index} value={teamName}>{teamName}</option>
              ))}
            </Select>
          ) : (
            <Input 
              value={team} 
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Enter GitHub team slug"
              bg="white"
              borderColor="blue.300"
              _focus={{ borderColor: "blue.500" }}
            />
          )}
          <Text fontSize="xs" color="gray.600" mt={1}>
            Team data will be shown for the selected team.
          </Text>
        </FormControl>
        
        <FormControl>
          <FormLabel>Date Range</FormLabel>
          <Select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            bg="white"
          >
            <option value={DATE_RANGES.LAST_1_DAY}>Last 1 Day</option>
            <option value={DATE_RANGES.LAST_7_DAYS}>Last 7 Days</option>
            <option value={DATE_RANGES.LAST_14_DAYS}>Last 14 Days</option>
            <option value={DATE_RANGES.LAST_28_DAYS}>Last 28 Days</option>
          </Select>
        </FormControl>
      </Stack>
      
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4} alignItems="flex-end">
        <Button 
          colorScheme="blue" 
          onClick={() => {
            // This will trigger a data refresh through the context's useEffect
            // by slightly modifying the date range and setting it back
            const currentRange = dateRange;
            setDateRange('1 day'); // Set to a different value temporarily
            setTimeout(() => setDateRange(currentRange), 100); // Set back to original value
          }}
          bg="blue.500"
          _hover={{ bg: "blue.600" }}
          color="white"
        >
          Refresh Data
        </Button>
      </Stack>
    </Flex>
  );
};

export default FilterBar;
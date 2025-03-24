import React from 'react';
import { Flex, Select, Input, Button, FormControl, FormLabel, Stack } from '@chakra-ui/react';
import { DATE_RANGES } from '../lib/config';
import { useCopilot } from '../lib/CopilotContext';

const FilterBar = () => {
  const {
    organization,
    setOrganization,
    team,
    setTeam,
    dateRange,
    setDateRange,
    totalLicensedUsers,
    updateTotalLicensedUsers,
    teamBreakdownData,
  } = useCopilot();

  // Extract team names from breakdown data
  const teamOptions = React.useMemo(() => {
    if (!teamBreakdownData?.teams) return [];
    return teamBreakdownData.teams.map(team => team.team_slug);
  }, [teamBreakdownData]);

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
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Team</FormLabel>
          <Select 
            value={team} 
            onChange={(e) => setTeam(e.target.value)}
          >
            <option value="">All Teams</option>
            {teamOptions.map(teamName => (
              <option key={teamName} value={teamName}>{teamName}</option>
            ))}
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Date Range</FormLabel>
          <Select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value={DATE_RANGES.LAST_7_DAYS}>Last 7 Days</option>
            <option value={DATE_RANGES.LAST_14_DAYS}>Last 14 Days</option>
            <option value={DATE_RANGES.LAST_28_DAYS}>Last 28 Days</option>
          </Select>
        </FormControl>
      </Stack>
      
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
        <FormControl>
          <FormLabel>Total Licensed Users</FormLabel>
          <Input 
            type="number" 
            value={totalLicensedUsers}
            onChange={(e) => updateTotalLicensedUsers(parseInt(e.target.value) || 0)}
            placeholder="Enter total licensed users"
          />
        </FormControl>
        
        <Button 
          colorScheme="blue" 
          alignSelf="flex-end"
          onClick={() => window.location.reload()}
        >
          Refresh Data
        </Button>
      </Stack>
    </Flex>
  );
};

export default FilterBar;
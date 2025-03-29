/**
 * FilterBar.js
 * Component for filtering dashboard data by org, team, and date range
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  VStack,
  Text,
  Spacer,
  Divider,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useConfig } from '../../contexts/ConfigContext';
// Updated import path to use src/config/constants
import { DATE_RANGES } from '../../../config/constants';
import EnvDebugInfo from '../common/EnvDebugInfo';

const FilterBar = () => {
  const {
    organization,
    team,
    globalDateRange, 
    teamsList,
    updateOrganization, 
    updateTeam, 
    updateGlobalDateRange
  } = useConfig();
  // Removed DEBUG log

  // Initialize selected org with the organization from context or empty string
  const [selectedOrg, setSelectedOrg] = useState(organization || '');
  // Initialize selected team from context, or first team in list if available
  const [selectedTeam, setSelectedTeam] = useState(
    team || (teamsList && teamsList.length > 0 ? teamsList[0] : '')
  );
  
  // Update state when context values change
  useEffect(() => {
    // Update organization if changed in context
    if (organization && organization !== selectedOrg) {
      setSelectedOrg(organization);
    }
    
    // Update team if changed in context or if teams list is loaded and no team is selected
    if (team && team !== selectedTeam) {
      setSelectedTeam(team);
    } else if (!selectedTeam && teamsList && teamsList.length > 0) {
      // Auto-select first team if no team is selected
      setSelectedTeam(teamsList[0]);
      updateTeam(teamsList[0]); // Also update in context
    }
  }, [organization, team, teamsList, selectedOrg, selectedTeam, updateTeam]);
  
  const handleOrgChange = (e) => {
    setSelectedOrg(e.target.value);
  };
  
  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value);
  };
  
  const handleApplyFilters = () => {
    if (selectedOrg !== organization) {
      updateOrganization(selectedOrg);
    }
    
    if (selectedTeam !== team) {
      updateTeam(selectedTeam);
    }
  };
  
  const handleDateRangeChange = (range) => {
    updateGlobalDateRange(range);
  };
  
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
      <VStack spacing={4} align="stretch">
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          gap={4}
          align={{ base: 'stretch', md: 'flex-end' }}
        >
          <FormControl>
            <FormLabel fontSize="sm">Organization</FormLabel>
            <Select 
              value={selectedOrg} 
              onChange={handleOrgChange}
              placeholder="Select organization"
              size="md"
            >
              {organization ? (
                <option value={organization}>{organization}</option>
              ) : (
                <option value="">Select an organization...</option>
              )}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Team</FormLabel>
            <Select 
              value={selectedTeam} 
              onChange={handleTeamChange}
              placeholder="Select team"
              size="md"
            >
              {teamsList && teamsList.length > 0 ? (
                teamsList.map(teamOption => (
                  <option key={teamOption} value={teamOption}>
                    {teamOption}
                  </option>
                ))
              ) : (
                <option value="engineers">Engineering Team</option>
              )}
            </Select>
          </FormControl>
          
          <Box>
            <Menu closeOnSelect>
              <MenuButton 
                as={Button} 
                rightIcon={<ChevronDownIcon />}
                variant="outline"
                size="md"
              >
                <Text fontSize="sm" color="gray.500" as="span" mr={1}>
                  Time:
                </Text>
                {globalDateRange || DATE_RANGES.LAST_28_DAYS}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => handleDateRangeChange(DATE_RANGES.LAST_7_DAYS)}>
                  {DATE_RANGES.LAST_7_DAYS}
                </MenuItem>
                <MenuItem onClick={() => handleDateRangeChange(DATE_RANGES.LAST_14_DAYS)}>
                  {DATE_RANGES.LAST_14_DAYS}
                </MenuItem>
                <MenuItem onClick={() => handleDateRangeChange(DATE_RANGES.LAST_28_DAYS)}>
                  {DATE_RANGES.LAST_28_DAYS}
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
          
          <Spacer display={{ base: 'none', md: 'block' }} />
          
          <Button 
            colorScheme="blue" 
            onClick={handleApplyFilters}
            size="md"
          >
            Apply Filters
          </Button>
        </Flex>
        
        {/* Debug information */}
        <EnvDebugInfo />
      </VStack>
    </Box>
  );
};

export default FilterBar;

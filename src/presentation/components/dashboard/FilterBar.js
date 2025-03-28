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
  
  const [selectedOrg, setSelectedOrg] = useState(organization || '');
  const [selectedTeam, setSelectedTeam] = useState(team || '');
  
  useEffect(() => {
    if (organization && organization !== selectedOrg) {
      setSelectedOrg(organization);
    }
    
    if (team && team !== selectedTeam) {
      setSelectedTeam(team);
    }
  }, [organization, team, selectedOrg, selectedTeam]);
  
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
              <option value="your-org">Your Organization</option>
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
      </VStack>
    </Box>
  );
};

export default FilterBar;
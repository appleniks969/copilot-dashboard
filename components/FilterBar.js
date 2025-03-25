import React from 'react';
import { 
  Flex, 
  Select, 
  Input, 
  Button, 
  FormControl, 
  FormLabel, 
  Stack, 
  Text, 
  Box, 
  useColorModeValue,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { DATE_RANGES, TEAMS_LIST } from '../lib/config';
import { useCopilot } from '../lib/CopilotContext';
import { RepeatIcon } from '@chakra-ui/icons';

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

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const hoverBorderColor = useColorModeValue('brand.500', 'brand.300');

  return (
    <Box
      mb={8}
      p={0}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      bg={bgColor}
      boxShadow="md"
      overflow="hidden"
      position="relative"
    >
      <Box 
        position="absolute" 
        left="0" 
        top="0" 
        right="0" 
        height="4px" 
        bgGradient="linear(to-r, brand.300, green.400)" 
      />
      
      <Flex 
        direction={{ base: 'column', lg: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', lg: 'flex-end' }}
        wrap="wrap"
        gap={6}
        p={6}
      >
        <Stack 
          direction={{ base: 'column', md: 'row' }} 
          spacing={6} 
          flex="1"
          width="full"
        >
          <FormControl>
            <FormLabel 
              fontWeight="medium" 
              color={labelColor}
              fontSize="sm"
            >
              Organization
            </FormLabel>
            <Input 
              value={organization} 
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Enter GitHub organization"
              bg={inputBgColor}
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="sm"
              _hover={{ borderColor: hoverBorderColor }}
              _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px brand.500" }}
              fontSize="md"
            />
          </FormControl>
          
          <FormControl>
            <FormLabel 
              fontWeight="medium" 
              color={labelColor}
              fontSize="sm"
            >
              Team
            </FormLabel>
            {TEAMS_LIST.length > 0 ? (
              <Select 
                value={team} 
                onChange={(e) => setTeam(e.target.value)}
                bg={inputBgColor}
                borderColor={borderColor}
                borderRadius="md"
                boxShadow="sm"
                _hover={{ borderColor: hoverBorderColor }}
                _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px brand.500" }}
                fontSize="md"
                iconColor="brand.500"
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
                bg={inputBgColor}
                borderColor={borderColor}
                borderRadius="md"
                boxShadow="sm"
                _hover={{ borderColor: hoverBorderColor }}
                _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px brand.500" }}
                fontSize="md"
              />
            )}
            <Text fontSize="xs" color={textColor} mt={1} opacity={0.8}>
              Team data will be shown for the selected team.
            </Text>
          </FormControl>
          
          <FormControl>
            <FormLabel 
              fontWeight="medium" 
              color={labelColor}
              fontSize="sm"
            >
              Date Range
            </FormLabel>
            <Select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              bg={inputBgColor}
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="sm"
              _hover={{ borderColor: hoverBorderColor }}
              _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px brand.500" }}
              fontSize="md"
              iconColor="brand.500"
            >
              <option value={DATE_RANGES.LAST_1_DAY}>Last 1 Day</option>
              <option value={DATE_RANGES.LAST_7_DAYS}>Last 7 Days</option>
              <option value={DATE_RANGES.LAST_14_DAYS}>Last 14 Days</option>
              <option value={DATE_RANGES.LAST_28_DAYS}>Last 28 Days</option>
            </Select>
          </FormControl>
        </Stack>
        
        <Tooltip 
          label="Refresh dashboard data" 
          placement="top" 
          hasArrow
          bg="brand.600"
        >
          <Button 
            onClick={() => {
              // This will trigger a data refresh through the context's useEffect
              // by slightly modifying the date range and setting it back
              const currentRange = dateRange;
              setDateRange('1 day'); // Set to a different value temporarily
              setTimeout(() => setDateRange(currentRange), 100); // Set back to original value
            }}
            colorScheme="brand"
            minW="120px"
            borderRadius="md"
            fontWeight="medium"
            boxShadow="sm"
            rightIcon={<Icon as={RepeatIcon} />}
            size="md"
          >
            Refresh
          </Button>
        </Tooltip>
      </Flex>
    </Box>
  );
};

export default FilterBar;
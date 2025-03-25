import React from 'react';
import { 
  Select, 
  FormControl, 
  FormLabel, 
  Box,
  Flex,
  useColorModeValue,
  Button,
  Icon,
  Tooltip,
  Badge,
  Text
} from '@chakra-ui/react';
import { DATE_RANGES } from '../lib/config';
import { RepeatIcon, InfoIcon } from '@chakra-ui/icons';

const DateRangeFilter = ({ dateRange, setDateRange, label = "Date Range", compact = false }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const hoverBorderColor = useColorModeValue('brand.500', 'brand.300');
  const badgeBg = useColorModeValue('blue.50', 'blue.900');
  const badgeColor = useColorModeValue('blue.700', 'blue.200');

  // Helper function to get a human-readable description of the date range
  const getDateRangeLabel = (range) => {
    switch (range) {
      case DATE_RANGES.LAST_1_DAY:
        return 'Daily metrics';
      case DATE_RANGES.LAST_7_DAYS:
        return '7-day metrics';
      case DATE_RANGES.LAST_14_DAYS:
        return '14-day metrics';
      case DATE_RANGES.LAST_28_DAYS:
        return '28-day metrics';
      default:
        return '';
    }
  };

  return (
    <Flex 
      direction={compact ? "row" : "column"}
      align={compact ? "center" : "flex-start"}
      gap={compact ? 4 : 1}
      mb={4}
    >
      {!compact && (
        <FormLabel 
          fontWeight="medium" 
          color={labelColor}
          fontSize="sm"
          mb={1}
        >
          {label}
        </FormLabel>
      )}
      <Flex direction="column" gap={1}>
        <Flex align="center" gap={2}>
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
            size={compact ? "sm" : "md"}
            width={compact ? "auto" : "full"}
            maxW={compact ? "160px" : "none"}
          >
            <option value={DATE_RANGES.LAST_1_DAY}>Last 1 Day</option>
            <option value={DATE_RANGES.LAST_7_DAYS}>Last 7 Days</option>
            <option value={DATE_RANGES.LAST_14_DAYS}>Last 14 Days</option>
            <option value={DATE_RANGES.LAST_28_DAYS}>Last 28 Days</option>
          </Select>
          
          <Tooltip 
            label="Refresh data" 
            placement="top" 
            hasArrow
            bg="brand.600"
          >
            <Button 
              onClick={() => {
                // This will trigger a data refresh through useEffect
                const currentRange = dateRange;
                setDateRange('1 day'); // Set to a different value temporarily
                setTimeout(() => setDateRange(currentRange), 100); // Set back to original value
              }}
              colorScheme="brand"
              size={compact ? "sm" : "md"}
              borderRadius="md"
              variant={compact ? "ghost" : "solid"}
              p={compact ? 2 : 3}
            >
              <Icon as={RepeatIcon} />
            </Button>
          </Tooltip>
        </Flex>
        
        {/* Current time period indicator badge */}
        <Badge 
          colorScheme="blue" 
          variant="subtle" 
          fontSize="xs" 
          borderRadius="full" 
          px={2} 
          py={0.5}
          bg={badgeBg}
          color={badgeColor}
          display="flex"
          alignItems="center"
          width="fit-content"
        >
          <Icon as={InfoIcon} mr={1} boxSize="0.7em" />
          <Text fontSize="xs" fontWeight="medium">
            {getDateRangeLabel(dateRange)}
          </Text>
        </Badge>
      </Flex>
    </Flex>
  );
};

export default DateRangeFilter;
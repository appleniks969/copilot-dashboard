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
  Tooltip
} from '@chakra-ui/react';
import { DATE_RANGES } from '../lib/config';
import { RepeatIcon } from '@chakra-ui/icons';

const DateRangeFilter = ({ dateRange, setDateRange, label = "Date Range", compact = false }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const hoverBorderColor = useColorModeValue('brand.500', 'brand.300');

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
    </Flex>
  );
};

export default DateRangeFilter;
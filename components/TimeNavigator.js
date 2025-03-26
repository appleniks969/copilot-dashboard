import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  ButtonGroup,
  Button,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Tooltip,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useDisclosure,
  Icon,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  TimeIcon, 
  InfoIcon, 
  CalendarIcon,
  RepeatIcon
} from '@chakra-ui/icons';
import { DATE_RANGES } from '../lib/config';
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis } from 'recharts';

/**
 * TimeNavigator - An advanced time selection component
 * 
 * Features:
 * - Interactive timeline with draggable date range selection
 * - Preset periods with visual indicators
 * - Mini-preview charts for quick data comparison
 * - Previous period comparison feature
 */
const TimeNavigator = ({ 
  dateRange, 
  setDateRange, 
  metricData = [], 
  onRefresh,
  isLoading = false,
  compareWithPrevious = false,
  setCompareWithPrevious,
}) => {
  // Color scheme
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const sliderThumbColor = useColorModeValue('blue.500', 'blue.300');
  const sliderTrackColor = useColorModeValue('blue.100', 'blue.900');
  const selectedBgColor = useColorModeValue('blue.50', 'blue.900');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const chartLineColor = useColorModeValue('blue.500', 'blue.300');
  const chartFillColor = useColorModeValue('blue.100', 'blue.900');
  
  // Predefined ranges with visual representation
  const predefinedRanges = [
    { 
      id: DATE_RANGES.LAST_1_DAY, 
      label: 'Day', 
      longLabel: 'Last 24 Hours',
      days: 1,
      icon: TimeIcon
    },
    { 
      id: DATE_RANGES.LAST_7_DAYS, 
      label: '7D', 
      longLabel: 'Last 7 Days',
      days: 7,
      icon: CalendarIcon
    },
    { 
      id: DATE_RANGES.LAST_14_DAYS, 
      label: '14D', 
      longLabel: 'Last 14 Days',
      days: 14,
      icon: CalendarIcon
    },
    { 
      id: DATE_RANGES.LAST_28_DAYS, 
      label: '28D', 
      longLabel: 'Last 28 Days',
      days: 28,
      icon: CalendarIcon
    }
  ];
  
  // Sample data for mini-previews (to be replaced with actual data)
  const generatePreviewData = (days, trend = 'up') => {
    const data = [];
    let value = trend === 'up' ? 10 : 50;
    
    for (let i = 0; i < days; i++) {
      const randomFactor = Math.random() * 10 - 5;
      if (trend === 'up') {
        value = Math.max(5, value + randomFactor + 2);
      } else {
        value = Math.max(5, value + randomFactor - 1);
      }
      data.push({
        day: i + 1,
        value: Math.round(value),
      });
    }
    return data;
  };
  
  // Reference data for tooltips
  const previewData = {
    [DATE_RANGES.LAST_1_DAY]: generatePreviewData(24, 'up'),
    [DATE_RANGES.LAST_7_DAYS]: generatePreviewData(7, 'up'),
    [DATE_RANGES.LAST_14_DAYS]: generatePreviewData(14, 'down'),
    [DATE_RANGES.LAST_28_DAYS]: generatePreviewData(28, 'up'),
  };
  
  // Get the current range object
  const currentRange = predefinedRanges.find(range => range.id === dateRange) || predefinedRanges[3];
  
  // Sample metrics summary for the tooltip previews
  const getMetricSummary = (rangeId) => {
    const data = previewData[rangeId];
    if (!data) return null;
    
    const lastValue = data[data.length - 1].value;
    const firstValue = data[0].value;
    const changePercent = ((lastValue - firstValue) / firstValue) * 100;
    
    return {
      value: lastValue,
      change: Math.round(changePercent),
      direction: changePercent >= 0 ? 'increase' : 'decrease'
    };
  };
  
  return (
    <Box
      p={4}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      bg={bgColor}
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: 'md' }}
      mb={6}
    >
      <Flex justify="space-between" direction={{ base: 'column', md: 'row' }} gap={4}>
        {/* Fixed time period message */}
        <Flex direction="column" gap={2}>
          <Text fontWeight="medium" color={mutedTextColor} fontSize="sm">Time Period</Text>
          <Flex 
            align="center" 
            bg="blue.50" 
            color="blue.700" 
            fontWeight="medium" 
            px={4} 
            py={2} 
            borderRadius="lg" 
            borderWidth="1px" 
            borderColor="blue.200"
          >
            <CalendarIcon mr={2} />
            <Text>Showing All Available Data (Last 28 Days)</Text>
          </Flex>
        </Flex>
        
        {/* Advanced options */}
        <Flex gap={4} align="flex-end">
          <Button
            leftIcon={<RepeatIcon />}
            colorScheme="blue"
            variant="ghost"
            size="md"
            isLoading={isLoading}
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </Flex>
      </Flex>
      
      {/* Date range indicator */}
      <Flex mt={5} direction="column" gap={1}>
        <Flex justify="space-between" align="center" width="100%">
          <Text fontSize="sm" color={mutedTextColor}>28 Days Ago</Text>
          <Text fontSize="sm" color={textColor} fontWeight="medium">
            All Available Data
          </Text>
          <Text fontSize="sm" color={mutedTextColor}>Today</Text>
        </Flex>
        
        {/* Range slider (decorative in this version) */}
        <RangeSlider 
          defaultValue={[0, 100]} 
          min={0} 
          max={100}
          step={1}
          colorScheme="blue"
          isReadOnly
        >
          <RangeSliderTrack bg={sliderTrackColor}>
            <RangeSliderFilledTrack bg={sliderThumbColor} />
          </RangeSliderTrack>
          <RangeSliderThumb boxSize={4} index={0} bg={sliderThumbColor} />
          <RangeSliderThumb boxSize={4} index={1} bg={sliderThumbColor} />
        </RangeSlider>
      </Flex>
      
      {/* Current selection badge */}
      <Flex justify="center" mt={3}>
        <Badge 
          colorScheme="blue"
          px={3}
          py={1}
          borderRadius="full"
          display="flex"
          alignItems="center"
          gap={1}
        >
          <TimeIcon boxSize={3} />
          <Text fontSize="xs">
            Last 28 Days (All Available Data)
          </Text>
        </Badge>
      </Flex>
    </Box>
  );
};

export default TimeNavigator;
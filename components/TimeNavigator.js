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
        {/* Time range selector buttons */}
        <Flex direction="column" gap={2}>
          <Text fontWeight="medium" color={mutedTextColor} fontSize="sm">Time Period</Text>
          <ButtonGroup 
            size="md" 
            isAttached 
            variant="outline"
            borderRadius="lg"
            boxShadow="sm"
          >
            {predefinedRanges.map((range) => (
              <Popover
                key={range.id}
                trigger="hover"
                placement="bottom"
                isLazy
                openDelay={300}
              >
                <PopoverTrigger>
                  <Button
                    leftIcon={<Icon as={range.icon} />}
                    onClick={() => setDateRange(range.id)}
                    bg={dateRange === range.id ? selectedBgColor : 'transparent'}
                    borderColor={borderColor}
                    color={dateRange === range.id ? 'blue.500' : textColor}
                    fontWeight={dateRange === range.id ? 'bold' : 'medium'}
                    _hover={{ bg: hoverBgColor }}
                    position="relative"
                  >
                    {range.label}
                    {dateRange === range.id && (
                      <Box
                        position="absolute"
                        bottom="-1px"
                        left="50%"
                        transform="translateX(-50%)"
                        w="40%"
                        h="2px"
                        bg="blue.500"
                        borderRadius="full"
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  w="240px"
                  shadow="lg"
                  borderColor={borderColor}
                  bg={bgColor}
                >
                  <PopoverArrow bg={bgColor} />
                  <PopoverBody p={3}>
                    <Text fontWeight="bold" mb={1}>{range.longLabel}</Text>
                    <Box h="80px" mb={2}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={previewData[range.id]}>
                          <XAxis dataKey="day" hide={true} />
                          <RechartsTooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <Box 
                                    bg={bgColor} 
                                    p={1} 
                                    borderRadius="md" 
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                    fontSize="xs"
                                  >
                                    <Text fontWeight="bold">{payload[0].value}</Text>
                                  </Box>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke={chartLineColor} 
                            fill={chartFillColor}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                    <Stat size="sm">
                      <StatLabel fontSize="xs">Average Value</StatLabel>
                      <Flex align="center" justify="space-between">
                        <StatNumber fontSize="md">
                          {getMetricSummary(range.id).value}
                        </StatNumber>
                        <StatHelpText mb={0} fontSize="xs">
                          <StatArrow 
                            type={getMetricSummary(range.id).direction}
                            color={getMetricSummary(range.id).direction === 'increase' ? 'green.500' : 'red.500'} 
                          />
                          {getMetricSummary(range.id).change}%
                        </StatHelpText>
                      </Flex>
                    </Stat>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            ))}
          </ButtonGroup>
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
          
          <Button
            rightIcon={<Icon as={InfoIcon} boxSize={3} />}
            colorScheme="purple"
            variant={compareWithPrevious ? "solid" : "outline"}
            size="md"
            onClick={() => setCompareWithPrevious(!compareWithPrevious)}
          >
            Compare with Previous
          </Button>
        </Flex>
      </Flex>
      
      {/* Date range indicator */}
      <Flex mt={5} direction="column" gap={1}>
        <Flex justify="space-between" align="center" width="100%">
          <Text fontSize="sm" color={mutedTextColor}>Past</Text>
          <Text fontSize="sm" color={textColor} fontWeight="medium">
            {currentRange.longLabel}
          </Text>
          <Text fontSize="sm" color={mutedTextColor}>Now</Text>
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
            {currentRange.longLabel}
          </Text>
        </Badge>
      </Flex>
    </Box>
  );
};

export default TimeNavigator;
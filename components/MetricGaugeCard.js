import React, { useState } from 'react';
import {
  Box,
  Text,
  Flex,
  useColorModeValue,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
  Heading,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  VStack,
  HStack,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Button,
} from '@chakra-ui/react';
import { 
  InfoIcon, 
  TimeIcon, 
  ChevronRightIcon,
  QuestionIcon,
  StarIcon,
  RepeatIcon
} from '@chakra-ui/icons';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

/**
 * MetricGaugeCard - A modern metric card with circular gauge
 * 
 * Features:
 * - Circular gauge visualization with target indicators
 * - Trend sparkline visualization
 * - Impact score with visual indicator
 * - Comparison with previous period
 * - Expandable context information
 */
const MetricGaugeCard = ({
  title,
  value,
  formattedValue,
  suffix = '',
  target = 100,
  min = 0,
  max = 100,
  change = null,
  changeDirection = null,
  previousValue = null,
  impactScore = null,
  description = '',
  timeFrame = '',
  timeFrameLabel = '',
  category = 'usage',
  trendData = [],
  showSparkline = true,
  infoTooltip = '',
  onExpand = null,
  colorScheme = 'blue',
  onClick = null,
}) => {
  // Generate sample trend data if none provided
  if (!trendData || trendData.length === 0) {
    trendData = Array.from({ length: 10 }, (_, i) => ({
      day: i + 1,
      value: Math.round(Math.random() * 40) + 30
    }));
  }
  
  // Color scheme based on category or passed colorScheme
  const getColorScheme = () => {
    if (colorScheme) return colorScheme;
    
    switch (category) {
      case 'usage': return 'blue';
      case 'acceptance': return 'green';
      case 'productivity': return 'purple';
      case 'roi': return 'orange';
      default: return 'blue';
    }
  };

  const scheme = getColorScheme();
  
  // UI colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const gaugeEmptyColor = useColorModeValue('gray.100', 'gray.700');
  const trendLineColor = useColorModeValue(`${scheme}.500`, `${scheme}.400`);
  const trendFillColor = useColorModeValue(`${scheme}.50`, `${scheme}.900`);
  const badgeBg = useColorModeValue(`${scheme}.50`, `${scheme}.900`);
  const badgeColor = useColorModeValue(`${scheme}.700`, `${scheme}.200`);
  
  // Calculate progress percentage for gauge
  const calculateProgress = () => {
    // Handle edge cases
    if (value <= min) return 0;
    if (value >= max) return 100;
    
    return Math.round(((value - min) / (max - min)) * 100);
  };
  
  // Calculate target percentage for gauge indicator
  const calculateTargetPercentage = () => {
    if (target <= min) return 0;
    if (target >= max) return 100;
    
    return ((target - min) / (max - min)) * 100;
  };
  
  // Gauge colors based on progress vs target
  const getGaugeColor = () => {
    const progress = calculateProgress();
    const targetPercent = calculateTargetPercentage();
    
    if (progress >= targetPercent) {
      return 'green.400';
    } else if (progress >= targetPercent * 0.75) {
      return 'yellow.400';
    } else {
      return 'red.400';
    }
  };
  
  // Impact score formatting and color
  const getImpactInfo = () => {
    if (impactScore === null) return { label: 'N/A', color: 'gray.400' };
    
    if (impactScore >= 8) return { label: 'High', color: 'green.500' };
    if (impactScore >= 5) return { label: 'Medium', color: 'yellow.500' };
    return { label: 'Low', color: 'red.500' };
  };
  
  const impactInfo = getImpactInfo();
  const progress = calculateProgress();
  const targetPosition = calculateTargetPercentage();
  
  return (
    <Box
      p={5}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      bg={cardBg}
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ 
        transform: 'translateY(-3px)', 
        boxShadow: 'md',
        borderColor: `${scheme}.300` 
      }}
      position="relative"
      overflow="hidden"
      cursor={onClick ? "pointer" : "default"}
      onClick={onClick}
    >
      {/* Category indicator line */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        height="4px"
        bg={`${scheme}.500`}
      />
      
      <Flex justify="space-between" mb={4}>
        <Flex direction="column">
          <Heading
            as="h3"
            size="sm"
            color={textColor}
            mb={1}
            display="flex"
            alignItems="center"
            gap={1}
          >
            {title}
            {infoTooltip && (
              <Tooltip label={infoTooltip} placement="top" hasArrow>
                <InfoIcon boxSize={3} color={`${scheme}.400`} cursor="help" />
              </Tooltip>
            )}
          </Heading>
          
          {/* Time period badge */}
          {timeFrame && (
            <Badge
              colorScheme={scheme}
              variant="subtle"
              fontSize="xs"
              borderRadius="full"
              px={2}
              py={0.5}
              width="fit-content"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <TimeIcon boxSize="0.6em" />
              <Text>{timeFrameLabel || timeFrame}</Text>
            </Badge>
          )}
        </Flex>
        
        {/* Impact score indicator */}
        {impactScore !== null && (
          <Tooltip 
            label={`Impact score: ${impactScore}/10. This metric has ${impactInfo.label.toLowerCase()} impact on productivity.`} 
            placement="top" 
            hasArrow
          >
            <Flex 
              direction="column" 
              align="center" 
              bg={badgeBg}
              p={1.5} 
              borderRadius="md"
              minW="60px"
            >
              <Flex align="center" gap={1}>
                <Icon as={StarIcon} color={impactInfo.color} boxSize={3} />
                <Text fontWeight="bold" fontSize="sm" color={impactInfo.color}>
                  {impactScore}
                </Text>
              </Flex>
              <Text fontSize="xs" color={mutedTextColor}>
                Impact
              </Text>
            </Flex>
          </Tooltip>
        )}
      </Flex>
      
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        align="center"
        justify="space-between"
        gap={5}
      >
        {/* Circular gauge */}
        <Box position="relative">
          <CircularProgress
            value={progress}
            color={getGaugeColor()}
            trackColor={gaugeEmptyColor}
            size="120px"
            thickness="12px"
          >
            <CircularProgressLabel>
              <VStack spacing={0}>
                <Text fontSize="xl" fontWeight="bold" lineHeight="1.2">
                  {formattedValue || value}
                </Text>
                {suffix && (
                  <Text fontSize="xs" color={mutedTextColor} lineHeight="1">
                    {suffix}
                  </Text>
                )}
              </VStack>
            </CircularProgressLabel>
          </CircularProgress>
          
          {/* Target indicator */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width="130px"
            height="130px"
            transform="translate(-50%, -50%)"
            borderRadius="full"
            pointerEvents="none"
          >
            {/* Target marker at correct angle */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              width="15px"
              height="4px"
              bg="orange.500"
              borderRadius="full"
              transform={`rotate(${(targetPosition * 3.6) - 90}deg) translateX(60px)`}
              transformOrigin="left center"
            />
            
            {/* Target value tooltip */}
            <Tooltip 
              label={`Target: ${target}${suffix}`} 
              placement="top" 
              hasArrow
              bg="orange.500"
            >
              <Box
                position="absolute"
                top="50%"
                left="50%"
                width="6px"
                height="6px"
                bg="orange.500"
                borderRadius="full"
                transform={`rotate(${(targetPosition * 3.6) - 90}deg) translateX(66px)`}
                transformOrigin="left center"
                zIndex={2}
              />
            </Tooltip>
          </Box>
        </Box>
        
        {/* Right side: Trend + stats */}
        <Flex direction="column" width="100%" gap={2}>
          {/* Trend sparkline */}
          {showSparkline && (
            <Box height="50px" width="100%">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id={`${title}Color`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={trendLineColor} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={trendFillColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={trendLineColor} 
                    fill={`url(#${title}Color)`} 
                    strokeWidth={2}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          )}
          
          {/* Change stats */}
          {change !== null && changeDirection && (
            <Stat size="sm">
              <Flex justify="space-between" align="center">
                <StatHelpText mb={0}>
                  <StatArrow 
                    type={changeDirection} 
                    color={changeDirection === 'increase' ? 'green.500' : 'red.500'} 
                  />
                  {change}% from previous period
                </StatHelpText>
                <Tooltip 
                  label="Learn more about this metric" 
                  placement="top" 
                  hasArrow
                >
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme={scheme}
                    rightIcon={<ChevronRightIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onExpand) onExpand();
                    }}
                  >
                    Details
                  </Button>
                </Tooltip>
              </Flex>
            </Stat>
          )}
        </Flex>
      </Flex>
      
      {/* Description if provided */}
      {description && (
        <Text fontSize="xs" color={mutedTextColor} mt={3} noOfLines={2}>
          {description}
        </Text>
      )}
    </Box>
  );
};

export default MetricGaugeCard;
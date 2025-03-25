import React from 'react';
import { Box, Heading, Text, Flex, Tooltip, useColorModeValue, Badge, Icon } from '@chakra-ui/react';
import { InfoIcon, TimeIcon } from '@chakra-ui/icons';
import { DATE_RANGES } from '../lib/config';

const ChartCard = ({ 
  title, 
  description, 
  infoTooltip, 
  children, 
  bg,
  borderColor,
  accentColor = 'brand.500',
  timeFrame,
  ...rest 
}) => {
  // Default values if not provided
  const backgroundColor = bg || useColorModeValue('white', 'gray.800');
  const border = borderColor || useColorModeValue('gray.200', 'gray.700');
  const titleColor = useColorModeValue('gray.700', 'white');
  const descColor = useColorModeValue('gray.600', 'gray.300');
  const accentLightColor = accentColor.replace('500', '200');
  const badgeBg = useColorModeValue('gray.100', 'gray.700');
  const badgeColor = useColorModeValue('gray.600', 'gray.300');

  // Get a proper time frame label if available
  const getTimeFrameLabel = () => {
    if (!timeFrame) return null;
    
    let label = '';
    if (timeFrame === DATE_RANGES.LAST_1_DAY) {
      label = 'Daily';
    } else if (timeFrame === DATE_RANGES.LAST_7_DAYS) {
      label = '7-day period';
    } else if (timeFrame === DATE_RANGES.LAST_14_DAYS) {
      label = '14-day period';
    } else if (timeFrame === DATE_RANGES.LAST_28_DAYS) {
      label = '28-day period';
    } else {
      // Try to extract just the number if it's in the format "X days"
      const match = timeFrame.match(/^(\d+)/);
      if (match && match[1]) {
        label = `${match[1]}-day period`;
      } else {
        label = timeFrame;
      }
    }
    
    return label;
  };
  
  const timeFrameLabel = getTimeFrameLabel();

  return (
    <Box
      p={6}
      shadow="md"
      borderWidth="1px"
      borderRadius="xl"
      bg={backgroundColor}
      borderColor={border}
      position="relative"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{ 
        shadow: 'lg',
        borderColor: accentColor,
        transform: 'translateY(-4px)',
        zIndex: 1
      }}
      height="100%"
      display="flex"
      flexDirection="column"
      {...rest}
    >
      <Box 
        position="absolute" 
        top="0" 
        left="0" 
        right="0"
        height="5px" 
        bgGradient={`linear(to-r, ${accentColor}, ${accentLightColor})`}
      />
      <Flex justify="space-between" align="flex-start" mb={3}>
        <Box>
          <Heading 
            size="md" 
            color={titleColor}
            fontWeight="bold"
            letterSpacing="tight"
            mb={1}
          >
            {title}
          </Heading>
          
          {/* Time frame badge */}
          {timeFrameLabel && (
            <Badge 
              variant="subtle" 
              colorScheme="gray" 
              fontSize="xs" 
              borderRadius="full"
              px={2}
              py={0.5}
              bg={badgeBg}
              color={badgeColor}
              display="flex"
              alignItems="center"
              width="fit-content"
              mb={2}
            >
              <Icon as={TimeIcon} mr={1} boxSize="0.7em" />
              <Text fontSize="xs" fontWeight="medium">
                {timeFrameLabel}
              </Text>
            </Badge>
          )}
        </Box>
        
        {infoTooltip && (
          <Tooltip 
            label={infoTooltip} 
            hasArrow 
            placement="top" 
            bg={accentColor}
            borderRadius="md"
            px={3}
            py={2}
            maxW="300px"
          >
            <Box 
              as="span" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
            >
              <InfoIcon color={accentColor} boxSize={4} cursor="help" />
            </Box>
          </Tooltip>
        )}
      </Flex>
      {description && (
        <Text 
          fontSize="sm" 
          color={descColor} 
          mb={5}
          fontWeight="medium"
        >
          {description}
        </Text>
      )}
      <Box 
        flex="1" 
        minH="300px" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        {children}
      </Box>
    </Box>
  );
};

export default ChartCard;
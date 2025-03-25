import React from 'react';
import { 
  Box, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  StatArrow, 
  Flex, 
  Icon, 
  Tooltip, 
  useColorModeValue,
  Badge,
  Text
} from '@chakra-ui/react';
import { InfoIcon, TimeIcon } from '@chakra-ui/icons';
import { DATE_RANGES } from '../lib/config';

const StatCard = ({ 
  title, 
  value, 
  helpText, 
  icon, 
  change, 
  changeDirection, 
  infoTooltip, 
  accentColor = 'brand.500',
  bg,
  borderColor,
  timeFrame,
  ...rest 
}) => {
  // Default values if not provided
  const backgroundColor = bg || useColorModeValue('white', 'gray.800');
  const border = borderColor || useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const valueColor = useColorModeValue('gray.800', 'white');
  const helpTextColor = useColorModeValue('gray.500', 'gray.400');
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
        transform: 'translateY(-4px)', 
        shadow: 'lg',
        borderColor: accentColor,
        zIndex: 1
      }}
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
      <Stat>
        <Flex justify="space-between" mb={3} align="center">
          <Flex direction="column" gap={1}>
            <StatLabel 
              fontSize="md" 
              color={labelColor} 
              fontWeight="semibold"
              letterSpacing="tight"
            >
              {title}
            </StatLabel>
            
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
              >
                <Icon as={TimeIcon} mr={1} boxSize="0.7em" />
                <Text fontSize="xs" fontWeight="medium">
                  {timeFrameLabel}
                </Text>
              </Badge>
            )}
          </Flex>
          
          <Flex>
            {infoTooltip && (
              <Tooltip 
                label={infoTooltip} 
                hasArrow 
                placement="top" 
                bg={accentColor}
                borderRadius="md"
                px={3}
                py={2}
              >
                <Box as="span" mr={2}>
                  <InfoIcon color={accentColor} boxSize={4} cursor="help" />
                </Box>
              </Tooltip>
            )}
            {icon && <Icon as={icon} color={accentColor} boxSize={5} />}
          </Flex>
        </Flex>
        <StatNumber 
          fontSize="3xl" 
          fontWeight="bold" 
          color={valueColor}
          letterSpacing="tight"
          my={2}
          bgGradient={`linear(to-r, ${accentColor}, ${accentLightColor})`}
          bgClip="text"
        >
          {value}
        </StatNumber>
        {helpText && (
          <StatHelpText 
            fontSize="sm" 
            color={helpTextColor}
            mt={2}
            fontWeight="medium"
          >
            {helpText}
          </StatHelpText>
        )}
        {change && (
          <StatHelpText 
            display="flex" 
            alignItems="center" 
            mt={2}
            fontWeight="medium"
            fontSize="sm"
          >
            <StatArrow 
              type={changeDirection || 'increase'} 
              color={changeDirection === 'decrease' ? 'red.400' : 'green.400'} 
            />
            <Box color={changeDirection === 'decrease' ? 'red.400' : 'green.400'}>
              {change}
            </Box>
          </StatHelpText>
        )}
      </Stat>
    </Box>
  );
};

export default StatCard;
import React from 'react';
import { Box, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Flex, Icon, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

const StatCard = ({ 
  title, 
  value, 
  helpText, 
  icon, 
  change, 
  changeDirection, 
  infoTooltip, 
  accentColor = 'blue.400',
  bg,
  borderColor,
  ...rest 
}) => {
  // Default values if not provided
  const backgroundColor = bg || useColorModeValue('white', 'gray.700');
  const border = borderColor || useColorModeValue('gray.200', 'gray.600');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const valueColor = useColorModeValue('gray.800', 'white');
  const helpTextColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box
      p={5}
      shadow="sm"
      borderWidth="1px"
      borderRadius="lg"
      bg={backgroundColor}
      borderColor={border}
      position="relative"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ 
        transform: 'translateY(-2px)', 
        shadow: 'md',
        borderColor: accentColor
      }}
      {...rest}
    >
      <Box 
        position="absolute" 
        top="0" 
        left="0" 
        width="4px" 
        height="100%" 
        bg={accentColor} 
      />
      <Stat>
        <Flex justify="space-between" mb={2}>
          <StatLabel fontSize="md" color={labelColor} fontWeight="medium">{title}</StatLabel>
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
        >
          {value}
        </StatNumber>
        {helpText && (
          <StatHelpText 
            fontSize="sm" 
            color={helpTextColor}
            mt={1}
          >
            {helpText}
          </StatHelpText>
        )}
        {change && (
          <StatHelpText display="flex" alignItems="center">
            <StatArrow type={changeDirection || 'increase'} color={changeDirection === 'decrease' ? 'red.400' : 'green.400'} />
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
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
  useColorModeValue 
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

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
  ...rest 
}) => {
  // Default values if not provided
  const backgroundColor = bg || useColorModeValue('white', 'gray.800');
  const border = borderColor || useColorModeValue('gray.200', 'gray.700');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const valueColor = useColorModeValue('gray.800', 'white');
  const helpTextColor = useColorModeValue('gray.500', 'gray.400');
  const accentLightColor = accentColor.replace('500', '200');

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
          <StatLabel 
            fontSize="md" 
            color={labelColor} 
            fontWeight="semibold"
            letterSpacing="tight"
          >
            {title}
          </StatLabel>
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
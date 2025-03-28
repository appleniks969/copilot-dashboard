/**
 * StatCard.js
 * Reusable component for displaying statistics
 */

import React from 'react';
import { 
  Box, 
  Flex, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText,
  useColorModeValue,
  Badge,
  Tooltip
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

const StatCard = ({ 
  title, 
  value, 
  helpText, 
  accentColor = 'blue.400', 
  bg, 
  borderColor,
  timeFrame,
  tooltip
}) => {
  return (
    <Box
      p={5}
      bg={bg || useColorModeValue('white', 'gray.700')}
      borderWidth="1px"
      borderColor={borderColor || useColorModeValue('gray.200', 'gray.600')}
      borderRadius="lg"
      boxShadow="sm"
      position="relative"
      overflow="hidden"
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
        <Flex align="center">
          <StatLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>
            {title}
          </StatLabel>
          
          {tooltip && (
            <Tooltip label={tooltip} fontSize="sm">
              <Box display="inline-block" ml={1}>
                <InfoIcon boxSize={3} color="gray.400" />
              </Box>
            </Tooltip>
          )}
        </Flex>
        
        <StatNumber 
          fontSize="2xl" 
          fontWeight="bold"
          mt={1}
          color={useColorModeValue('gray.700', 'white')}
        >
          {value}
        </StatNumber>
        
        {helpText && (
          <StatHelpText fontSize="xs" mt={1} mb={0} color={useColorModeValue('gray.500', 'gray.400')}>
            {helpText}
          </StatHelpText>
        )}
        
        {timeFrame && (
          <Box mt={3}>
            <Badge 
              fontSize="xs" 
              colorScheme="gray" 
              variant="subtle" 
              px={2} 
              py={0.5} 
              borderRadius="full"
            >
              {timeFrame}
            </Badge>
          </Box>
        )}
      </Stat>
    </Box>
  );
};

export default StatCard;
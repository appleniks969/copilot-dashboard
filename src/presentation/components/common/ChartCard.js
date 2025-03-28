/**
 * ChartCard.js
 * Reusable component for displaying charts with consistent styling
 */

import React from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  useColorModeValue,
  Flex,
  Tooltip,
  Badge
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

const ChartCard = ({
  title,
  description,
  children,
  height = "300px",
  bg,
  borderColor,
  accentColor = "blue.400",
  infoTooltip,
  timeFrame
}) => {
  return (
    <Box 
      p={5} 
      bg={bg || useColorModeValue('white', 'gray.700')} 
      borderWidth="1px" 
      borderRadius="lg" 
      borderColor={borderColor || useColorModeValue('gray.200', 'gray.600')}
      boxShadow="sm"
      height={height}
      display="flex"
      flexDirection="column"
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
      
      <Box mb={4}>
        <Flex align="center">
          <Heading 
            size="sm" 
            fontWeight="medium" 
            color={useColorModeValue('gray.700', 'white')}
          >
            {title}
          </Heading>
          
          {infoTooltip && (
            <Tooltip label={infoTooltip} fontSize="sm">
              <Box ml={1} display="inline-flex">
                <InfoIcon boxSize={3} color="gray.400" />
              </Box>
            </Tooltip>
          )}
        </Flex>
        
        {description && (
          <Text 
            mt={1} 
            fontSize="xs" 
            color={useColorModeValue('gray.500', 'gray.400')}
          >
            {description}
          </Text>
        )}
        
        {timeFrame && (
          <Badge 
            mt={2}
            fontSize="xs" 
            colorScheme="gray" 
            variant="subtle" 
            px={2} 
            py={0.5} 
            borderRadius="full"
          >
            {timeFrame}
          </Badge>
        )}
      </Box>

      <Box flex="1" position="relative">
        {children}
      </Box>
    </Box>
  );
};

export default ChartCard;
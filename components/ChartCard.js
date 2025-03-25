import React from 'react';
import { Box, Heading, Text, Flex, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

const ChartCard = ({ 
  title, 
  description, 
  infoTooltip, 
  children, 
  bg,
  borderColor,
  accentColor = 'blue.400',
  ...rest 
}) => {
  // Default values if not provided
  const backgroundColor = bg || useColorModeValue('white', 'gray.700');
  const border = borderColor || useColorModeValue('gray.200', 'gray.600');
  const titleColor = useColorModeValue('gray.700', 'white');
  const descColor = useColorModeValue('gray.600', 'gray.300');

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
      <Flex justify="space-between" align="center" mb={2}>
        <Heading size="md" color={titleColor}>{title}</Heading>
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
            <Box as="span">
              <InfoIcon color={accentColor} boxSize={4} cursor="help" />
            </Box>
          </Tooltip>
        )}
      </Flex>
      {description && <Text fontSize="sm" color={descColor} mb={4}>{description}</Text>}
      <Box h="300px">
        {children}
      </Box>
    </Box>
  );
};

export default ChartCard;
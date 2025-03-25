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
  accentColor = 'brand.500',
  ...rest 
}) => {
  // Default values if not provided
  const backgroundColor = bg || useColorModeValue('white', 'gray.800');
  const border = borderColor || useColorModeValue('gray.200', 'gray.700');
  const titleColor = useColorModeValue('gray.700', 'white');
  const descColor = useColorModeValue('gray.600', 'gray.300');
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
      <Flex justify="space-between" align="center" mb={3}>
        <Heading 
          size="md" 
          color={titleColor}
          fontWeight="bold"
          letterSpacing="tight"
        >
          {title}
        </Heading>
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
import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const ChartCard = ({ title, description, children, ...rest }) => {
  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
      {...rest}
    >
      <Heading size="md" mb={2}>{title}</Heading>
      {description && <Text fontSize="sm" color="gray.600" mb={4}>{description}</Text>}
      <Box h="300px">
        {children}
      </Box>
    </Box>
  );
};

export default ChartCard;
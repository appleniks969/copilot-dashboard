import React from 'react';
import { Box, Heading, Text, Flex, Tooltip } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

const ChartCard = ({ title, description, infoTooltip, children, ...rest }) => {
  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
      {...rest}
    >
      <Flex justify="space-between" align="center" mb={2}>
        <Heading size="md">{title}</Heading>
        {infoTooltip && (
          <Tooltip label={infoTooltip} hasArrow placement="top" bg="blue.600">
            <Box as="span">
              <InfoIcon color="blue.400" boxSize={4} cursor="help" />
            </Box>
          </Tooltip>
        )}
      </Flex>
      {description && <Text fontSize="sm" color="gray.600" mb={4}>{description}</Text>}
      <Box h="300px">
        {children}
      </Box>
    </Box>
  );
};

export default ChartCard;
import React from 'react';
import { Box, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Flex, Icon } from '@chakra-ui/react';

const StatCard = ({ title, value, helpText, icon, change, changeDirection, ...rest }) => {
  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
      {...rest}
    >
      <Stat>
        <Flex justify="space-between" mb={2}>
          <StatLabel fontSize="md" color="gray.600">{title}</StatLabel>
          {icon && <Icon as={icon} color="blue.500" boxSize={5} />}
        </Flex>
        <StatNumber fontSize="2xl" fontWeight="bold">{value}</StatNumber>
        {helpText && <StatHelpText fontSize="sm" color="gray.500">{helpText}</StatHelpText>}
        {change && (
          <StatHelpText>
            <StatArrow type={changeDirection || 'increase'} />
            {change}
          </StatHelpText>
        )}
      </Stat>
    </Box>
  );
};

export default StatCard;
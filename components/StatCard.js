import React from 'react';
import { Box, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Flex, Icon, Tooltip } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

const StatCard = ({ title, value, helpText, icon, change, changeDirection, infoTooltip, ...rest }) => {
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
          <Flex>
            {infoTooltip && (
              <Tooltip label={infoTooltip} hasArrow placement="top" bg="blue.600">
                <Box as="span" mr={2}>
                  <InfoIcon color="blue.400" boxSize={4} cursor="help" />
                </Box>
              </Tooltip>
            )}
            {icon && <Icon as={icon} color="blue.500" boxSize={5} />}
          </Flex>
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
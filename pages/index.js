import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import Dashboard from '../components/Dashboard';
import AuthForm from '../components/AuthForm';
import { useCopilot } from '../lib/CopilotContext';

export default function Home() {
  const { authToken } = useCopilot();

  return (
    <Box>
      {!authToken ? (
        <>
          <Box textAlign="center" mb={8}>
            <Heading size="2xl" mb={4}>GitHub Copilot Usage Dashboard</Heading>
            <Text fontSize="lg" color="gray.600">
              Track and analyze Copilot usage across your organization
            </Text>
          </Box>
          <AuthForm />
        </>
      ) : (
        <Dashboard />
      )}
    </Box>
  );
}
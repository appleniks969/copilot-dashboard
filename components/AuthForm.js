import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Heading,
  Link,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useCopilot } from '../lib/CopilotContext';

const AuthForm = () => {
  const { updateAuthToken } = useCopilot();
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      updateAuthToken(token);
      // Token is now set in context and will trigger data loading
    } catch (error) {
      console.error('Error setting token:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">GitHub Authentication</Heading>
        
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Personal Access Token Required</AlertTitle>
            <AlertDescription>
              This dashboard requires a GitHub Personal Access Token with the following scopes:
              <Text as="ul" ml={4} mt={2}>
                <Text as="li">admin:org</Text>
                <Text as="li">repo</Text>
              </Text>
            </AlertDescription>
          </Box>
        </Alert>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>GitHub Personal Access Token</FormLabel>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your GitHub token"
              />
            </FormControl>
            
            <Button
              colorScheme="blue"
              width="full"
              type="submit"
              isLoading={isSubmitting}
            >
              Authenticate
            </Button>
          </VStack>
        </form>
        
        <Text fontSize="sm" textAlign="center">
          Don't have a token?{' '}
          <Link
            color="blue.500"
            href="https://github.com/settings/tokens/new"
            isExternal
          >
            Create one here
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};

export default AuthForm;
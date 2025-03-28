/**
 * AuthForm.js
 * Component for user authentication
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Link,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';

const AuthForm = () => {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const { login, isLoading, error } = useAuth();
  
  const handleToggleShow = () => setShowToken(!showToken);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token.trim()) {
      return;
    }
    
    await login(token);
  };

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      maxW="md"
      mx="auto"
      p={8}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg={bgColor}
      boxShadow="lg"
    >
      <VStack as="form" spacing={6} onSubmit={handleSubmit}>
        <FormControl isRequired>
          <FormLabel>GitHub Personal Access Token</FormLabel>
          <InputGroup>
            <Input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your GitHub token"
            />
            <InputRightElement>
              <IconButton
                icon={showToken ? <ViewOffIcon /> : <ViewIcon />}
                variant="ghost"
                onClick={handleToggleShow}
                aria-label={showToken ? 'Hide token' : 'Show token'}
              />
            </InputRightElement>
          </InputGroup>
          <Text fontSize="sm" color="gray.500" mt={2}>
            You'll need a token with access to repository and organization data.
            Create one{' '}
            <Link
              href="https://github.com/settings/tokens"
              isExternal
              color="blue.500"
              fontWeight="medium"
            >
              here
            </Link>
            . All GitHub token formats are accepted.
          </Text>
        </FormControl>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Authentication Failed</AlertTitle>
              <AlertDescription fontSize="sm">{error}</AlertDescription>
            </Box>
          </Alert>
        )}

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          isLoading={isLoading}
          loadingText="Authenticating"
        >
          Authenticate
        </Button>
      </VStack>
    </Box>
  );
};

export default AuthForm;
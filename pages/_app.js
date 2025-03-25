import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { CopilotProvider } from '../lib/CopilotContext';
import Layout from '../components/Layout';

// Create a custom Chakra UI theme
const theme = extendTheme({
  fonts: {
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif',
  },
  colors: {
    brand: {
      50: '#e1f5fe',
      100: '#b3e5fc',
      200: '#81d4fa',
      300: '#4fc3f7',
      400: '#29b6f6',
      500: '#03a9f4', // Primary brand color
      600: '#039be5',
      700: '#0288d1',
      800: '#0277bd',
      900: '#01579b',
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        transition: 'background-color 0.2s',
        lineHeight: 'tall',
      },
      '*::placeholder': {
        color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
      },
      '*, *::before, *::after': {
        borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
        _focus: {
          boxShadow: 'outline',
        },
      },
      defaultProps: {
        colorScheme: 'brand',
      },
      variants: {
        solid: (props) => ({
          bg: `${props.colorScheme}.500`,
          color: 'white',
          _hover: {
            bg: `${props.colorScheme}.600`,
            _disabled: {
              bg: `${props.colorScheme}.500`,
            },
          },
          _active: { bg: `${props.colorScheme}.700` },
        }),
        outline: (props) => ({
          color: `${props.colorScheme}.500`,
          borderColor: `${props.colorScheme}.500`,
          _hover: {
            bg: props.colorMode === 'dark' 
              ? `${props.colorScheme}.800` 
              : `${props.colorScheme}.50`,
          },
        }),
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: 'bold',
        letterSpacing: 'tight',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          boxShadow: 'md',
          overflow: 'hidden',
        },
      },
    },
    Badge: {
      baseStyle: {
        textTransform: 'normal',
        fontWeight: 'medium',
      },
      variants: {
        solid: (props) => ({
          bg: `${props.colorScheme}.500`,
          color: 'white',
        }),
        subtle: (props) => ({
          bg: `${props.colorScheme}.100`,
          color: `${props.colorScheme}.800`,
        }),
        outline: (props) => ({
          color: `${props.colorScheme}.500`,
          boxShadow: `inset 0 0 0px 1px ${props.colorScheme}.500`,
        }),
      },
    },
    Tooltip: {
      baseStyle: {
        borderRadius: 'md',
        px: 3,
        py: 2,
        bg: 'gray.800',
        color: 'white',
        fontSize: 'sm',
        fontWeight: 'medium',
        boxShadow: 'lg',
        maxW: '320px',
      },
    },
    // Chart styling
    Chart: {
      baseStyle: {
        tooltip: {
          borderRadius: 'md',
          boxShadow: 'lg',
          py: 2,
          px: 3,
          bg: 'white',
        },
      },
    },
  },
  shadows: {
    outline: '0 0 0 3px rgba(66, 153, 225, 0.6)',
  },
  radii: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <CopilotProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </CopilotProvider>
    </ChakraProvider>
  );
}

export default MyApp;
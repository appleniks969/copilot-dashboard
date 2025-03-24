import { ChakraProvider } from '@chakra-ui/react';
import { CopilotProvider } from '../lib/CopilotContext';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <CopilotProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </CopilotProvider>
    </ChakraProvider>
  );
}

export default MyApp;
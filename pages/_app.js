/**
 * _app.js
 * Next.js application entry point
 */

import { ChakraProvider } from '@chakra-ui/react';
import { setupServices } from '../src/app';
import { AuthProvider } from '../src/presentation/contexts/AuthContext';
import { ConfigProvider } from '../src/presentation/contexts/ConfigContext';
import { AnalyticsProvider } from '../src/presentation/contexts/AnalyticsContext';
import { ReportingProvider } from '../src/presentation/contexts/ReportingContext';
import Layout from '../components/Layout';

// Set up services once on the client side
let services = null;

function getServices() {
  if (typeof window !== 'undefined') {
    if (!services) {
      services = setupServices();
    }
    return services;
  }
  
  // For server-side rendering, create new services each time
  return setupServices();
}

function MyApp({ Component, pageProps }) {
  const services = getServices();
  
  return (
    <ChakraProvider>
      <AuthProvider authenticationService={services.authenticationService}>
        <ConfigProvider configurationService={services.configurationService}>
          <AnalyticsProvider analyticsService={services.analyticsService}>
            <ReportingProvider reportingService={services.reportingService}>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </ReportingProvider>
          </AnalyticsProvider>
        </ConfigProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default MyApp;
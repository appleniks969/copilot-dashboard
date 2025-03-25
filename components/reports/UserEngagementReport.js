import React from 'react';
import { 
  Box, 
  Grid, 
  GridItem, 
  Text,
  Heading,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import StatCard from '../StatCard';
import ChartCard from '../ChartCard';
import { useCopilot } from '../../lib/CopilotContext';
import { CHART_COLORS } from '../../lib/config';
import { formatNumber, formatPercentage, transformDataForCharts } from '../../lib/utils';

const UserEngagementReport = () => {
  const { metrics, dateRange } = useCopilot();
  
  if (!metrics) {
    return (
      <Box p={4}>
        <Text>No data available. Please make sure you're authenticated and have selected a valid organization and team.</Text>
      </Box>
    );
  }

  // Create data for user engagement chart
  const engagementData = [
    { name: 'Active Users', value: metrics.totalActiveUsers || 0 },
    { name: 'Engaged Users', value: metrics.totalEngagedUsers || 0 },
    { name: 'Accepted Suggestions', value: metrics.acceptedSuggestions || 0 },
    { name: 'Total Suggestions', value: metrics.totalSuggestions || 0 },
  ];

  // Create data for acceptance rate pie chart
  const acceptanceData = [
    { name: 'Accepted', value: metrics.acceptedSuggestions || 0 },
    { name: 'Not Accepted', value: (metrics.totalSuggestions || 0) - (metrics.acceptedSuggestions || 0) },
  ];
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box>
      <Heading size="lg" mb={6} color={useColorModeValue('blue.600', 'blue.300')}>User Engagement Report</Heading>
      <Text mb={6}>This report shows how actively developers are using Copilot across your organization.</Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <StatCard 
          title="Total Active Users" 
          value={formatNumber(metrics.totalActiveUsers)}
          helpText={`Over the last ${dateRange}`}
          accentColor="blue.400"
          bg={cardBg}
          borderColor={borderColor}
        />
        <StatCard 
          title="Daily Active Users" 
          value={formatNumber(metrics.dailyActiveUsers)}
          helpText="Average per day"
          accentColor="green.400"
          bg={cardBg}
          borderColor={borderColor}
        />
        <StatCard 
          title="Acceptance Rate" 
          value={formatPercentage(metrics.acceptanceRate)}
          helpText="Suggestions accepted vs. delivered"
          accentColor="purple.400"
          bg={cardBg}
          borderColor={borderColor}
        />
        <StatCard 
          title="Total Suggestions" 
          value={formatNumber(metrics.totalSuggestions)}
          helpText={`Over the last ${dateRange}`}
          accentColor="orange.400"
          bg={cardBg}
          borderColor={borderColor}
        />
      </SimpleGrid>

      <Grid 
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }} 
        gap={6}
      >
        <GridItem>
          <ChartCard 
            title="Usage Metrics" 
            description="Overview of active users and suggestions"
            bg={cardBg}
            borderColor={borderColor}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatNumber(value)}
                  contentStyle={{
                    backgroundColor: cardBg,
                    borderColor: borderColor,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill={CHART_COLORS.primary} name="Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>
        
        <GridItem>
          <ChartCard 
            title="Suggestion Acceptance Rate" 
            description="Ratio of accepted to rejected suggestions"
            bg={cardBg}
            borderColor={borderColor}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={acceptanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${formatPercentage(percent * 100)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {acceptanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? CHART_COLORS.primary : CHART_COLORS.quaternary} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatNumber(value)}
                  contentStyle={{
                    backgroundColor: cardBg,
                    borderColor: borderColor,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default UserEngagementReport;
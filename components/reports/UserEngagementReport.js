import React from 'react';
import { 
  Box, 
  Grid, 
  GridItem, 
  Text,
  Heading,
  SimpleGrid,
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
} from 'recharts';
import StatCard from '../StatCard';
import ChartCard from '../ChartCard';
import { useCopilot } from '../../lib/CopilotContext';
import { CHART_COLORS } from '../../lib/config';
import { formatNumber, formatPercentage, transformDataForCharts } from '../../lib/utils';

const UserEngagementReport = () => {
  const { orgData, teamData, metrics, dateRange } = useCopilot();
  
  if (!orgData || !metrics) {
    return (
      <Box p={4}>
        <Text>No data available. Please make sure you're authenticated and have selected a valid organization.</Text>
      </Box>
    );
  }

  const engagementData = transformDataForCharts(orgData, 'userEngagement');
  const acceptanceData = transformDataForCharts(orgData, 'acceptanceRate');
  
  return (
    <Box>
      <Heading size="lg" mb={6}>User Engagement Report</Heading>
      <Text mb={6}>This report shows how widely Copilot is being adopted and how actively developers are using it across your organization.</Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <StatCard 
          title="Total Active Users" 
          value={formatNumber(metrics.totalActiveUsers)}
          helpText={`Over the last ${dateRange}`}
        />
        <StatCard 
          title="Daily Active Users" 
          value={formatNumber(metrics.dailyActiveUsers)}
          helpText="Average per day"
        />
        <StatCard 
          title="Acceptance Rate" 
          value={formatPercentage(metrics.acceptanceRate)}
          helpText="Suggestions accepted vs. delivered"
        />
        <StatCard 
          title="Total Suggestions" 
          value={formatNumber(metrics.totalSuggestions)}
          helpText={`Over the last ${dateRange}`}
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        <GridItem>
          <ChartCard 
            title="Usage Metrics" 
            description="Overview of active users and suggestions"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Legend />
                <Bar dataKey="value" fill={CHART_COLORS.primary} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>
        
        <GridItem>
          <ChartCard 
            title="Suggestion Acceptance Rate" 
            description="Ratio of accepted to rejected suggestions"
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
                    <Cell key={`cell-${index}`} fill={index === 0 ? CHART_COLORS.primary : CHART_COLORS.quaternary} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(value)} />
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
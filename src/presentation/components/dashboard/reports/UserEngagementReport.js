/**
 * UserEngagementReport.js
 * Report component for user engagement metrics
 */

import React from 'react';
import { 
  Box, 
  Grid, 
  GridItem, 
  Text,
  Heading,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Divider,
  Spinner,
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
import StatCard from '../../common/StatCard';
import ChartCard from '../../common/ChartCard';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { useReporting } from '../../../contexts/ReportingContext';
// Updated import path
import { CHART_COLORS } from '../../../../config/constants';
import { formatNumber, formatPercentage } from '../../../../utils/formatUtils';

const UserEngagementReport = () => {
  // Component implementation remains the same
  // ...
  const reportId = 'userEngagement';
  
  // Get analytics data from context
  const { isLoading, error, getMetricsForReport, updateReportDateRange } = useAnalytics();
  
  // Get report configuration from context
  const { reportConfigs, updateReportConfig } = useConfig();
  
  // Get reporting service from context
  const { reportingService } = useReporting();
  
  // Get metrics for this report
  const metrics = getMetricsForReport(reportId);
  
  // Get report configuration
  const reportConfig = reportConfigs[reportId] || { dateRange: '28 days' };
  
  // Generate report data using reporting service
  const reportData = metrics ? reportingService.generateUserEngagementReport(metrics) : null;
  
  // Handle date range change
  const handleDateRangeChange = async (newDateRange) => {
    // Update report configuration
    updateReportConfig(reportId, { dateRange: newDateRange });
    
    // Fetch new data with updated date range
    await updateReportDateRange(reportId, newDateRange);
  };
  
  // Display loading state
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="400px" direction="column" gap={4}>
        <Spinner size="xl" thickness="4px" color="blue.500" />
        <Text>Loading user engagement data...</Text>
      </Flex>
    );
  }
  
  // Display error state
  if (error) {
    return (
      <Box p={4} bg="red.50" color="red.500" borderRadius="md">
        <Heading size="md">Error Loading Data</Heading>
        <Text>{error}</Text>
      </Box>
    );
  }
  
  // Display empty state
  if (!metrics || !reportData?.summary) {
    return (
      <Box p={4}>
        <Text>No data available. Please make sure you're authenticated and have selected a valid organization and team.</Text>
      </Box>
    );
  }
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Destructure report data
  const { summary, charts, tables, insights } = reportData;
  
  return (
    <Box>
      <Flex 
        direction={{ base: "column", md: "row" }}
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        mb={6}
        gap={4}
      >
        <Heading size="lg" color={useColorModeValue('blue.600', 'blue.300')}>
          User Engagement Report
        </Heading>
        
        <Box>
          <Badge 
            colorScheme="blue" 
            fontSize="sm" 
            px={3} 
            py={1} 
            borderRadius="full"
            boxShadow="sm"
            fontWeight="medium"
          >
            {reportConfig.dateRange}
          </Badge>
        </Box>
      </Flex>
      
      <Text mb={6}>
        This report shows how actively developers are using Copilot across your organization.
      </Text>
      
      {/* Summary metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <StatCard 
          title="Avg Daily Active Users" 
          value={formatNumber(summary.avgDailyActiveUsers || 0)}
          helpText="Average users receiving suggestions per day"
          accentColor="blue.400"
          bg={cardBg}
          borderColor={borderColor}
          timeFrame={reportConfig.dateRange}
        />
        <StatCard 
          title="Avg Daily Engaged Users" 
          value={formatNumber(summary.avgDailyEngagedUsers || 0)}
          helpText="Average users interacting per day"
          accentColor="green.400"
          bg={cardBg}
          borderColor={borderColor}
        />
        <StatCard 
          title="Acceptance Rate" 
          value={formatPercentage(summary.acceptanceRate)}
          helpText="Suggestions accepted vs. delivered"
          accentColor="purple.400"
          bg={cardBg}
          borderColor={borderColor}
          timeFrame={reportConfig.dateRange}
        />
        <StatCard 
          title="Total Suggestions" 
          value={formatNumber(summary.totalSuggestions)}
          helpText="Number of code suggestions offered"
          accentColor="orange.400"
          bg={cardBg}
          borderColor={borderColor}
          timeFrame={reportConfig.dateRange}
        />
      </SimpleGrid>
      
      {/* Detailed analytics */}
      <Box mb={8}>
        <Heading size="md" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
          Detailed Engagement Analytics
        </Heading>
        
        <Tabs colorScheme="blue" variant="enclosed">
          <TabList>
            <Tab>What Features</Tab>
            <Tab>Where Used</Tab>
            <Tab>How Used</Tab>
          </TabList>
          
          <TabPanels>
            {/* What Features Tab */}
            <TabPanel>
              <Box mb={6}>
                <Text mb={4}>
                  Your team uses several Copilot features. Here's a breakdown of which features are most popular
                  and how many team members are engaging with each one.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <ChartCard 
                      title="Feature Usage" 
                      description="Users engaging with each Copilot feature"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="blue.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={charts.featureUsage} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                          <Bar dataKey="value" fill={CHART_COLORS.primary} name="Users" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </GridItem>
                  
                  <GridItem>
                    <Box p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
                      <Heading size="sm" mb={4}>Feature Usage Details (Avg Daily Users)</Heading>
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Feature</Th>
                            <Th isNumeric>Avg Users</Th>
                            <Th isNumeric>% of Avg Active</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {tables.featureDetails && Object.entries(tables.featureDetails).map(([feature, data], index) => (
                            <Tr key={index}>
                              <Td fontWeight="medium">{feature}</Td>
                              <Td isNumeric>{formatNumber(data.users || 0)}</Td>
                              <Td isNumeric>
                                {summary.avgDailyActiveUsers > 0 
                                  ? formatPercentage((data.users / summary.avgDailyActiveUsers) * 100)
                                  : '0%'}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                      
                      {tables.languageDetails && Object.keys(tables.languageDetails).length > 0 && (
                        <>
                          <Divider my={4} />
                          <Heading size="sm" mb={4}>Programming Languages Used (Avg Daily Users)</Heading>
                          <Text fontSize="sm" mb={3}>
                            Avg daily users per language (via code completions):
                          </Text>
                          <Table size="sm" variant="simple">
                            <Thead>
                              <Tr>
                                <Th>Language</Th>
                                <Th isNumeric>Avg Users</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {Object.entries(tables.languageDetails)
                                .sort(([, a], [, b]) => b.users - a.users) // Sort by users descending
                                .slice(0, 10) // Top 10 languages
                                .map(([language, data], index) => (
                                <Tr key={index}>
                                  <Td>{language}</Td>
                                  <Td isNumeric>{formatNumber(data.users || 0)}</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </>
                      )}
                    </Box>
                  </GridItem>
                </Grid>
              </Box>
            </TabPanel>
            
            {/* Where Used Tab */}
            <TabPanel>
              <Box mb={6}>
                <Text mb={4}>
                  Explore where your team members are using GitHub Copilot across different development environments.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <ChartCard 
                      title="Development Environments" 
                      description="Copilot usage across different editors and IDEs"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="green.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={charts.devEnvironments || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                          <Bar dataKey="value" fill={CHART_COLORS.secondary} name="Users" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </GridItem>
                  
                  <GridItem>
                    <Box p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
                      <Heading size="sm" mb={4}>Editor/IDE Usage Details</Heading>
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Editor/IDE</Th>
                            <Th isNumeric>Users</Th>
                            <Th isNumeric>Acceptance Rate</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {tables.editorDetails && Object.entries(tables.editorDetails).map(([editor, data], index) => (
                            <Tr key={index}>
                              <Td fontWeight="medium">{editor}</Td>
                              <Td isNumeric>{formatNumber(data.users || 0)}</Td>
                              <Td isNumeric>
                                {formatPercentage(data.acceptanceRate || 0)}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </GridItem>
                </Grid>
              </Box>
            </TabPanel>
            
            {/* How Used Tab */}
            <TabPanel>
              <Box mb={6}>
                <Text mb={4}>
                  Understand how your team interacts with GitHub Copilot and what types of suggestions are most valuable.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <ChartCard 
                      title="Suggestion Interactions" 
                      description="How users interact with Copilot suggestions"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="purple.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Accepted', value: summary.acceptedSuggestions },
                              { name: 'Rejected', value: summary.totalSuggestions - summary.acceptedSuggestions }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${formatPercentage(percent * 100)}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill={CHART_COLORS.primary} />
                            <Cell fill={CHART_COLORS.quaternary} />
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
                  
                  <GridItem>
                    <Box p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
                      <Heading size="sm" mb={4}>Interaction Metrics</Heading>
                      <Grid templateColumns="1fr 1fr" gap={4}>
                        <Box p={4} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                          <Text color="gray.500" fontSize="sm">Total Suggestions</Text>
                          <Text fontSize="2xl" fontWeight="bold">{formatNumber(summary.totalSuggestions)}</Text>
                        </Box>
                        <Box p={4} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                          <Text color="gray.500" fontSize="sm">Accepted Suggestions</Text>
                          <Text fontSize="2xl" fontWeight="bold">{formatNumber(summary.acceptedSuggestions)}</Text>
                        </Box>
                        <Box p={4} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                          <Text color="gray.500" fontSize="sm">Acceptance Rate</Text>
                          <Text fontSize="2xl" fontWeight="bold">{formatPercentage(summary.acceptanceRate)}</Text>
                        </Box>
                        <Box p={4} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                          <Text color="gray.500" fontSize="sm">Avg Suggestions/User</Text>
                          <Text fontSize="2xl" fontWeight="bold">
                            {summary.avgDailyActiveUsers > 0 
                              ? formatNumber(Math.round(summary.totalSuggestions / summary.avgDailyActiveUsers))
                              : '0'}
                          </Text>
                        </Box>
                      </Grid>
                    </Box>
                  </GridItem>
                </Grid>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      
      {/* Charts */}
      <Grid 
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }} 
        gap={6}
      >
        <GridItem>
          <ChartCard 
            title="User Engagement Summary" 
            description="Overview of active users across your organization"
            bg={cardBg}
            borderColor={borderColor}
            timeFrame={reportConfig.dateRange}
            accentColor="blue.400"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.userEngagement} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                <Bar dataKey="value" fill={CHART_COLORS.primary} name="Users" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>
        
        <GridItem>
          <ChartCard 
            title="Acceptance Rate" 
            description="Suggestions accepted vs. delivered"
            bg={cardBg}
            borderColor={borderColor}
            timeFrame={reportConfig.dateRange}
            accentColor="purple.400"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.acceptanceRate}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${formatPercentage(percent * 100)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {charts.acceptanceRate.map((entry, index) => (
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
      
      {/* Trends chart section */}
      {charts.trends && charts.trends.length > 0 && (
        <Box mt={8}>
          <Heading size="md" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
            Usage Trends ({reportConfig.dateRange})
          </Heading>
          
          <ChartCard 
            title="Daily User Activity" 
            description="Active and engaged users over time"
            infoTooltip="This chart shows daily trends in Copilot usage over the selected period. Active users are those who received suggestions, while engaged users are those who accepted suggestions."
            bg={cardBg}
            borderColor={borderColor}
            accentColor="blue.400"
            height="350px"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={charts.trends} 
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth()+1}/${d.getDate()}`;
                  }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatNumber(value)}
                  labelFormatter={(date) => {
                    const d = new Date(date);
                    return d.toLocaleDateString();
                  }}
                  contentStyle={{
                    backgroundColor: cardBg,
                    borderColor: borderColor,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="activeUsers" 
                  name="Active Users" 
                  stroke={CHART_COLORS.primary} 
                  fill={CHART_COLORS.primary} 
                  fillOpacity={0.3} 
                />
                <Area 
                  type="monotone" 
                  dataKey="engagedUsers" 
                  name="Engaged Users" 
                  stroke={CHART_COLORS.secondary} 
                  fill={CHART_COLORS.secondary} 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>
      )}
      
      {/* Insights section */}
      {insights && insights.length > 0 && (
        <Box mt={8} p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
          <Heading size="md" mb={4}>Insights</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {insights.map((insight, index) => (
              <Box 
                key={index} 
                p={4} 
                bg={useColorModeValue('blue.50', 'blue.900')} 
                borderRadius="md"
              >
                <Heading size="sm" mb={2}>{insight.title}</Heading>
                <Text fontSize="sm">{insight.description}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
};

export default UserEngagementReport;
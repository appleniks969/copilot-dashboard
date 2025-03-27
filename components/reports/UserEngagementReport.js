import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Box, 
  Grid, 
  GridItem, 
  Text,
  Heading,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Spacer,
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
import StatCard from '../StatCard';
import ChartCard from '../ChartCard';
import DateRangeFilter from '../DateRangeFilter';
import { useCopilot } from '../../lib/CopilotContext';
import { CHART_COLORS, DATE_RANGES } from '../../lib/config';
import { formatNumber, formatPercentage, transformDataForCharts } from '../../lib/utils';

// Breaking down the extractEngagementData function into smaller helper functions
// This improves code organization and testability

// Process "What" feature data (IDE Completions, Chat, PR summaries)
const processWhatData = (rawData, processedDays) => {
  const aggregated = {
    ide_completions: { name: 'IDE Completions', users: 0, details: {} },
    ide_chat: { name: 'IDE Chat', users: 0, details: {} },
    dotcom_chat: { name: 'GitHub.com Chat', users: 0, details: {} },
    pull_requests: { name: 'Pull Request Summaries', users: 0, details: {} }
  };
  
  // Aggregate data across all days
  rawData.forEach(dayData => {
    if (!dayData) return;
    
    aggregated.ide_completions.users += dayData.copilot_ide_code_completions?.total_engaged_users || 0;
    aggregated.ide_chat.users += dayData.copilot_ide_chat?.total_engaged_users || 0;
    aggregated.dotcom_chat.users += dayData.copilot_dotcom_chat?.total_engaged_users || 0;
    aggregated.pull_requests.users += dayData.copilot_dotcom_pull_requests?.total_engaged_users || 0;
  });
  
  // Average by number of days
  Object.keys(aggregated).forEach(key => {
    aggregated[key].users = Math.round(aggregated[key].users / processedDays);
  });
  
  return aggregated;
};

// Process "Where" data (Editors, Repositories)
const processWhereData = (rawData, processedDays) => {
  const aggregated = {
    editors: {}, 
    repositories: {} 
  };
  
  // Aggregate data across all days
  rawData.forEach(dayData => {
    if (!dayData) return;
    
    // Editors
    if (dayData.copilot_ide_code_completions?.editors) {
      dayData.copilot_ide_code_completions.editors.forEach(editor => {
        if (!aggregated.editors[editor.name]) {
          aggregated.editors[editor.name] = { name: editor.name, users: 0, details: { models: [] } };
        }
        aggregated.editors[editor.name].users += editor.total_engaged_users || 0;
      });
    }
    
    // Repositories
    if (dayData.copilot_dotcom_pull_requests?.repositories) {
      dayData.copilot_dotcom_pull_requests.repositories.forEach(repo => {
        if (!aggregated.repositories[repo.name]) {
          aggregated.repositories[repo.name] = { name: repo.name, users: 0, details: { total_pr_summaries: 0 } };
        }
        aggregated.repositories[repo.name].users += repo.total_engaged_users || 0;
        // Aggregate PR summaries count
        aggregated.repositories[repo.name].details.total_pr_summaries += 
          repo.models?.reduce((sum, model) => sum + (model.total_pr_summaries_created || 0), 0) || 0;
      });
    }
  });
  
  // Average by number of days
  Object.keys(aggregated.editors).forEach(key => {
    aggregated.editors[key].users = Math.round(aggregated.editors[key].users / processedDays);
  });
  Object.keys(aggregated.repositories).forEach(key => {
    aggregated.repositories[key].users = Math.round(aggregated.repositories[key].users / processedDays);
  });
  
  // Convert objects to arrays for easier use in charts/tables
  aggregated.editors = Object.values(aggregated.editors);
  aggregated.repositories = Object.values(aggregated.repositories);
  
  return aggregated;
};

// Process "How" data (Interactions, Languages, Editors details)
const processHowData = (rawData, processedDays) => {
  const aggregated = {
    interactions: {
      chat_insertions: 0,
      chat_copies: 0,
      total_chats: 0
    },
    languages_summary: {},
    editors_summary: {}
  };
  
  // Aggregate data across all days
  rawData.forEach(dayData => {
    if (!dayData) return;
    
    // Chat Interactions
    if (dayData.copilot_ide_chat?.editors) {
      dayData.copilot_ide_chat.editors.forEach(editor => {
        if (editor.models) {
          editor.models.forEach(model => {
            aggregated.interactions.chat_insertions += model.total_chat_insertion_events || 0;
            aggregated.interactions.chat_copies += model.total_chat_copy_events || 0;
            aggregated.interactions.total_chats += model.total_chats || 0;
          });
        }
      });
    }
    
    // Languages
    if (dayData.copilot_ide_code_completions?.languages) {
      dayData.copilot_ide_code_completions.languages.forEach(lang => {
        if (!aggregated.languages_summary[lang.name]) {
          aggregated.languages_summary[lang.name] = { name: lang.name, users: 0 };
        }
        aggregated.languages_summary[lang.name].users += lang.total_engaged_users || 0;
      });
    }
    
    // Editors details
    if (dayData.copilot_ide_code_completions?.editors) {
      dayData.copilot_ide_code_completions.editors.forEach(editor => {
        if (!aggregated.editors_summary[editor.name]) {
          aggregated.editors_summary[editor.name] = { name: editor.name, users: 0 };
        }
        aggregated.editors_summary[editor.name].users += editor.total_engaged_users || 0;
      });
    }
  });
  
  // Average by number of days - only needed for user counts
  Object.keys(aggregated.languages_summary).forEach(key => {
    aggregated.languages_summary[key].users = Math.round(aggregated.languages_summary[key].users / processedDays);
  });
  Object.keys(aggregated.editors_summary).forEach(key => {
    aggregated.editors_summary[key].users = Math.round(aggregated.editors_summary[key].users / processedDays);
  });
  
  // Convert objects to arrays for easier use in charts/tables
  aggregated.languages_summary = Object.values(aggregated.languages_summary);
  aggregated.editors_summary = Object.values(aggregated.editors_summary);
  
  return aggregated;
};

// Process trend data to show changes over time
const processTrendData = (rawData) => {
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    return [];
  }
  
  // Create daily trend data points
  return rawData.map(dayData => {
    if (!dayData || !dayData.date) return null;
    
    return {
      date: dayData.date,
      activeUsers: dayData.copilot_ide_code_completions?.total_active_users || 0,
      engagedUsers: dayData.copilot_ide_code_completions?.total_engaged_users || 0,
      totalSuggestions: dayData.copilot_ide_code_completions?.total_suggestions || 0,
      acceptedSuggestions: dayData.copilot_ide_code_completions?.total_acceptances || 0,
      acceptanceRate: dayData.copilot_ide_code_completions?.total_suggestions > 0
        ? (dayData.copilot_ide_code_completions.total_acceptances / dayData.copilot_ide_code_completions.total_suggestions) * 100
        : 0
    };
  }).filter(Boolean);
};

const UserEngagementReport = () => {
  // Use report-specific date range
  const { 
    dateRanges, 
    updateReportDateRange, 
    getMetricsForReport, 
    isLoading 
  } = useCopilot();
  
  const reportId = 'userEngagement';
  const [reportDateRange, setReportDateRange] = useState(dateRanges[reportId] || DATE_RANGES.LAST_28_DAYS);
  
  // Get metrics specific to this report's date range
  const metrics = getMetricsForReport(reportId);
  
  // We're always using the 28-day range, so we only need to load data once on initial render
  useEffect(() => {
    // Make sure we have current data loaded
    if (!dateRanges[reportId]) {
      updateReportDateRange(reportId, DATE_RANGES.LAST_28_DAYS);
    }
  }, [reportId, dateRanges, updateReportDateRange]);
  
  // Display loading state
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="400px" direction="column" gap={4}>
        <Spinner size="xl" thickness="4px" color="blue.500" />
        <Text>Loading user engagement data...</Text>
      </Flex>
    );
  }
  
  if (!metrics) {
    return (
      <Box p={4}>
        <Text>No data available. Please make sure you're authenticated and have selected a valid organization and team.</Text>
      </Box>
    );
  }
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Extract and aggregate engagement data from raw API data across all days
  const extractEngagementData = () => {
    // Use rawData and processedDays passed from getMetricsForReport
    const { rawData, processedDays } = metrics; 
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0 || !processedDays || processedDays === 0) {
      console.log("Raw data missing or invalid for engagement extraction", { rawData, processedDays });
      return null;
    }

    return {
      what: processWhatData(rawData, processedDays),
      where: processWhereData(rawData, processedDays),
      how: processHowData(rawData, processedDays),
      trends: processTrendData(rawData)
    };
  };
  
  // Use useMemo to avoid recalculating on every render
  const engagementData = useMemo(() => extractEngagementData(), [metrics]);
  
  // Create data for "What" chart
  const whatData = engagementData ? [
    { name: 'IDE Completions', value: engagementData.what.ide_completions.users || 0 },
    { name: 'IDE Chat', value: engagementData.what.ide_chat.users || 0 },
    { name: 'GitHub.com Chat', value: engagementData.what.dotcom_chat.users || 0 },
    { name: 'PR Summaries', value: engagementData.what.pull_requests.users || 0 },
  ] : [];
  
  // Create data for "Where" chart
  const whereData = engagementData ? [
    ...engagementData.where.editors.map(editor => ({
      name: editor.name,
      value: editor.users || 0,
      category: 'Editor'
    })),
    ...engagementData.where.repositories.map(repo => ({
      name: repo.name,
      value: repo.users || 0,
      category: 'Repository'
    }))
  ].sort((a, b) => b.value - a.value) : [];

  // Create data for user engagement chart using renamed metrics
  const userEngagementData = [
    { name: 'Avg Daily Active', value: metrics.avgDailyActiveUsers || 0 },
    { name: 'Avg Daily Engaged', value: metrics.avgDailyEngagedUsers || 0 },
  ];

  // Create data for acceptance rate pie chart
  const acceptanceData = [
    { name: 'Accepted', value: metrics.acceptedSuggestions || 0 },
    { name: 'Not Accepted', value: (metrics.totalSuggestions || 0) - (metrics.acceptedSuggestions || 0) },
  ];
  
  // Update featureUsageData to use whatData
  const featureUsageData = whatData;
  
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
            All Available Data (28 Days)
          </Badge>
        </Box>
      </Flex>
      
      <Text mb={6}>
        This report shows how actively developers are using Copilot across your organization.
        {isLoading && " Loading..."}
      </Text>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <StatCard 
          title="Avg Daily Active Users" 
          value={formatNumber(metrics.avgDailyActiveUsers || 0)}
          helpText="Average users receiving suggestions per day"
          accentColor="blue.400"
          bg={cardBg}
          borderColor={borderColor}
          timeFrame={reportDateRange}
        />
        <StatCard 
          title="Avg Daily Engaged Users" 
          value={formatNumber(metrics.avgDailyEngagedUsers || 0)}
          helpText="Average users interacting per day"
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
          timeFrame={reportDateRange}
        />
        <StatCard 
          title="Total Suggestions" 
          value={formatNumber(metrics.totalSuggestions)}
          helpText="Number of code suggestions offered"
          accentColor="orange.400"
          bg={cardBg}
          borderColor={borderColor}
          timeFrame={reportDateRange}
        />
      </SimpleGrid>
      
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
            {/* WHAT FEATURES TAB */}
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
                        <BarChart data={featureUsageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                          {/* Use aggregated engagementData */}
                          {engagementData && Object.values(engagementData.what).map((feature, index) => (
                            <Tr key={index}>
                              <Td fontWeight="medium">{feature.name}</Td>
                              <Td isNumeric>{formatNumber(feature.users)}</Td>
                              <Td isNumeric>
                                {/* Calculate percentage based on avgDailyActiveUsers */}
                                {metrics.avgDailyActiveUsers > 0 
                                  ? formatPercentage((feature.users / metrics.avgDailyActiveUsers) * 100)
                                  : '0%'}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                      
                      {/* Update Language Table */}
                      {engagementData && engagementData.how.languages_summary.length > 0 && (
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
                              {/* Use aggregated language data */}
                              {engagementData.how.languages_summary
                                .sort((a, b) => b.users - a.users) // Sort by users
                                .map((lang, index) => (
                                <Tr key={index}>
                                  <Td>{lang.name}</Td>
                                  <Td isNumeric>{formatNumber(lang.users || 0)}</Td>
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
            
            {/* WHERE USED TAB */}
            <TabPanel>
              <Box mb={6}>
                <Text mb={4}>
                  Copilot is used across different development environments. This breakdown shows where your 
                  team members are leveraging Copilot in their daily workflows.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <ChartCard 
                      title="Development Environments" 
                      description="Where your team uses Copilot"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="green.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={whereData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                          <Bar dataKey="value" fill={CHART_COLORS.tertiary} name="Users" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </GridItem>
                  
                  <GridItem>
                    <Box p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
                      <Heading size="sm" mb={4}>IDE Usage (Avg Daily Users)</Heading>
                      <Text fontSize="sm" mb={3}>
                        Avg daily users per code editor:
                      </Text>
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Editor</Th>
                            <Th isNumeric>Avg Users</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {/* Use aggregated editor data */}
                          {engagementData && engagementData.where.editors
                            .sort((a, b) => b.users - a.users) // Sort by users
                            .map((editor, index) => (
                            <Tr key={index}>
                              <Td fontWeight="medium">{editor.name}</Td>
                              <Td isNumeric>{formatNumber(editor.users)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                      
                      {engagementData && engagementData.where.repositories.length > 0 && (
                        <>
                          <Divider my={4} />
                          <Heading size="sm" mb={4}>Repository Usage (Avg Daily Users)</Heading>
                          <Text fontSize="sm" mb={3}>
                            Avg daily users per repository (via PR summaries):
                          </Text>
                          <Table size="sm" variant="simple">
                            <Thead>
                              <Tr>
                                <Th>Repository</Th>
                                <Th isNumeric>Avg Users</Th>
                                <Th isNumeric>Total PR Summaries</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {/* Use aggregated repo data */}
                              {engagementData.where.repositories
                                .sort((a, b) => b.users - a.users) // Sort
                                .map((repo, index) => (
                                <Tr key={index}>
                                  <Td>{repo.name}</Td>
                                  <Td isNumeric>{formatNumber(repo.users)}</Td>
                                  <Td isNumeric>
                                    {/* Use aggregated total */}
                                    {formatNumber(repo.details.total_pr_summaries || 0)}
                                  </Td>
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
            
            {/* HOW USED TAB */}
            <TabPanel>
              <Box mb={6}>
                <Text mb={4}>
                  Here's how your team interacts with Copilot. These metrics show you the effectiveness 
                  of your Copilot usage and highlight opportunities for improvement.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <ChartCard 
                      title="Suggestion Acceptance Rate" 
                      description="How often Copilot suggestions are accepted"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="purple.400"
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
                  
                  <GridItem>
                    <Box p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
                      <Heading size="sm" mb={4}>Usage Statistics</Heading>
                      
                      <SimpleGrid columns={1} spacing={4}>
                        <Box>
                          <Text fontWeight="medium" fontSize="sm" color="gray.500">Code Completions</Text>
                          <Text fontSize="sm" mb={2}>
                            How your team is using inline code suggestions:
                          </Text>
                          <Table size="sm" variant="simple">
                            <Tbody>
                              <Tr>
                                <Td>Total Suggestions</Td>
                                <Td isNumeric>{formatNumber(metrics.totalSuggestions)}</Td>
                              </Tr>
                              <Tr>
                                <Td>Accepted Suggestions</Td>
                                <Td isNumeric>{formatNumber(metrics.acceptedSuggestions)}</Td>
                              </Tr>
                              <Tr>
                                <Td>Acceptance Rate</Td>
                                <Td isNumeric>{formatPercentage(metrics.acceptanceRate)}</Td>
                              </Tr>
                              <Tr>
                                <Td>Lines of Code Accepted</Td>
                                <Td isNumeric>{formatNumber(metrics.acceptedLines || 0)}</Td>
                              </Tr>
                            </Tbody>
                          </Table>
                        </Box>
                        
                        {engagementData && engagementData.how.interactions && (
                          <Box>
                            <Text fontWeight="medium" fontSize="sm" color="gray.500">Chat Interactions (Totals)</Text>
                            <Text fontSize="sm" mb={2}>
                              Totals over the selected period:
                            </Text>
                            <Table size="sm" variant="simple">
                              <Tbody>
                                <Tr>
                                  <Td>Total Chat Sessions</Td>
                                  <Td isNumeric>{formatNumber(engagementData.how.interactions.total_chats || 0)}</Td>
                                </Tr>
                                <Tr>
                                  <Td>Code Insertions from Chat</Td>
                                  <Td isNumeric>{formatNumber(engagementData.how.interactions.chat_insertions || 0)}</Td>
                                </Tr>
                                <Tr>
                                  <Td>Code Copied from Chat</Td>
                                  <Td isNumeric>{formatNumber(engagementData.how.interactions.chat_copies || 0)}</Td>
                                </Tr>
                              </Tbody>
                            </Table>
                          </Box>
                        )}
                      </SimpleGrid>
                    </Box>
                  </GridItem>
                </Grid>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      
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
            timeFrame={reportDateRange}
            accentColor="blue.400"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userEngagementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            title="Feature Usage Overview" 
            description="Which Copilot features are being used most"
            bg={cardBg}
            borderColor={borderColor}
            timeFrame={reportDateRange}
            accentColor="green.400"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureUsageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                <Bar dataKey="value" fill={CHART_COLORS.tertiary} name="Users" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>
      </Grid>
      
      {/* New Trend Chart Section */}
      {engagementData && engagementData.trends && engagementData.trends.length > 0 && (
        <Box mt={8}>
          <Heading size="md" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
            Usage Trends (28-day Period)
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
                data={engagementData.trends} 
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
          
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mt={6}>
            <GridItem>
              <ChartCard 
                title="Daily Suggestions" 
                description="Offered and accepted suggestions over time"
                infoTooltip="This chart shows the daily volume of suggestions offered by Copilot and how many were accepted by users."
                bg={cardBg}
                borderColor={borderColor}
                accentColor="purple.400"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={engagementData.trends} 
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
                      dataKey="totalSuggestions" 
                      name="Total Suggestions" 
                      stroke={CHART_COLORS.tertiary} 
                      fill={CHART_COLORS.tertiary} 
                      fillOpacity={0.3} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="acceptedSuggestions" 
                      name="Accepted Suggestions" 
                      stroke={CHART_COLORS.primary} 
                      fill={CHART_COLORS.primary} 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </GridItem>
            
            <GridItem>
              <ChartCard 
                title="Daily Acceptance Rate" 
                description="Percentage of suggestions accepted over time"
                infoTooltip="This chart shows how the acceptance rate of Copilot suggestions varies day by day. Higher values indicate days when Copilot's suggestions were more frequently accepted by developers."
                bg={cardBg}
                borderColor={borderColor}
                accentColor="green.400"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={engagementData.trends} 
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
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      formatter={(value) => `${value.toFixed(2)}%`}
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
                      dataKey="acceptanceRate" 
                      name="Acceptance Rate" 
                      stroke={CHART_COLORS.secondary} 
                      fill={CHART_COLORS.secondary} 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </GridItem>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default UserEngagementReport;
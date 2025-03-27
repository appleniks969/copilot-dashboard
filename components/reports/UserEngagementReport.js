import React, { useState, useEffect, useRef } from 'react';
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

    // Initialize aggregated data structures
    const aggregated = {
      what: {
        ide_completions: { name: 'IDE Completions', users: 0, details: {} },
        ide_chat: { name: 'IDE Chat', users: 0, details: {} },
        dotcom_chat: { name: 'GitHub.com Chat', users: 0, details: {} },
        pull_requests: { name: 'Pull Request Summaries', users: 0, details: {} }
      },
      where: {
        editors: {}, // Store aggregated editor data { name: { users: 0, details: {} } }
        repositories: {} // Store aggregated repo data { name: { users: 0, details: {} } }
      },
      how: {
        interactions: {
          chat_insertions: 0,
          chat_copies: 0,
          total_chats: 0
        },
        // Aggregate language/editor details for 'how' section if needed later
        languages_summary: {}, 
        editors_summary: {}
      }
    };

    // Iterate through each day's data
    rawData.forEach(dayData => {
      if (!dayData) return; // Skip null/undefined days

      // --- Aggregate "What" Data (Feature Usage - Users) ---
      aggregated.what.ide_completions.users += dayData.copilot_ide_code_completions?.total_engaged_users || 0;
      aggregated.what.ide_chat.users += dayData.copilot_ide_chat?.total_engaged_users || 0;
      aggregated.what.dotcom_chat.users += dayData.copilot_dotcom_chat?.total_engaged_users || 0;
      aggregated.what.pull_requests.users += dayData.copilot_dotcom_pull_requests?.total_engaged_users || 0;

      // --- Aggregate "Where" Data (Editors & Repos - Users) ---
      // Editors
      if (dayData.copilot_ide_code_completions?.editors) {
        dayData.copilot_ide_code_completions.editors.forEach(editor => {
          if (!aggregated.where.editors[editor.name]) {
            aggregated.where.editors[editor.name] = { name: editor.name, users: 0, details: { models: [] } }; // Initialize
          }
          aggregated.where.editors[editor.name].users += editor.total_engaged_users || 0;
          // Note: Aggregating 'details' like models might be complex, focusing on user count for now.
        });
      }
      // Repositories (from PR summaries)
      if (dayData.copilot_dotcom_pull_requests?.repositories) {
        dayData.copilot_dotcom_pull_requests.repositories.forEach(repo => {
           if (!aggregated.where.repositories[repo.name]) {
             aggregated.where.repositories[repo.name] = { name: repo.name, users: 0, details: { total_pr_summaries: 0 } }; // Initialize
           }
           aggregated.where.repositories[repo.name].users += repo.total_engaged_users || 0;
           // Aggregate PR summaries count
           aggregated.where.repositories[repo.name].details.total_pr_summaries += 
             repo.models?.reduce((sum, model) => sum + (model.total_pr_summaries_created || 0), 0) || 0;
        });
      }

      // --- Aggregate "How" Data (Interactions) ---
      // Chat Interactions
      if (dayData.copilot_ide_chat?.editors) {
        dayData.copilot_ide_chat.editors.forEach(editor => {
          if (editor.models) {
            editor.models.forEach(model => {
              aggregated.how.interactions.chat_insertions += model.total_chat_insertion_events || 0;
              aggregated.how.interactions.chat_copies += model.total_chat_copy_events || 0;
              aggregated.how.interactions.total_chats += model.total_chats || 0;
            });
          }
        });
      }
      
      // --- Aggregate Language/Editor details for potential use in "How" ---
      // (Similar logic to processMetricsData but storing here if needed for detailed views)
      // Example for languages:
      if (dayData.copilot_ide_code_completions?.languages) {
         dayData.copilot_ide_code_completions.languages.forEach(lang => {
             if (!aggregated.how.languages_summary[lang.name]) {
                 aggregated.how.languages_summary[lang.name] = { name: lang.name, users: 0 };
             }
             aggregated.how.languages_summary[lang.name].users += lang.total_engaged_users || 0;
         });
      }
       // Example for editors (can add more detail like suggestions/acceptances if needed):
       if (dayData.copilot_ide_code_completions?.editors) {
         dayData.copilot_ide_code_completions.editors.forEach(editor => {
             if (!aggregated.how.editors_summary[editor.name]) {
                 aggregated.how.editors_summary[editor.name] = { name: editor.name, users: 0 };
             }
             aggregated.how.editors_summary[editor.name].users += editor.total_engaged_users || 0;
         });
      }

    });

    // --- Average User Counts by processedDays ---
    Object.keys(aggregated.what).forEach(key => {
      aggregated.what[key].users = Math.round(aggregated.what[key].users / processedDays);
    });
    Object.keys(aggregated.where.editors).forEach(key => {
      aggregated.where.editors[key].users = Math.round(aggregated.where.editors[key].users / processedDays);
    });
    Object.keys(aggregated.where.repositories).forEach(key => {
      aggregated.where.repositories[key].users = Math.round(aggregated.where.repositories[key].users / processedDays);
    });
     Object.keys(aggregated.how.languages_summary).forEach(key => {
      aggregated.how.languages_summary[key].users = Math.round(aggregated.how.languages_summary[key].users / processedDays);
    });
     Object.keys(aggregated.how.editors_summary).forEach(key => {
      aggregated.how.editors_summary[key].users = Math.round(aggregated.how.editors_summary[key].users / processedDays);
    });

    // Convert aggregated objects to arrays for easier use in charts/tables
    aggregated.where.editors = Object.values(aggregated.where.editors);
    aggregated.where.repositories = Object.values(aggregated.where.repositories);
    aggregated.how.languages_summary = Object.values(aggregated.how.languages_summary);
    aggregated.how.editors_summary = Object.values(aggregated.how.editors_summary);

    console.log("Aggregated Engagement Data:", aggregated);
    return aggregated;
  };
  
  const engagementData = extractEngagementData();
  
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
    // Removed the incorrect 'Daily Active' bar
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
    </Box>
  );
};

export default UserEngagementReport;
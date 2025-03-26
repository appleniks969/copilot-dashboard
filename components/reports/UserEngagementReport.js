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
  
  // Create data for user engagement chart
  const userEngagementData = [
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
  
  // Extract engagement data from raw API data
  const extractEngagementData = () => {
    const { rawData } = metrics;
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return null;
    }

    // Use the first day's data as sample
    const dayData = rawData[0];
    
    // Define engagement categories
    const engagementTypes = {
      what: {
        ide_completions: {
          name: 'IDE Completions',
          users: dayData.copilot_ide_code_completions?.total_engaged_users || 0,
          details: dayData.copilot_ide_code_completions || {}
        },
        ide_chat: {
          name: 'IDE Chat',
          users: dayData.copilot_ide_chat?.total_engaged_users || 0,
          details: dayData.copilot_ide_chat || {}
        },
        dotcom_chat: {
          name: 'GitHub.com Chat',
          users: dayData.copilot_dotcom_chat?.total_engaged_users || 0,
          details: dayData.copilot_dotcom_chat || {}
        },
        pull_requests: {
          name: 'Pull Request Summaries',
          users: dayData.copilot_dotcom_pull_requests?.total_engaged_users || 0,
          details: dayData.copilot_dotcom_pull_requests || {}
        }
      },
      where: {
        editors: {},
        repositories: {}
      },
      how: {
        acceptances: {},
        interactions: {}
      }
    };
    
    // Extract "where" data - editors
    if (dayData.copilot_ide_code_completions?.editors) {
      dayData.copilot_ide_code_completions.editors.forEach(editor => {
        engagementTypes.where.editors[editor.name] = {
          name: editor.name,
          users: editor.total_engaged_users || 0,
          details: editor
        };
      });
    }
    
    // Extract "where" data - repositories
    if (dayData.copilot_dotcom_pull_requests?.repositories) {
      dayData.copilot_dotcom_pull_requests.repositories.forEach(repo => {
        engagementTypes.where.repositories[repo.name] = {
          name: repo.name,
          users: repo.total_engaged_users || 0,
          details: repo
        };
      });
    }
    
    // Extract "how" data - interactions
    if (dayData.copilot_ide_chat) {
      let chatInsertions = 0;
      let chatCopies = 0;
      
      if (dayData.copilot_ide_chat.editors) {
        dayData.copilot_ide_chat.editors.forEach(editor => {
          if (editor.models) {
            editor.models.forEach(model => {
              chatInsertions += model.total_chat_insertion_events || 0;
              chatCopies += model.total_chat_copy_events || 0;
            });
          }
        });
      }
      
      engagementTypes.how.interactions = {
        chat_insertions: chatInsertions,
        chat_copies: chatCopies,
        total_chats: dayData.copilot_ide_chat.editors?.reduce((sum, editor) => {
          return sum + editor.models?.reduce((modelSum, model) => {
            return modelSum + (model.total_chats || 0);
          }, 0) || 0;
        }, 0) || 0
      };
    }
    
    return engagementTypes;
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
    ...Object.values(engagementData.where.editors).map(editor => ({
      name: editor.name,
      value: editor.users || 0,
      category: 'Editor'
    })),
    ...Object.values(engagementData.where.repositories).map(repo => ({
      name: repo.name,
      value: repo.users || 0,
      category: 'Repository'
    }))
  ] : [];
  
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
          title="Total Active Users" 
          value={formatNumber(metrics.totalActiveUsers)}
          helpText="Total users who received suggestions"
          accentColor="blue.400"
          bg={cardBg}
          borderColor={borderColor}
          timeFrame={reportDateRange}
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
                  This shows which Copilot features your team is using, including code completions, 
                  chat, and pull request summaries.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <ChartCard 
                      title="Feature Usage by Users" 
                      description="Number of users engaged with each Copilot feature"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="blue.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={whatData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                          <Bar dataKey="value" fill={CHART_COLORS.primary} name="Engaged Users" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </GridItem>
                  
                  <GridItem>
                    <Box p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
                      <Heading size="sm" mb={4}>Feature Engagement Details</Heading>
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Feature</Th>
                            <Th isNumeric>Engaged Users</Th>
                            <Th isNumeric>% of Total</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {engagementData && Object.values(engagementData.what).map((feature, index) => (
                            <Tr key={index}>
                              <Td fontWeight="medium">{feature.name}</Td>
                              <Td isNumeric>{formatNumber(feature.users)}</Td>
                              <Td isNumeric>
                                {formatPercentage((feature.users / metrics.totalActiveUsers) * 100)}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                      
                      {engagementData && engagementData.what.ide_completions.details.languages && (
                        <>
                          <Divider my={4} />
                          <Heading size="sm" mb={4}>Top Languages</Heading>
                          <Table size="sm" variant="simple">
                            <Thead>
                              <Tr>
                                <Th>Language</Th>
                                <Th isNumeric>Engaged Users</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {engagementData.what.ide_completions.details.languages.map((lang, index) => (
                                <Tr key={index}>
                                  <Td>{lang.name}</Td>
                                  <Td isNumeric>{formatNumber(lang.total_engaged_users || 0)}</Td>
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
                  This shows where your team is using Copilot, including which editors and repositories.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <ChartCard 
                      title="Where Copilot is Used" 
                      description="Engagement across tools and repositories"
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
                          <Bar dataKey="value" fill={CHART_COLORS.tertiary} name="Engaged Users" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </GridItem>
                  
                  <GridItem>
                    <Box p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
                      <Heading size="sm" mb={4}>Editors</Heading>
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Editor</Th>
                            <Th isNumeric>Engaged Users</Th>
                            <Th isNumeric>Models</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {engagementData && Object.values(engagementData.where.editors).map((editor, index) => (
                            <Tr key={index}>
                              <Td fontWeight="medium">{editor.name}</Td>
                              <Td isNumeric>{formatNumber(editor.users)}</Td>
                              <Td isNumeric>{editor.details.models ? editor.details.models.length : 0}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                      
                      {engagementData && Object.keys(engagementData.where.repositories).length > 0 && (
                        <>
                          <Divider my={4} />
                          <Heading size="sm" mb={4}>Repositories</Heading>
                          <Table size="sm" variant="simple">
                            <Thead>
                              <Tr>
                                <Th>Repository</Th>
                                <Th isNumeric>Engaged Users</Th>
                                <Th isNumeric>PR Summaries</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {Object.values(engagementData.where.repositories).map((repo, index) => (
                                <Tr key={index}>
                                  <Td>{repo.name}</Td>
                                  <Td isNumeric>{formatNumber(repo.users)}</Td>
                                  <Td isNumeric>
                                    {repo.details.models?.reduce((sum, model) => 
                                      sum + (model.total_pr_summaries_created || 0), 0) || 0}
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
                  This shows how your team is using Copilot, including interaction patterns and efficiency metrics.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
                  <GridItem>
                    <ChartCard 
                      title="Suggestion Acceptance Rate" 
                      description="Ratio of accepted to rejected suggestions"
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
                      <Heading size="sm" mb={4}>How Teams Use Copilot</Heading>
                      
                      <SimpleGrid columns={1} spacing={4}>
                        <Box>
                          <Text fontWeight="medium" fontSize="sm" color="gray.500">Code Completions</Text>
                          <Table size="sm" variant="simple">
                            <Tbody>
                              <Tr>
                                <Td>Suggestions</Td>
                                <Td isNumeric>{formatNumber(metrics.totalSuggestions)}</Td>
                              </Tr>
                              <Tr>
                                <Td>Accepted</Td>
                                <Td isNumeric>{formatNumber(metrics.acceptedSuggestions)}</Td>
                              </Tr>
                              <Tr>
                                <Td>Acceptance Rate</Td>
                                <Td isNumeric>{formatPercentage(metrics.acceptanceRate)}</Td>
                              </Tr>
                              <Tr>
                                <Td>Lines Accepted</Td>
                                <Td isNumeric>{formatNumber(metrics.acceptedLines || 0)}</Td>
                              </Tr>
                            </Tbody>
                          </Table>
                        </Box>
                        
                        {engagementData && engagementData.how.interactions && (
                          <Box>
                            <Text fontWeight="medium" fontSize="sm" color="gray.500">Chat Interactions</Text>
                            <Table size="sm" variant="simple">
                              <Tbody>
                                <Tr>
                                  <Td>Total Chats</Td>
                                  <Td isNumeric>{formatNumber(engagementData.how.interactions.total_chats || 0)}</Td>
                                </Tr>
                                <Tr>
                                  <Td>Code Insertions</Td>
                                  <Td isNumeric>{formatNumber(engagementData.how.interactions.chat_insertions || 0)}</Td>
                                </Tr>
                                <Tr>
                                  <Td>Code Copies</Td>
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
            title="Usage Metrics" 
            description="Overview of active users and suggestions"
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
                <Bar dataKey="value" fill={CHART_COLORS.primary} name="Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default UserEngagementReport;
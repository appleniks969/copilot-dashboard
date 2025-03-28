/**
 * ProductivityReport.js
 * Fully implemented report component for productivity metrics
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
  Progress,
  Tooltip,
  HStack,
  Tag,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import StatCard from '../../common/StatCard';
import ChartCard from '../../common/ChartCard';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { useReporting } from '../../../contexts/ReportingContext';
import { CHART_COLORS } from '../../../../config/constants';
import { formatNumber, formatPercentage } from '../../../../utils/formatUtils';

const ProductivityReport = () => {
  const reportId = 'productivity';
  
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
  const reportData = metrics ? reportingService.generateProductivityReport(metrics) : null;
  
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
        <Text>Loading productivity data...</Text>
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
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  
  // Destructure report data
  const { summary, charts, tables, insights } = reportData;
  
  // Calculate additional metrics
  const avgAcceptedSuggestionsPerUser = metrics.avgDailyActiveUsers > 0 
    ? metrics.acceptedSuggestions / metrics.avgDailyActiveUsers 
    : 0;
    
  const avgAcceptedLinesPerUser = metrics.avgDailyActiveUsers > 0 
    ? metrics.acceptedLines / metrics.avgDailyActiveUsers 
    : 0;
  
  // Process language data for visualization
  const languageData = metrics.languages
    .filter(lang => lang.total_acceptances > 0) // Only show languages with accepted suggestions
    .sort((a, b) => b.total_acceptances - a.total_acceptances) // Sort by most accepted
    .slice(0, 10) // Top 10 languages
    .map(lang => ({
      name: lang.name,
      acceptances: lang.total_acceptances,
      lines: lang.total_lines_accepted || 0,
      rate: lang.total_suggestions ? 
        (lang.total_acceptances / lang.total_suggestions) * 100 : 0
    }));
  
  // Process editor data for visualization
  const editorData = metrics.editors
    .filter(editor => editor.total_acceptances > 0) // Only show editors with accepted suggestions
    .sort((a, b) => b.total_acceptances - a.total_acceptances) // Sort by most accepted
    .map(editor => ({
      name: editor.name,
      acceptances: editor.total_acceptances,
      lines: editor.total_lines_accepted || 0,
      rate: editor.total_suggestions ? 
        (editor.total_acceptances / editor.total_suggestions) * 100 : 0
    }));
    
  // Daily productivity trend data (if available)
  const dailyTrendData = charts?.dailyProductivity || [];
    
  // Convert acceptance rate data for visualization
  const acceptanceRateData = [
    { name: 'Accepted', value: metrics.acceptedSuggestions },
    { name: 'Not Accepted', value: metrics.totalSuggestions - metrics.acceptedSuggestions }
  ];
  
  // Language productivity scatter data
  const languageScatterData = languageData.map(lang => ({
    name: lang.name,
    acceptances: lang.acceptances,
    lines: lang.lines,
    rate: lang.rate
  }));
  
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
          Developer Productivity Report
        </Heading>
        
        <Box>
          <Badge 
            colorScheme="green" 
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
        This report shows how GitHub Copilot is enhancing developer productivity across your organization.
      </Text>
      
      {/* Summary metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <StatCard 
          title="Accepted Suggestions" 
          value={formatNumber(summary.acceptedSuggestions || 0)}
          helpText="Total number of accepted suggestions"
          accentColor="green.400"
          bg={cardBg}
          borderColor={borderColor}
          timeFrame={reportConfig.dateRange}
        />
        <StatCard 
          title="Lines of Code Generated" 
          value={formatNumber(summary.acceptedLines || 0)}
          helpText="Total lines of code from Copilot"
          accentColor="blue.400"
          bg={cardBg}
          borderColor={borderColor}
        />
        <StatCard 
          title="Acceptance Rate" 
          value={formatPercentage(summary.acceptanceRate || 0)}
          helpText="Percentage of suggestions accepted"
          accentColor="purple.400"
          bg={cardBg}
          borderColor={borderColor}
        />
        <StatCard 
          title="Avg Lines per User" 
          value={formatNumber(Math.round(avgAcceptedLinesPerUser))}
          helpText="Average lines accepted per active user"
          accentColor="orange.400"
          bg={cardBg}
          borderColor={borderColor}
        />
      </SimpleGrid>
      
      {/* Productivity by Language and Editor */}
      <Box mb={8}>
        <Heading size="md" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
          Productivity by Language and Editor
        </Heading>
        
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          <GridItem>
            <ChartCard 
              title="Top Languages by Accepted Code" 
              description="Programming languages with most accepted suggestions"
              bg={cardBg}
              borderColor={borderColor}
              accentColor="blue.400"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={languageData.slice(0, 7)} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <RechartsTooltip 
                    formatter={(value, name) => [formatNumber(value), 'Accepted Suggestions']}
                    contentStyle={{
                      backgroundColor: cardBg,
                      borderColor: borderColor,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="acceptances" 
                    fill={CHART_COLORS.primary} 
                    name="Acceptances" 
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </GridItem>
          
          <GridItem>
            <ChartCard 
              title="Top Editors by Productivity" 
              description="Code editors with most accepted suggestions"
              bg={cardBg}
              borderColor={borderColor}
              accentColor="green.400"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={editorData} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <RechartsTooltip 
                    formatter={(value, name) => [formatNumber(value), 'Accepted Suggestions']}
                    contentStyle={{
                      backgroundColor: cardBg,
                      borderColor: borderColor,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="acceptances" 
                    fill={CHART_COLORS.secondary} 
                    name="Acceptances" 
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </GridItem>
        </Grid>
      </Box>
      
      {/* Detailed productivity analysis */}
      <Box mb={8}>
        <Heading size="md" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
          Detailed Productivity Analysis
        </Heading>
        
        <Tabs colorScheme="green" variant="enclosed">
          <TabList>
            <Tab>Language Analysis</Tab>
            <Tab>Editor Analysis</Tab>
            <Tab>Code Statistics</Tab>
          </TabList>
          
          <TabPanels>
            {/* Language Analysis Tab */}
            <TabPanel>
              <Box mb={6}>
                <Text mb={4}>
                  Detailed analysis of Copilot productivity across different programming languages.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <ChartCard 
                      title="Language Productivity Comparison" 
                      description="Accepted lines of code by language"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="blue.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={languageData.slice(0, 7)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip 
                            formatter={(value) => formatNumber(value)}
                            contentStyle={{
                              backgroundColor: cardBg,
                              borderColor: borderColor,
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="lines" fill={CHART_COLORS.primary} name="Lines of Code" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </GridItem>
                  
                  <GridItem>
                    <ChartCard 
                      title="Language Acceptance Rates" 
                      description="Percentage of suggestions accepted by language"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="purple.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={languageData.slice(0, 7)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                          <RechartsTooltip 
                            formatter={(value) => `${value.toFixed(1)}%`}
                            contentStyle={{
                              backgroundColor: cardBg,
                              borderColor: borderColor,
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="rate" fill={CHART_COLORS.tertiary} name="Acceptance Rate" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </GridItem>
                </Grid>
                
                <Box p={5} mt={6} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
                  <Heading size="sm" mb={4}>Language Productivity Details</Heading>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Language</Th>
                        <Th isNumeric>Acceptances</Th>
                        <Th isNumeric>Lines of Code</Th>
                        <Th isNumeric>Acceptance Rate</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {languageData.map((lang, index) => (
                        <Tr key={index}>
                          <Td fontWeight="medium">{lang.name}</Td>
                          <Td isNumeric>{formatNumber(lang.acceptances)}</Td>
                          <Td isNumeric>{formatNumber(lang.lines)}</Td>
                          <Td isNumeric>{formatPercentage(lang.rate)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </TabPanel>
            
            {/* Editor Analysis Tab */}
            <TabPanel>
              <Box mb={6}>
                <Text mb={4}>
                  Detailed analysis of Copilot productivity across different code editors.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <ChartCard 
                      title="Editor Productivity Comparison" 
                      description="Accepted lines of code by editor"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="green.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={editorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip 
                            formatter={(value) => formatNumber(value)}
                            contentStyle={{
                              backgroundColor: cardBg,
                              borderColor: borderColor,
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="lines" fill={CHART_COLORS.secondary} name="Lines of Code" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </GridItem>
                  
                  <GridItem>
                    <ChartCard 
                      title="Editor Acceptance Rates" 
                      description="Percentage of suggestions accepted by editor"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="purple.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={editorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                          <RechartsTooltip 
                            formatter={(value) => `${value.toFixed(1)}%`}
                            contentStyle={{
                              backgroundColor: cardBg,
                              borderColor: borderColor,
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="rate" fill={CHART_COLORS.tertiary} name="Acceptance Rate" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </GridItem>
                </Grid>
                
                <Box p={5} mt={6} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
                  <Heading size="sm" mb={4}>Editor Productivity Details</Heading>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Editor</Th>
                        <Th isNumeric>Acceptances</Th>
                        <Th isNumeric>Lines of Code</Th>
                        <Th isNumeric>Acceptance Rate</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {editorData.map((editor, index) => (
                        <Tr key={index}>
                          <Td fontWeight="medium">{editor.name}</Td>
                          <Td isNumeric>{formatNumber(editor.acceptances)}</Td>
                          <Td isNumeric>{formatNumber(editor.lines)}</Td>
                          <Td isNumeric>{formatPercentage(editor.rate)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </TabPanel>
            
            {/* Code Statistics Tab */}
            <TabPanel>
              <Box mb={6}>
                <Text mb={4}>
                  Detailed statistics about code suggestions and acceptance patterns.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <ChartCard 
                      title="Acceptance Rate" 
                      description="Percentage of suggestions accepted vs. not accepted"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="purple.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={acceptanceRateData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${formatPercentage(percent * 100)}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {acceptanceRateData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={index === 0 ? CHART_COLORS.primary : CHART_COLORS.quaternary} 
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip 
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
                    <ChartCard 
                      title="Language Productivity Analysis" 
                      description="Correlating acceptance count with line count"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="blue.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                          margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20,
                          }}
                        >
                          <CartesianGrid />
                          <XAxis 
                            type="number" 
                            dataKey="acceptances" 
                            name="Acceptances" 
                            unit=""
                          />
                          <YAxis 
                            type="number" 
                            dataKey="lines" 
                            name="Lines" 
                            unit=""
                          />
                          <ZAxis 
                            type="number" 
                            dataKey="rate" 
                            range={[50, 250]} 
                            name="Acceptance Rate" 
                            unit="%"
                          />
                          <RechartsTooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            formatter={(value, name) => {
                              if (name === 'Acceptance Rate') {
                                return [`${value.toFixed(1)}%`, name];
                              }
                              return [formatNumber(value), name];
                            }}
                            contentStyle={{
                              backgroundColor: cardBg,
                              borderColor: borderColor,
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                            wrapperStyle={{ zIndex: 100 }}
                          />
                          <Scatter 
                            name="Languages" 
                            data={languageScatterData} 
                            fill={CHART_COLORS.primary}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </GridItem>
                </Grid>
                
                <Box p={5} mt={6} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
                  <Heading size="sm" mb={4}>Code Productivity Metrics</Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <Stat>
                      <StatLabel>Avg. Lines per Acceptance</StatLabel>
                      <StatNumber>
                        {formatNumber(metrics.acceptedSuggestions > 0 
                          ? (metrics.acceptedLines / metrics.acceptedSuggestions).toFixed(1)
                          : 0)}
                      </StatNumber>
                      <StatHelpText>Lines of code per accepted suggestion</StatHelpText>
                    </Stat>
                    
                    <Stat>
                      <StatLabel>Avg. Acceptances per User</StatLabel>
                      <StatNumber>
                        {formatNumber(Math.round(avgAcceptedSuggestionsPerUser))}
                      </StatNumber>
                      <StatHelpText>Accepted suggestions per active user</StatHelpText>
                    </Stat>
                    
                    <Stat>
                      <StatLabel>Total Productivity Score</StatLabel>
                      <StatNumber>
                        {formatNumber(Math.round(metrics.acceptedLines * (metrics.acceptanceRate / 100)))}
                      </StatNumber>
                      <StatHelpText>Weighted by acceptance rate</StatHelpText>
                    </Stat>
                  </SimpleGrid>
                </Box>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      
      {/* Daily productivity trend */}
      {dailyTrendData.length > 0 && (
        <Box mt={8}>
          <Heading size="md" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
            Daily Productivity Trends
          </Heading>
          
          <ChartCard 
            title="Daily Code Productivity" 
            description="Lines of code and acceptances over time"
            infoTooltip="This chart shows daily trends in accepted code volume over time."
            bg={cardBg}
            borderColor={borderColor}
            accentColor="green.400"
            height="350px"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={dailyTrendData}
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
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip 
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
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="acceptedSuggestions" 
                  name="Accepted Suggestions" 
                  stroke={CHART_COLORS.primary} 
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="acceptedLines" 
                  name="Lines of Code" 
                  stroke={CHART_COLORS.secondary} 
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>
      )}
      
      {/* Insights section */}
      {insights && insights.length > 0 && (
        <Box mt={8} p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
          <Heading size="md" mb={4}>Productivity Insights</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {insights.map((insight, index) => (
              <Box 
                key={index} 
                p={4} 
                bg={useColorModeValue('green.50', 'green.900')} 
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

export default ProductivityReport;
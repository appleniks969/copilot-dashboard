/**
 * LanguageEditorReport.js
 * Fully implemented component for language and editor analysis
 */

import React, { useState } from 'react';
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
  Select,
  HStack,
  Tag,
  TagLabel,
  Tooltip,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Stack,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { ChevronDownIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import StatCard from '../../common/StatCard';
import ChartCard from '../../common/ChartCard';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { useReporting } from '../../../contexts/ReportingContext';
import { CHART_COLORS, CHART_COLORS_ARRAY } from '../../../../config/constants';
import { formatNumber, formatPercentage } from '../../../../utils/formatUtils';

const LanguageEditorReport = () => {
  const reportId = 'languageEditor';
  
  // State for filters
  const [languageFilter, setLanguageFilter] = useState('all');
  const [editorFilter, setEditorFilter] = useState('all');
  const [metricType, setMetricType] = useState('acceptances');
  
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
        <Text>Loading language and editor data...</Text>
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
  if (!metrics || !metrics.languages || !metrics.editors) {
    return (
      <Box p={4}>
        <Text>No language or editor data available. Please make sure you're authenticated and have selected a valid organization and team.</Text>
      </Box>
    );
  }
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  
  // Process language data
  const languageData = metrics.languages
    .filter(lang => lang.total_suggestions > 0) // Only show languages with suggestions
    .sort((a, b) => b.total_acceptances - a.total_acceptances) // Sort by acceptances
    .map(lang => ({
      name: lang.name,
      acceptances: lang.total_acceptances || 0,
      suggestions: lang.total_suggestions || 0,
      lines: lang.total_lines_accepted || 0,
      users: lang.total_engaged_users || 0,
      rate: lang.total_suggestions > 0 
        ? (lang.total_acceptances / lang.total_suggestions) * 100 
        : 0
    }));
  
  // Process editor data
  const editorData = metrics.editors
    .filter(editor => editor.total_suggestions > 0) // Only show editors with suggestions
    .sort((a, b) => b.total_acceptances - a.total_acceptances) // Sort by acceptances
    .map(editor => ({
      name: editor.name,
      acceptances: editor.total_acceptances || 0,
      suggestions: editor.total_suggestions || 0,
      lines: editor.total_lines_accepted || 0,
      users: editor.total_engaged_users || 0,
      rate: editor.total_suggestions > 0 
        ? (editor.total_acceptances / editor.total_suggestions) * 100 
        : 0
    }));
  
  // Get top languages and editors
  const topLanguages = languageData.slice(0, 10);
  const topEditors = editorData;
  
  // Create treemap data
  const treemapData = languageData.map(lang => ({
    name: lang.name,
    value: lang[metricType],
    rate: lang.rate
  }));
  
  // Create radar data for comparison
  const radarData = topLanguages.slice(0, 5).map(lang => {
    const obj = { name: lang.name };
    
    // Add normalized values for each metric
    const maxAcceptances = Math.max(...topLanguages.map(l => l.acceptances));
    const maxLines = Math.max(...topLanguages.map(l => l.lines));
    const maxRate = Math.max(...topLanguages.map(l => l.rate));
    const maxUsers = Math.max(...topLanguages.map(l => l.users));
    
    obj.acceptances = maxAcceptances > 0 ? (lang.acceptances / maxAcceptances) * 100 : 0;
    obj.lines = maxLines > 0 ? (lang.lines / maxLines) * 100 : 0;
    obj.rate = maxRate > 0 ? (lang.rate / maxRate) * 100 : 0;
    obj.users = maxUsers > 0 ? (lang.users / maxUsers) * 100 : 0;
    
    return obj;
  });
  
  // Language distribution chart data
  const languageDistributionData = topLanguages.map((lang, index) => ({
    name: lang.name,
    acceptances: lang.acceptances,
    fill: CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length]
  }));
  
  // Editor distribution chart data
  const editorDistributionData = topEditors.map((editor, index) => ({
    name: editor.name,
    acceptances: editor.acceptances,
    fill: CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length]
  }));
  
  // Scatter plot data (language productivity vs acceptance rate)
  const scatterData = languageData.map(lang => ({
    name: lang.name,
    acceptances: lang.acceptances,
    lines: lang.lines,
    rate: lang.rate
  }));
  
  // Calculate language and editor totals and averages
  const totalLanguages = languageData.length;
  const totalEditors = editorData.length;
  const avgAcceptanceRateByLanguage = languageData.reduce((sum, lang) => sum + lang.rate, 0) / totalLanguages;
  const avgAcceptanceRateByEditor = editorData.reduce((sum, editor) => sum + editor.rate, 0) / totalEditors;
  
  // Top languages by different metrics
  const topLanguageByAcceptance = languageData.length > 0 ? languageData[0].name : 'None';
  const topLanguageByRate = [...languageData].sort((a, b) => b.rate - a.rate)[0]?.name || 'None';
  const topLanguageByLines = [...languageData].sort((a, b) => b.lines - a.lines)[0]?.name || 'None';
  
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
          Language & Editor Analysis
        </Heading>
        
        <Box>
          <Badge 
            colorScheme="teal" 
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
        This report analyzes GitHub Copilot usage across different programming languages and code editors.
      </Text>
      
      {/* Summary metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <StatCard 
          title="Languages Supported" 
          value={formatNumber(totalLanguages)}
          helpText="Programming languages with Copilot usage"
          accentColor="teal.400"
          bg={cardBg}
          borderColor={borderColor}
        />
        <StatCard 
          title="Editors Supported" 
          value={formatNumber(totalEditors)}
          helpText="Code editors with Copilot usage"
          accentColor="blue.400"
          bg={cardBg}
          borderColor={borderColor}
        />
        <StatCard 
          title="Avg Acceptance by Language" 
          value={formatPercentage(avgAcceptanceRateByLanguage)}
          helpText="Average acceptance rate across languages"
          accentColor="purple.400"
          bg={cardBg}
          borderColor={borderColor}
        />
        <StatCard 
          title="Top Language" 
          value={topLanguageByAcceptance}
          helpText="Language with most accepted suggestions"
          accentColor="orange.400"
          bg={cardBg}
          borderColor={borderColor}
        />
      </SimpleGrid>
      
      {/* Language & Editor Distribution */}
      <Box mb={8}>
        <Heading size="md" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
          Language & Editor Distribution
        </Heading>
        
        <Flex 
          direction={{ base: "column", md: "row" }}
          align={{ base: "flex-start", md: "center" }}
          justify="space-between"
          mb={4}
          gap={4}
        >
          <Text color={secondaryTextColor}>
            Distribution of Copilot usage across languages and editors.
          </Text>
          
          <HStack spacing={4}>
            <Menu closeOnSelect>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="outline">
                Metric: {metricType === 'acceptances' 
                  ? 'Accepted Suggestions' 
                  : metricType === 'lines' 
                    ? 'Lines of Code' 
                    : metricType === 'rate' 
                      ? 'Acceptance Rate' 
                      : 'Users'}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setMetricType('acceptances')}>Accepted Suggestions</MenuItem>
                <MenuItem onClick={() => setMetricType('lines')}>Lines of Code</MenuItem>
                <MenuItem onClick={() => setMetricType('rate')}>Acceptance Rate</MenuItem>
                <MenuItem onClick={() => setMetricType('users')}>Users</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          <GridItem>
            <ChartCard 
              title="Programming Language Distribution" 
              description={`Top languages by ${metricType === 'acceptances' 
                ? 'accepted suggestions' 
                : metricType === 'lines' 
                  ? 'lines of code' 
                  : metricType === 'rate' 
                    ? 'acceptance rate' 
                    : 'users'}`}
              bg={cardBg}
              borderColor={borderColor}
              accentColor="teal.400"
            >
              <ResponsiveContainer width="100%" height="100%">
                {metricType === 'rate' ? (
                  <BarChart 
                    data={[...languageData].sort((a, b) => b.rate - a.rate).slice(0, 10)} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis 
                      dataKey="name" 
                      type="category"
                      tick={{ fontSize: 12 }}
                      width={80}
                    />
                    <RechartsTooltip 
                      formatter={(value) => `${value.toFixed(1)}%`}
                      contentStyle={{
                        backgroundColor: cardBg,
                        borderColor: borderColor,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="rate" 
                      fill={CHART_COLORS.tertiary} 
                      name="Acceptance Rate" 
                      radius={[0, 4, 4, 0]} 
                    />
                  </BarChart>
                ) : (
                  <BarChart 
                    data={[...languageData]
                      .sort((a, b) => b[metricType] - a[metricType])
                      .slice(0, 10)} 
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
                      formatter={(value) => formatNumber(value)}
                      contentStyle={{
                        backgroundColor: cardBg,
                        borderColor: borderColor,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar 
                      dataKey={metricType} 
                      fill={CHART_COLORS.primary} 
                      name={metricType === 'acceptances' 
                        ? 'Accepted Suggestions' 
                        : metricType === 'lines' 
                          ? 'Lines of Code' 
                          : 'Users'} 
                      radius={[0, 4, 4, 0]} 
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </ChartCard>
          </GridItem>
          
          <GridItem>
            <ChartCard 
              title="Editor Distribution" 
              description={`Editors by ${metricType === 'acceptances' 
                ? 'accepted suggestions' 
                : metricType === 'lines' 
                  ? 'lines of code' 
                  : metricType === 'rate' 
                    ? 'acceptance rate' 
                    : 'users'}`}
              bg={cardBg}
              borderColor={borderColor}
              accentColor="blue.400"
            >
              <ResponsiveContainer width="100%" height="100%">
                {metricType === 'rate' ? (
                  <BarChart 
                    data={[...editorData].sort((a, b) => b.rate - a.rate)} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis 
                      dataKey="name" 
                      type="category"
                      tick={{ fontSize: 12 }}
                      width={80}
                    />
                    <RechartsTooltip 
                      formatter={(value) => `${value.toFixed(1)}%`}
                      contentStyle={{
                        backgroundColor: cardBg,
                        borderColor: borderColor,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="rate" 
                      fill={CHART_COLORS.tertiary} 
                      name="Acceptance Rate" 
                      radius={[0, 4, 4, 0]} 
                    />
                  </BarChart>
                ) : (
                  <BarChart 
                    data={[...editorData].sort((a, b) => b[metricType] - a[metricType])} 
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
                      formatter={(value) => formatNumber(value)}
                      contentStyle={{
                        backgroundColor: cardBg,
                        borderColor: borderColor,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar 
                      dataKey={metricType} 
                      fill={CHART_COLORS.secondary} 
                      name={metricType === 'acceptances' 
                        ? 'Accepted Suggestions' 
                        : metricType === 'lines' 
                          ? 'Lines of Code'
                          : 'Users'} 
                      radius={[0, 4, 4, 0]} 
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </ChartCard>
          </GridItem>
        </Grid>
      </Box>
      
      {/* Language vs Editor Analysis */}
      <Box mb={8}>
        <Heading size="md" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
          Detailed Analysis
        </Heading>
        
        <Tabs colorScheme="teal" variant="enclosed">
          <TabList>
            <Tab>Language Analysis</Tab>
            <Tab>Editor Analysis</Tab>
            <Tab>Comparison</Tab>
          </TabList>
          
          <TabPanels>
            {/* Language Analysis Tab */}
            <TabPanel>
              <Box mb={6}>
                <Text mb={4}>
                  Detailed analysis of GitHub Copilot usage across different programming languages.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <ChartCard 
                      title="Languages by Acceptance Rate" 
                      description="Programming languages with the highest suggestion acceptance rates"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="purple.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={[...languageData].sort((a, b) => b.rate - a.rate).slice(0, 10)} 
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
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
                  
                  <GridItem>
                    <ChartCard 
                      title="Languages by Generated Code" 
                      description="Programming languages with the most lines of code generated"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="teal.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={[...languageData].sort((a, b) => b.lines - a.lines).slice(0, 10)} 
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
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
                </Grid>
                
                <Box p={5} mt={6} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
                  <Heading size="sm" mb={4}>Language Metrics</Heading>
                  <Text fontSize="sm" mb={4}>
                    The table below shows detailed metrics for each programming language.
                  </Text>
                  <Box maxH="400px" overflowY="auto">
                    <Table size="sm" variant="simple">
                      <Thead position="sticky" top={0} bg={cardBg}>
                        <Tr>
                          <Th>Language</Th>
                          <Th isNumeric>Users</Th>
                          <Th isNumeric>Acceptances</Th>
                          <Th isNumeric>Lines</Th>
                          <Th isNumeric>Acceptance Rate</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {languageData.map((lang, index) => (
                          <Tr key={index}>
                            <Td fontWeight="medium">{lang.name}</Td>
                            <Td isNumeric>{formatNumber(lang.users)}</Td>
                            <Td isNumeric>{formatNumber(lang.acceptances)}</Td>
                            <Td isNumeric>{formatNumber(lang.lines)}</Td>
                            <Td isNumeric>{formatPercentage(lang.rate)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              </Box>
            </TabPanel>
            
            {/* Editor Analysis Tab */}
            <TabPanel>
              <Box mb={6}>
                <Text mb={4}>
                  Detailed analysis of GitHub Copilot usage across different code editors.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <ChartCard 
                      title="Editors by Acceptance Rate" 
                      description="Code editors with the highest suggestion acceptance rates"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="purple.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={[...editorData].sort((a, b) => b.rate - a.rate)} 
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
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
                  
                  <GridItem>
                    <ChartCard 
                      title="Editors by Generated Code" 
                      description="Code editors with the most lines of code generated"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="blue.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={[...editorData].sort((a, b) => b.lines - a.lines)} 
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
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
                </Grid>
                
                <Box p={5} mt={6} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
                  <Heading size="sm" mb={4}>Editor Metrics</Heading>
                  <Text fontSize="sm" mb={4}>
                    The table below shows detailed metrics for each code editor.
                  </Text>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Editor</Th>
                        <Th isNumeric>Users</Th>
                        <Th isNumeric>Acceptances</Th>
                        <Th isNumeric>Lines</Th>
                        <Th isNumeric>Acceptance Rate</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {editorData.map((editor, index) => (
                        <Tr key={index}>
                          <Td fontWeight="medium">{editor.name}</Td>
                          <Td isNumeric>{formatNumber(editor.users)}</Td>
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
            
            {/* Comparison Tab */}
            <TabPanel>
              <Box mb={6}>
                <Text mb={4}>
                  Compare and analyze GitHub Copilot performance across languages and editors.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  <GridItem>
                    <ChartCard 
                      title="Language Performance Radar" 
                      description="Comparative analysis of top 5 languages across metrics"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="teal.400"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="name" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name="Acceptances"
                            dataKey="acceptances"
                            stroke={CHART_COLORS.primary}
                            fill={CHART_COLORS.primary}
                            fillOpacity={0.2}
                          />
                          <Radar
                            name="Lines"
                            dataKey="lines"
                            stroke={CHART_COLORS.secondary}
                            fill={CHART_COLORS.secondary}
                            fillOpacity={0.2}
                          />
                          <Radar
                            name="Rate"
                            dataKey="rate"
                            stroke={CHART_COLORS.tertiary}
                            fill={CHART_COLORS.tertiary}
                            fillOpacity={0.2}
                          />
                          <Radar
                            name="Users"
                            dataKey="users"
                            stroke={CHART_COLORS.quaternary}
                            fill={CHART_COLORS.quaternary}
                            fillOpacity={0.2}
                          />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </GridItem>
                  
                  <GridItem>
                    <ChartCard 
                      title="Language Productivity Analysis" 
                      description="Relationship between acceptances and efficiency"
                      bg={cardBg}
                      borderColor={borderColor}
                      accentColor="purple.400"
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
                          <XAxis type="number" dataKey="acceptances" name="Acceptances" />
                          <YAxis type="number" dataKey="rate" name="Acceptance Rate" unit="%" />
                          <ZAxis type="number" dataKey="lines" range={[50, 400]} name="Lines" />
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
                            content={({ payload }) => {
                              if (payload && payload.length) {
                                return (
                                  <Box
                                    p={2}
                                    bg={cardBg}
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                    borderRadius="md"
                                    boxShadow="md"
                                  >
                                    <Text fontWeight="bold">{payload[0].payload.name}</Text>
                                    <Text fontSize="sm">Acceptances: {formatNumber(payload[0].payload.acceptances)}</Text>
                                    <Text fontSize="sm">Acceptance Rate: {formatPercentage(payload[0].payload.rate)}</Text>
                                    <Text fontSize="sm">Lines: {formatNumber(payload[0].payload.lines)}</Text>
                                  </Box>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Scatter
                            name="Languages"
                            data={scatterData}
                            fill={CHART_COLORS.primary}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </GridItem>
                </Grid>
                
                <Box p={5} mt={6} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
                  <Heading size="sm" mb={4}>Key Findings & Comparisons</Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Heading size="xs" mb={2}>Top Languages</Heading>
                      <Stack spacing={2}>
                        <HStack>
                          <Badge colorScheme="green">Most Used</Badge>
                          <Text>{topLanguageByAcceptance}</Text>
                        </HStack>
                        <HStack>
                          <Badge colorScheme="purple">Highest Acceptance Rate</Badge>
                          <Text>{topLanguageByRate}</Text>
                        </HStack>
                        <HStack>
                          <Badge colorScheme="blue">Most Lines Generated</Badge>
                          <Text>{topLanguageByLines}</Text>
                        </HStack>
                      </Stack>
                    </Box>
                    
                    <Box>
                      <Heading size="xs" mb={2}>Top Editors</Heading>
                      <Stack spacing={2}>
                        <HStack>
                          <Badge colorScheme="green">Most Used</Badge>
                          <Text>{editorData[0]?.name || 'None'}</Text>
                        </HStack>
                        <HStack>
                          <Badge colorScheme="purple">Highest Acceptance Rate</Badge>
                          <Text>{[...editorData].sort((a, b) => b.rate - a.rate)[0]?.name || 'None'}</Text>
                        </HStack>
                        <HStack>
                          <Badge colorScheme="blue">Most Lines Generated</Badge>
                          <Text>{[...editorData].sort((a, b) => b.lines - a.lines)[0]?.name || 'None'}</Text>
                        </HStack>
                      </Stack>
                    </Box>
                  </SimpleGrid>
                  
                  <Divider my={4} />
                  
                  <Text fontSize="sm" color={secondaryTextColor}>
                    <Icon as={InfoOutlineIcon} mr={1} /> 
                    Languages with high acceptance rates indicate Copilot is providing particularly relevant suggestions
                    for those languages. Consider sharing best practices from those language communities with other teams.
                  </Text>
                </Box>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      
      {/* Language Treemap */}
      <Box mb={8}>
        <Heading size="md" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
          Language Activity Map
        </Heading>
        
        <Text mb={4} color={secondaryTextColor}>
          This visualization shows the relative distribution of {metricType === 'acceptances' 
            ? 'accepted suggestions' 
            : metricType === 'lines' 
              ? 'lines of code' 
              : metricType === 'rate' 
                ? 'acceptance rate' 
                : 'users'} across programming languages.
        </Text>
        
        <Box 
          p={4} 
          borderWidth="1px" 
          borderRadius="lg" 
          borderColor={borderColor}
          bg={cardBg}
          boxShadow="sm"
          height="400px"
        >
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="value"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill={CHART_COLORS.primary}
              content={({ root, depth, x, y, width, height, index, payload, colors, rank, name, value }) => {
                // Only render if width and height are reasonable
                if (width < 5 || height < 5) {
                  return null;
                }
                
                // Calculate color based on acceptance rate
                let fillColor = CHART_COLORS.primary;
                if (metricType === 'rate') {
                  // For rate, use color scale based on the value itself
                  const rate = value;
                  fillColor = rate > 75 ? '#38A169' : rate > 50 ? '#4299E1' : rate > 25 ? '#805AD5' : '#E53E3E';
                } else {
                  // For other metrics, use the rate property
                  const rate = payload.rate;
                  fillColor = rate > 75 ? '#38A169' : rate > 50 ? '#4299E1' : rate > 25 ? '#805AD5' : '#E53E3E';
                }
                
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      style={{
                        fill: fillColor,
                        stroke: '#fff',
                        strokeWidth: 2 / (depth + 1e-10),
                        strokeOpacity: 1 / (depth + 1e-10),
                      }}
                    />
                    {width > 50 && height > 30 ? (
                      <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#fff"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {name}
                      </text>
                    ) : null}
                    {width > 100 && height > 50 ? (
                      <text
                        x={x + width / 2}
                        y={y + height / 2 + 15}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#fff"
                        fontSize={10}
                      >
                        {metricType === 'rate' ? `${value.toFixed(1)}%` : formatNumber(value)}
                      </text>
                    ) : null}
                  </g>
                );
              }}
            />
          </ResponsiveContainer>
        </Box>
      </Box>
      
      {/* Key insights and recommendations */}
      <Box p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
        <Heading size="md" mb={4}>Key Insights & Recommendations</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Box 
            p={4} 
            bg={useColorModeValue('teal.50', 'teal.900')} 
            borderRadius="md"
          >
            <Heading size="sm" mb={2}>Language Insights</Heading>
            <Text fontSize="sm">
              {topLanguageByAcceptance} shows the highest usage, while {topLanguageByRate} has the best acceptance rate at {
                formatPercentage([...languageData].sort((a, b) => b.rate - a.rate)[0]?.rate || 0)
              }. Focus on improving Copilot usage in languages with lower acceptance rates through training and awareness.
            </Text>
          </Box>
          
          <Box 
            p={4} 
            bg={useColorModeValue('blue.50', 'blue.900')} 
            borderRadius="md"
          >
            <Heading size="sm" mb={2}>Editor Insights</Heading>
            <Text fontSize="sm">
              {editorData[0]?.name || 'VS Code'} is the most popular editor among your developers.
              {editorData.length > 1 ? 
                ` Consider standardizing Copilot configurations across editors to ensure consistent experiences.` : 
                ` Explore opportunities to enable Copilot in additional editors to expand usage.`}
            </Text>
          </Box>
          
          <Box 
            p={4} 
            bg={useColorModeValue('purple.50', 'purple.900')} 
            borderRadius="md"
            gridColumn={{ md: "span 2" }}
          >
            <Heading size="sm" mb={2}>Optimization Opportunities</Heading>
            <Text fontSize="sm">
              {languageData.filter(lang => lang.rate < 50).length > 0 ? 
                `Languages with lower acceptance rates (${languageData.filter(lang => lang.rate < 50).map(l => l.name).slice(0, 3).join(', ')}) 
                 represent opportunities for improvement. Consider organizing language-specific workshops to share best practices from 
                 high-performing languages like ${topLanguageByRate}.` : 
                 `Your team is achieving good acceptance rates across languages. Focus on broadening adoption to 
                  additional programming languages to further enhance productivity.`}
            </Text>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default LanguageEditorReport;
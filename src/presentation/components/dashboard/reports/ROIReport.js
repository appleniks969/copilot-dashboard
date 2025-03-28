/**
 * ROIReport.js
 * Fully implemented component for ROI calculations
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
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormLabel,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack,
  Card,
  CardHeader,
  CardBody,
  Icon,
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
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
  Sankey,
  Rectangle
} from 'recharts';
import { InfoOutlineIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import StatCard from '../../common/StatCard';
import ChartCard from '../../common/ChartCard';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { useReporting } from '../../../contexts/ReportingContext';
import { CHART_COLORS, ROI_DEFAULTS } from '../../../../config/constants';
import { formatNumber, formatPercentage, formatCurrency } from '../../../../utils/formatUtils';

const ROIReport = () => {
  const reportId = 'roi';
  
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
  
  // State for ROI parameters
  const [roiParams, setRoiParams] = useState({
    avgLinesPerHour: ROI_DEFAULTS.avgLinesPerHour,
    avgHourlyRate: ROI_DEFAULTS.avgHourlyRate,
    licenseCostPerMonth: ROI_DEFAULTS.licenseCostPerMonth
  });
  
  // Calculate ROI metrics
  const calculateROI = (metricsData, params) => {
    if (!metricsData) return null;
    
    const acceptedLines = metricsData.acceptedLines || 0;
    const avgDailyActiveUsers = metricsData.avgDailyActiveUsers || 0;
    
    // Calculate hours saved based on accepted lines
    const hoursSaved = acceptedLines / params.avgLinesPerHour;
    
    // Calculate money saved based on hours and rate
    const moneySaved = hoursSaved * params.avgHourlyRate;
    
    // Calculate license cost based on active users
    const licenseCost = avgDailyActiveUsers * params.licenseCostPerMonth;
    
    // Calculate ROI as a ratio
    const roi = licenseCost > 0 ? (moneySaved / licenseCost) - 1 : 0;
    const roiPercentage = roi * 100;
    
    return {
      hoursSaved,
      moneySaved,
      licenseCost,
      roi,
      roiPercentage,
      netSavings: moneySaved - licenseCost,
      paybackPeriod: moneySaved > 0 ? (licenseCost / moneySaved) : 0,
      acceptedLines,
      avgDailyActiveUsers,
      metadata: {
        calculatedAt: new Date().toISOString(),
        config: params
      }
    };
  };
  
  // Calculate ROI based on current parameters
  const roiData = metrics ? calculateROI(metrics, roiParams) : null;
  
  // Generate report data using reporting service
  const reportData = metrics && roiData ? 
    reportingService.generateROIReport(metrics, roiData) : null;
  
  // Handle ROI parameter changes
  const handleParamChange = (param, value) => {
    setRoiParams(prev => ({
      ...prev,
      [param]: value
    }));
  };
  
  // Reset to default parameters
  const handleResetParams = () => {
    setRoiParams({
      avgLinesPerHour: ROI_DEFAULTS.avgLinesPerHour,
      avgHourlyRate: ROI_DEFAULTS.avgHourlyRate,
      licenseCostPerMonth: ROI_DEFAULTS.licenseCostPerMonth
    });
  };
  
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
        <Text>Loading ROI data...</Text>
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
  
  // Create data for ROI flow visualization
  const roiFlowData = [
    { source: 'GitHub Copilot', target: 'Code Suggestions', value: metrics.totalSuggestions },
    { source: 'Code Suggestions', target: 'Accepted Suggestions', value: metrics.acceptedSuggestions },
    { source: 'Accepted Suggestions', target: 'Lines of Code', value: metrics.acceptedLines },
    { source: 'Lines of Code', target: 'Developer Hours', value: roiData.hoursSaved },
    { source: 'Developer Hours', target: 'Money Saved', value: roiData.moneySaved },
  ];
  
  // Cost-benefit data
  const costBenefitData = [
    { name: 'License Cost', value: roiData.licenseCost },
    { name: 'Money Saved', value: roiData.moneySaved }
  ];
  
  // Create projection data for future ROI
  const months = 12;
  const projectionData = Array.from({ length: months }, (_, i) => {
    const month = i + 1;
    const cumulativeLicenseCost = roiData.licenseCost * month;
    const cumulativeSavings = roiData.moneySaved * month;
    const cumulativeROI = ((cumulativeSavings / cumulativeLicenseCost) - 1) * 100;
    
    return {
      month,
      cumulativeLicenseCost,
      cumulativeSavings,
      cumulativeNetSavings: cumulativeSavings - cumulativeLicenseCost,
      cumulativeROI
    };
  });
  
  // Calculate breakeven point (in months)
  const breakevenMonth = roiData.moneySaved > 0 ? 
    Math.ceil(roiData.licenseCost / roiData.moneySaved) : 
    null;
  
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
          Return on Investment Analysis
        </Heading>
        
        <Box>
          <Badge 
            colorScheme="purple" 
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
        This report calculates the return on investment for your GitHub Copilot licenses based on productivity gains.
      </Text>
      
      {/* ROI Parameters */}
      <Box 
        p={4} 
        mb={8} 
        borderWidth="1px" 
        borderRadius="lg" 
        borderColor={borderColor}
        bg={cardBg}
        boxShadow="sm"
      >
        <Heading size="md" mb={4}>ROI Calculation Parameters</Heading>
        <Text fontSize="sm" mb={4} color={secondaryTextColor}>
          Adjust these parameters to customize the ROI calculation based on your organization's specific values.
        </Text>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <FormControl>
            <FormLabel fontWeight="medium">Avg. Lines of Code per Hour</FormLabel>
            <NumberInput 
              min={1} 
              max={200} 
              value={roiParams.avgLinesPerHour} 
              onChange={(_, val) => handleParamChange('avgLinesPerHour', val)}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>
              How many lines a developer writes per hour on average
            </FormHelperText>
          </FormControl>
          
          <FormControl>
            <FormLabel fontWeight="medium">Avg. Developer Hourly Rate ($)</FormLabel>
            <NumberInput 
              min={1} 
              max={500} 
              value={roiParams.avgHourlyRate} 
              onChange={(_, val) => handleParamChange('avgHourlyRate', val)}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>
              Average fully-loaded cost per developer hour
            </FormHelperText>
          </FormControl>
          
          <FormControl>
            <FormLabel fontWeight="medium">License Cost per User ($)</FormLabel>
            <NumberInput 
              min={1} 
              max={100} 
              value={roiParams.licenseCostPerMonth} 
              onChange={(_, val) => handleParamChange('licenseCostPerMonth', val)}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>
              Monthly cost per user for GitHub Copilot
            </FormHelperText>
          </FormControl>
        </SimpleGrid>
        
        <Flex justify="flex-end" mt={4}>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleResetParams}
          >
            Reset to Defaults
          </Button>
        </Flex>
      </Box>
      
      {/* ROI Summary */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <StatCard 
          title="ROI Percentage" 
          value={formatPercentage(roiData.roiPercentage)}
          helpText={roiData.roiPercentage >= 0 ? "Positive return on investment" : "Negative return on investment"}
          accentColor={roiData.roiPercentage >= 0 ? "green.400" : "red.400"}
          bg={cardBg}
          borderColor={borderColor}
          timeFrame={reportConfig.dateRange}
        />
        <StatCard 
          title="Net Savings" 
          value={formatCurrency(roiData.netSavings)}
          helpText="Total savings minus license costs"
          accentColor={roiData.netSavings >= 0 ? "green.400" : "red.400"}
          bg={cardBg}
          borderColor={borderColor}
        />
        <StatCard 
          title="Hours Saved" 
          value={formatNumber(Math.round(roiData.hoursSaved))}
          helpText="Developer hours saved through code generation"
          accentColor="blue.400"
          bg={cardBg}
          borderColor={borderColor}
        />
        <StatCard 
          title="Breakeven Point" 
          value={breakevenMonth ? `${breakevenMonth} months` : "N/A"}
          helpText={breakevenMonth ? `Time to recoup license investment` : "Not breaking even yet"}
          accentColor={breakevenMonth && breakevenMonth <= 12 ? "green.400" : "orange.400"}
          bg={cardBg}
          borderColor={borderColor}
        />
      </SimpleGrid>
      
      {/* ROI Details */}
      <Box mb={8}>
        <Heading size="md" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
          ROI Calculation Details
        </Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box p={5} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={cardBg}>
            <Heading size="sm" mb={4}>Cost-Benefit Analysis</Heading>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Metric</Th>
                  <Th isNumeric>Value</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td fontWeight="medium">Active Users</Td>
                  <Td isNumeric>{formatNumber(roiData.avgDailyActiveUsers)}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="medium">Lines of Code Generated</Td>
                  <Td isNumeric>{formatNumber(roiData.acceptedLines)}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="medium">Developer Hours Saved</Td>
                  <Td isNumeric>{formatNumber(Math.round(roiData.hoursSaved))}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="medium">Money Saved</Td>
                  <Td isNumeric color="green.500" fontWeight="bold">{formatCurrency(roiData.moneySaved)}</Td>
                </Tr>
                <Divider my={2} />
                <Tr>
                  <Td fontWeight="medium">License Cost</Td>
                  <Td isNumeric color="red.500" fontWeight="bold">{formatCurrency(roiData.licenseCost)}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="medium">Net Savings</Td>
                  <Td isNumeric color={roiData.netSavings >= 0 ? "green.500" : "red.500"} fontWeight="bold">
                    {formatCurrency(roiData.netSavings)}
                  </Td>
                </Tr>
                <Tr>
                  <Td fontWeight="medium">ROI Percentage</Td>
                  <Td isNumeric color={roiData.roiPercentage >= 0 ? "green.500" : "red.500"} fontWeight="bold">
                    {formatPercentage(roiData.roiPercentage)}
                  </Td>
                </Tr>
                <Tr>
                  <Td fontWeight="medium">Payback Period</Td>
                  <Td isNumeric>{roiData.moneySaved > 0 ? `${(roiData.licenseCost / roiData.moneySaved).toFixed(1)} months` : "N/A"}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
          
          <ChartCard 
            title="Cost vs. Benefit Comparison" 
            description="Monthly license cost compared to estimated savings"
            bg={cardBg}
            borderColor={borderColor}
            accentColor="purple.400"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costBenefitData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${formatNumber(value)}`} />
                <RechartsTooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: cardBg,
                    borderColor: borderColor,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="value" 
                  fill={(entry) => entry.name === 'License Cost' ? CHART_COLORS.quaternary : CHART_COLORS.secondary} 
                  name="Amount" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </SimpleGrid>
      </Box>
      
      {/* ROI Projection */}
      <Box mb={8}>
        <Heading size="md" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
          12-Month ROI Projection
        </Heading>
        
        <ChartCard 
          title="Cumulative Savings Over Time" 
          description="Projected savings and costs over the next 12 months"
          bg={cardBg}
          borderColor={borderColor}
          accentColor="green.400"
          height="350px"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={projectionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
              <YAxis 
                yAxisId="left" 
                label={{ value: 'Cumulative Amount ($)', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `$${formatNumber(value)}`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                label={{ value: 'ROI (%)', angle: 90, position: 'insideRight' }} 
                tickFormatter={(value) => `${formatNumber(value)}%`}
              />
              <RechartsTooltip 
                formatter={(value, name) => {
                  if (name === 'Cumulative ROI') {
                    return [formatPercentage(value), name];
                  }
                  return [formatCurrency(value), name];
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
                yAxisId="left"
                type="monotone" 
                dataKey="cumulativeLicenseCost" 
                name="Cumulative License Cost" 
                fill={CHART_COLORS.quaternary}
                stroke={CHART_COLORS.quaternary}
                fillOpacity={0.3}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="cumulativeSavings" 
                name="Cumulative Savings" 
                fill={CHART_COLORS.secondary}
                stroke={CHART_COLORS.secondary}
                fillOpacity={0.3}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="cumulativeNetSavings" 
                name="Cumulative Net Savings" 
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="cumulativeROI" 
                name="Cumulative ROI" 
                stroke={CHART_COLORS.tertiary}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                strokeDasharray="5 5"
              />
              
              {/* Add breakeven line if applicable */}
              {breakevenMonth && breakevenMonth <= 12 && (
                <ReferenceLine 
                  x={breakevenMonth} 
                  stroke={CHART_COLORS.gray}
                  strokeDasharray="3 3"
                  label={{ 
                    value: 'Breakeven', 
                    position: 'top', 
                    fill: CHART_COLORS.gray 
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </Box>
      
      {/* ROI Per User Analysis */}
      <Box mb={8}>
        <Heading size="md" mb={4} color={useColorModeValue('gray.700', 'gray.300')}>
          Per-User ROI Analysis
        </Heading>
        
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          <Card variant="outline" borderColor={borderColor} bg={cardBg}>
            <CardHeader pb={0}>
              <Heading size="md" color="blue.500">Per User License Cost</Heading>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatNumber>{formatCurrency(roiParams.licenseCostPerMonth)}</StatNumber>
                <StatHelpText>Monthly per seat</StatHelpText>
              </Stat>
              <Text mt={2} fontSize="sm" color={secondaryTextColor}>
                This is the monthly cost of a GitHub Copilot license for each user.
              </Text>
            </CardBody>
          </Card>
          
          <Card variant="outline" borderColor={borderColor} bg={cardBg}>
            <CardHeader pb={0}>
              <Heading size="md" color="green.500">Per User Value Generated</Heading>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatNumber>
                  {formatCurrency(roiData.avgDailyActiveUsers > 0 
                    ? roiData.moneySaved / roiData.avgDailyActiveUsers 
                    : 0)}
                </StatNumber>
                <StatHelpText>Monthly per user</StatHelpText>
              </Stat>
              <Text mt={2} fontSize="sm" color={secondaryTextColor}>
                The average monetary value generated per active user per month through productivity gains.
              </Text>
            </CardBody>
          </Card>
          
          <Card variant="outline" borderColor={borderColor} bg={cardBg}>
            <CardHeader pb={0}>
              <Heading size="md" color="purple.500">Per User ROI</Heading>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatNumber>
                  {formatPercentage(roiData.avgDailyActiveUsers > 0 
                    ? ((roiData.moneySaved / roiData.avgDailyActiveUsers) / roiParams.licenseCostPerMonth - 1) * 100
                    : 0)}
                </StatNumber>
                <StatHelpText>Monthly return per user</StatHelpText>
              </Stat>
              <Text mt={2} fontSize="sm" color={secondaryTextColor}>
                The return on investment percentage for each active Copilot user.
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
      
      {/* ROI Summary and Recommendations */}
      <Box 
        mt={8} 
        p={5} 
        borderWidth="1px" 
        borderRadius="lg" 
        borderColor={borderColor} 
        bg={cardBg}
      >
        <Heading size="md" mb={4}>ROI Summary & Recommendations</Heading>
        
        <Alert 
          status={roiData.roiPercentage >= 100 ? "success" : roiData.roiPercentage >= 0 ? "info" : "warning"}
          variant="subtle"
          flexDirection="column"
          alignItems="flex-start"
          borderRadius="md"
          mb={4}
        >
          <Flex>
            <AlertIcon />
            <AlertTitle>
              {roiData.roiPercentage >= 100 
                ? "Excellent ROI" 
                : roiData.roiPercentage >= 0 
                  ? "Positive ROI" 
                  : "Negative ROI"}
            </AlertTitle>
          </Flex>
          <AlertDescription>
            {roiData.roiPercentage >= 100 
              ? `Your GitHub Copilot investment is showing an excellent return of ${formatPercentage(roiData.roiPercentage)}, more than doubling your investment.` 
              : roiData.roiPercentage >= 0 
                ? `Your GitHub Copilot investment is showing a positive return of ${formatPercentage(roiData.roiPercentage)}.` 
                : `Your GitHub Copilot investment is currently showing a negative return of ${formatPercentage(roiData.roiPercentage)}. Consider strategies to increase usage and acceptance rate.`}
          </AlertDescription>
        </Alert>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {insights && insights.map((insight, index) => (
            <Box 
              key={index} 
              p={4} 
              bg={useColorModeValue('purple.50', 'purple.900')} 
              borderRadius="md"
            >
              <Heading size="sm" mb={2}>{insight.title}</Heading>
              <Text fontSize="sm">{insight.description}</Text>
            </Box>
          ))}
          
          <Box 
            p={4} 
            bg={useColorModeValue('blue.50', 'blue.900')} 
            borderRadius="md"
          >
            <Heading size="sm" mb={2}>Key ROI Drivers</Heading>
            <Text fontSize="sm">
              The main factors driving your ROI are acceptance rate ({formatPercentage(metrics.acceptanceRate)}) 
              and lines of code per acceptance ({(metrics.acceptedLines / metrics.acceptedSuggestions).toFixed(1)}). 
              Improving these metrics will further enhance your return on investment.
            </Text>
          </Box>
          
          <Box 
            p={4} 
            bg={useColorModeValue('green.50', 'green.900')} 
            borderRadius="md"
          >
            <Heading size="sm" mb={2}>Recommendations</Heading>
            <Text fontSize="sm">
              {roiData.roiPercentage >= 0 
                ? `To further improve ROI, consider increasing adoption across all teams and encouraging the use of 
                   Copilot features across more programming languages and editors.`
                : `To improve ROI, focus on increasing adoption and usage, providing Copilot training to developers, 
                   and encouraging integration into daily workflows.`}
            </Text>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default ROIReport;
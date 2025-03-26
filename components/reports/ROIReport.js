import React from 'react';
import { 
  Box, 
  Grid, 
  GridItem, 
  Text,
  Heading,
  SimpleGrid,
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
} from 'recharts';
import StatCard from '../StatCard';
import ChartCard from '../ChartCard';
import { useCopilot } from '../../lib/CopilotContext';
import { CHART_COLORS, ROI_DEFAULTS } from '../../lib/config';
import { formatNumber, formatPercentage, formatCurrency } from '../../lib/utils';

const ROIReport = () => {
  const { metrics, totalLicensedUsers, dateRange, extractDaysFromDateRange } = useCopilot();
  
  if (!metrics || !metrics.roi) {
    return (
      <Box p={4}>
        <Text>No ROI data available. Please make sure you're authenticated and have selected a valid organization and team.</Text>
      </Box>
    );
  }

  // ROI data for the pie chart
  const roiData = [
    { name: 'Savings', value: metrics.roi.moneySaved },
    { name: 'Cost', value: totalLicensedUsers * ROI_DEFAULTS.licenseCostPerMonth },
  ];

  // Get number of days from dateRange using the helper function
  const days = extractDaysFromDateRange(dateRange);

  // Monthly projection
  const monthlyProjection = {
    hoursSaved: metrics.roi.hoursSaved * (30 / days),
    moneySaved: metrics.roi.moneySaved * (30 / days),
    licenseCost: totalLicensedUsers * ROI_DEFAULTS.licenseCostPerMonth,
  };

  // Yearly projection
  const yearlyProjection = {
    hoursSaved: monthlyProjection.hoursSaved * 12,
    moneySaved: monthlyProjection.moneySaved * 12,
    licenseCost: monthlyProjection.licenseCost * 12,
    roi: (monthlyProjection.moneySaved * 12) / (monthlyProjection.licenseCost * 12),
  };
  
  return (
    <Box>
      <Heading size="lg" mb={6}>ROI Calculation Report</Heading>
      <Text mb={6}>This report quantifies the financial return on your Copilot investment.</Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <StatCard 
          title="ROI" 
          value={formatPercentage(metrics.roi.roiPercentage)}
          helpText="For All Available Data (28 Days)"
          infoTooltip={`ROI = (Money Saved ÷ License Cost - 1) × 100%. 
Money Saved = ${formatCurrency(metrics.roi.moneySaved)}
License Cost = ${formatCurrency(totalLicensedUsers * ROI_DEFAULTS.licenseCostPerMonth)}
Return above investment = ${formatPercentage(metrics.roi.roiPercentage)}`}
        />
        <StatCard 
          title="Hours Saved" 
          value={formatNumber(Math.round(metrics.roi.hoursSaved))}
          helpText="Estimated developer time saved"
          infoTooltip={`Hours Saved = Total Lines Accepted ÷ Average Lines Per Hour
${formatNumber(metrics.acceptedLines)} lines ÷ ${ROI_DEFAULTS.avgLinesPerHour} lines/hour 
= ${formatNumber(Math.round(metrics.roi.hoursSaved))} hours`}
        />
        <StatCard 
          title="Money Saved" 
          value={formatCurrency(metrics.roi.moneySaved)}
          helpText="Based on average hourly rates"
          infoTooltip={`Money Saved = Hours Saved × Average Hourly Rate
${formatNumber(Math.round(metrics.roi.hoursSaved))} hours × ${formatCurrency(ROI_DEFAULTS.avgHourlyRate)}/hour
= ${formatCurrency(metrics.roi.moneySaved)}`}
        />
        <StatCard 
          title="Annual Projected Savings" 
          value={formatCurrency(yearlyProjection.moneySaved)}
          helpText="Based on current usage trends"
          infoTooltip={`Annual Projected Savings = Monthly Savings × 12
Monthly Savings = ${formatCurrency(monthlyProjection.moneySaved)}
= ${formatCurrency(yearlyProjection.moneySaved)} per year`}
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mb={6}>
        <GridItem>
          <ChartCard 
            title="Cost vs. Savings Breakdown" 
            description="Comparison of Copilot costs to estimated savings"
            infoTooltip={`This chart compares the total cost of GitHub Copilot licenses to the estimated savings from developer productivity.

Cost: ${formatCurrency(totalLicensedUsers * ROI_DEFAULTS.licenseCostPerMonth)} (${totalLicensedUsers} users × ${formatCurrency(ROI_DEFAULTS.licenseCostPerMonth)}/month)

Savings: ${formatCurrency(metrics.roi.moneySaved)} (${formatNumber(Math.round(metrics.roi.hoursSaved))} hours × ${formatCurrency(ROI_DEFAULTS.avgHourlyRate)}/hour)`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roiData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${formatCurrency(value)} (${formatPercentage(percent * 100)})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? CHART_COLORS.secondary : CHART_COLORS.gray} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>
        
        <GridItem>
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white" h="100%">
            <Heading size="md" mb={4}>ROI Calculation Parameters</Heading>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Parameter</Th>
                  <Th isNumeric>Value</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>Average Lines Per Hour</Td>
                  <Td isNumeric>{ROI_DEFAULTS.avgLinesPerHour}</Td>
                </Tr>
                <Tr>
                  <Td>Average Hourly Rate</Td>
                  <Td isNumeric>{formatCurrency(ROI_DEFAULTS.avgHourlyRate)}</Td>
                </Tr>
                <Tr>
                  <Td>License Cost Per User/Month</Td>
                  <Td isNumeric>{formatCurrency(ROI_DEFAULTS.licenseCostPerMonth)}</Td>
                </Tr>
                <Tr>
                  <Td>Total Licensed Users</Td>
                  <Td isNumeric>{totalLicensedUsers}</Td>
                </Tr>
                <Tr>
                  <Td>Total Lines Accepted</Td>
                  <Td isNumeric>{formatNumber(metrics.acceptedLines)}</Td>
                </Tr>
              </Tbody>
            </Table>
            
            <Divider my={4} />
            
            <Heading size="sm" mb={2}>Projected Annual ROI</Heading>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Metric</Th>
                  <Th isNumeric>Value</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>Annual Developer Hours Saved</Td>
                  <Td isNumeric>{formatNumber(Math.round(yearlyProjection.hoursSaved))}</Td>
                </Tr>
                <Tr>
                  <Td>Annual Cost Savings</Td>
                  <Td isNumeric>{formatCurrency(yearlyProjection.moneySaved)}</Td>
                </Tr>
                <Tr>
                  <Td>Annual License Cost</Td>
                  <Td isNumeric>{formatCurrency(yearlyProjection.licenseCost)}</Td>
                </Tr>
                <Tr fontWeight="bold">
                  <Td>Annual ROI</Td>
                  <Td isNumeric>{formatPercentage((yearlyProjection.roi - 1) * 100)}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default ROIReport;
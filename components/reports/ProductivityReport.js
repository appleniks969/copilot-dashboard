import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Text,
  Heading,
  SimpleGrid,
  Flex,
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
import DateRangeFilter from '../DateRangeFilter';
import { useCopilot } from '../../lib/CopilotContext';
import { CHART_COLORS, DATE_RANGES } from '../../lib/config';
import { formatNumber, formatPercentage, formatCurrency } from '../../lib/utils';

const ProductivityReport = () => {
  // Use report-specific date range
  const { 
    dateRanges, 
    updateReportDateRange, 
    getMetricsForReport,
    isLoading 
  } = useCopilot();
  
  const reportId = 'productivity';
  const [reportDateRange, setReportDateRange] = useState(dateRanges[reportId] || DATE_RANGES.LAST_28_DAYS);

  // Use a ref to track if this is the initial render
  const initialRenderRef = useRef(true);
  
  // Only update date range in context if it's not the initial render or if the date has changed
  useEffect(() => {
    // Skip the initial render which would cause an unnecessary API call
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    
    // Only update if the date range has actually changed from what's in context
    if (reportDateRange !== dateRanges[reportId]) {
      updateReportDateRange(reportId, reportDateRange);
    }
  }, [reportDateRange, reportId, dateRanges, updateReportDateRange]);
  
  // Get metrics specific to this report's date range
  const metrics = getMetricsForReport(reportId);
  
  if (!metrics) {
    return (
      <Box p={4}>
        <Text>No data available. Please make sure you're authenticated and have selected a valid organization and team.</Text>
      </Box>
    );
  }
  
  // Prepare data for the acceptance rate pie chart
  const acceptanceData = [
    { name: 'Accepted', value: metrics.acceptedSuggestions },
    { name: 'Not Accepted', value: metrics.totalSuggestions - metrics.acceptedSuggestions },
  ];
  
  // Prepare data for language comparison
  const languageData = metrics.languages && metrics.languages.length > 0 
    ? metrics.languages
        .map(lang => ({
          name: lang.name,
          acceptedSuggestions: lang.total_acceptances || 0,
          acceptedLines: lang.total_lines_accepted || 0,
        }))
        .sort((a, b) => b.acceptedLines - a.acceptedLines)
        .slice(0, 5)  // Top 5 languages
    : [];
  
  // Colors for the pie chart
  const COLORS = [CHART_COLORS.primary, CHART_COLORS.gray];
  
  return (
    <Box>
      <Flex 
        direction={{ base: "column", md: "row" }}
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        mb={6}
        gap={4}
      >
        <Heading size="lg">Productivity Metrics</Heading>
        
        <Box>
          <DateRangeFilter 
            dateRange={reportDateRange}
            setDateRange={setReportDateRange}
            compact={true}
          />
        </Box>
      </Flex>

      <Text mb={6}>
        This report shows how Copilot is being used and its impact on productivity.
        {isLoading && " Loading..."}
      </Text>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <StatCard 
          title="Lines of Code Accepted" 
          value={formatNumber(metrics.acceptedLines || 0)}
          helpText="Generated and accepted by users"
          infoTooltip="Total number of lines of code that were generated by GitHub Copilot and accepted by users. Each line counts as one unit regardless of complexity."
          timeFrame={reportDateRange}
        />
        <StatCard 
          title="Total Suggestions" 
          value={formatNumber(metrics.totalSuggestions || 0)}
          helpText="Code completions offered"
          infoTooltip="The total number of code completions or suggestions offered by GitHub Copilot across all users in the selected team/organization."
          timeFrame={reportDateRange}
        />
        <StatCard 
          title="Acceptance Rate" 
          value={formatPercentage(metrics.acceptanceRate || 0)}
          helpText="Percentage of suggestions accepted"
          infoTooltip={`Acceptance Rate = (Accepted Suggestions ÷ Total Suggestions) × 100%
${formatNumber(metrics.acceptedSuggestions || 0)} ÷ ${formatNumber(metrics.totalSuggestions || 0)} × 100%
= ${formatPercentage(metrics.acceptanceRate || 0)}`}
          timeFrame={reportDateRange}
        />
        <StatCard 
          title="Avg. Lines per User" 
          value={formatNumber(metrics.totalActiveUsers ? Math.round(metrics.acceptedLines / metrics.totalActiveUsers) : 0)}
          helpText="Accepted Copilot code per user"
          infoTooltip={`Average Lines per User = Total Lines Accepted ÷ Total Active Users
${formatNumber(metrics.acceptedLines || 0)} ÷ ${formatNumber(metrics.totalActiveUsers || 0)}
= ${formatNumber(metrics.totalActiveUsers ? Math.round(metrics.acceptedLines / metrics.totalActiveUsers) : 0)} lines per user`}
          timeFrame={reportDateRange}
        />
      </SimpleGrid>
      
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
        <ChartCard 
          title="Suggestion Acceptance" 
          description="Ratio of accepted to total suggestions"
          infoTooltip={`This chart shows the proportion of GitHub Copilot suggestions that were accepted by developers.
Total Suggestions: ${formatNumber(metrics.totalSuggestions || 0)}
Accepted Suggestions: ${formatNumber(metrics.acceptedSuggestions || 0)}
Acceptance Rate: ${formatPercentage(metrics.acceptanceRate || 0)}`}
          timeFrame={reportDateRange}
          accentColor="purple.400"
        >
          <ResponsiveContainer width="100%" height={300}>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        
        {languageData.length > 0 && (
          <ChartCard 
            title="Top Languages by Accepted Code" 
            description="Languages with the most accepted Copilot suggestions"
            infoTooltip="This chart shows which programming languages have the highest usage and acceptance of GitHub Copilot suggestions. It displays both the count of accepted suggestions and the total lines of code accepted, helping to identify which languages benefit most from Copilot assistance."
            timeFrame={reportDateRange}
            accentColor="green.400"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={languageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Legend />
                <Bar dataKey="acceptedLines" fill={CHART_COLORS.primary} name="Lines of Code Accepted" />
                <Bar dataKey="acceptedSuggestions" fill={CHART_COLORS.secondary} name="Suggestions Accepted" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </SimpleGrid>
      
      {/* Only show ROI section if we have the necessary data */}
      {metrics.roi && metrics.roi.hoursSaved > 0 && (
        <>
          <Divider my={6} />
          <Heading size="md" mb={4}>Return on Investment</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <StatCard 
              title="Hours Saved" 
              value={formatNumber(Math.round(metrics.roi.hoursSaved || 0))}
              helpText="Developer time saved"
              infoTooltip={`Hours Saved = Total Lines Accepted ÷ Average Lines Per Hour
Based on industry standard of 30 lines of code per hour
${formatNumber(metrics.acceptedLines || 0)} lines ÷ 30 lines/hour = ${formatNumber(Math.round(metrics.roi.hoursSaved || 0))} hours`}
              timeFrame={reportDateRange}
              accentColor="blue.400"
            />
            <StatCard 
              title="Cost Savings" 
              value={formatCurrency(metrics.roi.moneySaved || 0)}
              helpText="Based on average hourly rates"
              infoTooltip={`Cost Savings = Hours Saved × Average Hourly Rate
${formatNumber(Math.round(metrics.roi.hoursSaved || 0))} hours × $75/hour = ${formatCurrency(metrics.roi.moneySaved || 0)}`}
              timeFrame={reportDateRange}
              accentColor="green.400"
            />
            <StatCard 
              title="ROI" 
              value={formatPercentage(metrics.roi.roiPercentage || 0)}
              helpText="Return on investment percentage"
              infoTooltip={`ROI = (Money Saved ÷ License Cost - 1) × 100%
Money Saved: ${formatCurrency(metrics.roi.moneySaved || 0)}
License Cost: Based on $19/user/month
= ${formatPercentage(metrics.roi.roiPercentage || 0)}`}
              timeFrame={reportDateRange}
              accentColor="purple.400"
            />
          </SimpleGrid>
        </>
      )}
    </Box>
  );
};

export default ProductivityReport;
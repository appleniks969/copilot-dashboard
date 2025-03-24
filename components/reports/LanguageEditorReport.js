import React from 'react';
import { 
  Box, 
  Grid, 
  GridItem, 
  Text,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
import ChartCard from '../ChartCard';
import { useCopilot } from '../../lib/CopilotContext';
import { CHART_COLORS, PROGRAMMING_LANGUAGES, EDITORS } from '../../lib/config';
import { formatNumber, formatPercentage, transformDataForCharts } from '../../lib/utils';

const LanguageEditorReport = () => {
  const { orgData, metrics } = useCopilot();
  
  if (!orgData || !metrics) {
    return (
      <Box p={4}>
        <Text>No data available. Please make sure you're authenticated and have selected a valid organization and team.</Text>
      </Box>
    );
  }

  // Get language data from the API response
  const languageData = metrics.languages && metrics.languages.length > 0
    ? metrics.languages.map(lang => ({
        name: lang.name,
        value: lang.total_suggestions || 0,
        acceptanceRate: lang.total_suggestions > 0 
          ? (lang.total_acceptances / lang.total_suggestions) * 100 
          : 0
      }))
    : [];

  // Get editor data from the API response
  const editorData = metrics.editors && metrics.editors.length > 0
    ? metrics.editors.map(editor => ({
        name: editor.name,
        value: editor.total_suggestions || 0,
        acceptanceRate: editor.total_suggestions > 0 
          ? (editor.total_acceptances / editor.total_suggestions) * 100 
          : 0
      }))
    : [];

  // If we don't have data yet, provide a message
  if (languageData.length === 0 && editorData.length === 0) {
    return (
      <Box p={4}>
        <Text>No language or editor data available in the current metrics. Try a different date range or team.</Text>
      </Box>
    );
  }

  // Prepare simplified data for the pie charts
  const pieLanguageData = languageData.slice(0, 5).map(item => ({
    name: item.name,
    value: item.value,
  }));

  const pieEditorData = editorData.map(item => ({
    name: item.name,
    value: item.value,
  }));
  
  // Colors for the pie charts
  const COLORS = [
    CHART_COLORS.primary, 
    CHART_COLORS.secondary, 
    CHART_COLORS.tertiary, 
    CHART_COLORS.quaternary, 
    CHART_COLORS.gray
  ];
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Language and Editor Usage Report</Heading>
      <Text mb={6}>This report identifies which programming languages and editors Copilot is most used with, aiding in targeted support and training.</Text>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mb={6}>
        <GridItem>
          <ChartCard 
            title="Programming Language Usage" 
            description="Suggestions by programming language"
            infoTooltip="This chart shows the distribution of GitHub Copilot suggestions across different programming languages. The percentages indicate what portion of all suggestions were made for each language."
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieLanguageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${formatPercentage(percent * 100)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieLanguageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>
        
        <GridItem>
          <ChartCard 
            title="Editor Usage" 
            description="Suggestions by editor"
            infoTooltip="This chart shows the distribution of GitHub Copilot usage across different code editors. The percentages indicate what portion of all suggestions were made in each editor environment."
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieEditorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${formatPercentage(percent * 100)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieEditorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        <GridItem>
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
            <Heading size="md" mb={4}>Language Usage Details</Heading>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Language</Th>
                    <Th isNumeric>Suggestions</Th>
                    <Th isNumeric>Acceptance Rate</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {languageData.length > 0 ? (
                    languageData.map((lang) => (
                      <Tr key={lang.name}>
                        <Td>{lang.name}</Td>
                        <Td isNumeric>{formatNumber(lang.value)}</Td>
                        <Td isNumeric>{formatPercentage(lang.acceptanceRate)}</Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={3} textAlign="center">No language data available</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </GridItem>
        
        <GridItem>
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
            <Heading size="md" mb={4}>Editor Usage Details</Heading>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Editor</Th>
                    <Th isNumeric>Suggestions</Th>
                    <Th isNumeric>Acceptance Rate</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {editorData.length > 0 ? (
                    editorData.map((editor) => (
                      <Tr key={editor.name}>
                        <Td>{editor.name}</Td>
                        <Td isNumeric>{formatNumber(editor.value)}</Td>
                        <Td isNumeric>{formatPercentage(editor.acceptanceRate)}</Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={3} textAlign="center">No editor data available</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default LanguageEditorReport;
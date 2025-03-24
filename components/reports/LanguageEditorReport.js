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
  const { orgData } = useCopilot();
  
  if (!orgData) {
    return (
      <Box p={4}>
        <Text>No data available. Please make sure you're authenticated and have selected a valid organization.</Text>
      </Box>
    );
  }

  // Mock data for language usage since the API doesn't provide this directly
  // In a real implementation, this would come from the API
  const mockLanguageData = [
    { name: 'JavaScript', value: 3500, acceptanceRate: 78 },
    { name: 'Python', value: 2800, acceptanceRate: 82 },
    { name: 'TypeScript', value: 2200, acceptanceRate: 76 },
    { name: 'Java', value: 1800, acceptanceRate: 71 },
    { name: 'Go', value: 1200, acceptanceRate: 75 },
    { name: 'Ruby', value: 900, acceptanceRate: 69 },
    { name: 'C#', value: 850, acceptanceRate: 73 },
    { name: 'PHP', value: 620, acceptanceRate: 65 },
    { name: 'Other', value: 1500, acceptanceRate: 70 },
  ];

  // Mock data for editor usage
  const mockEditorData = [
    { name: 'VS Code', value: 8500, acceptanceRate: 77 },
    { name: 'JetBrains', value: 3200, acceptanceRate: 75 },
    { name: 'Visual Studio', value: 1200, acceptanceRate: 72 },
    { name: 'Vim/Neovim', value: 380, acceptanceRate: 69 },
    { name: 'Other', value: 300, acceptanceRate: 65 },
  ];

  // Prepare simplified data for the pie charts
  const pieLanguageData = mockLanguageData.slice(0, 5).map(item => ({
    name: item.name,
    value: item.value,
  }));

  const pieEditorData = mockEditorData.map(item => ({
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
                  {mockLanguageData.map((lang) => (
                    <Tr key={lang.name}>
                      <Td>{lang.name}</Td>
                      <Td isNumeric>{formatNumber(lang.value)}</Td>
                      <Td isNumeric>{formatPercentage(lang.acceptanceRate)}</Td>
                    </Tr>
                  ))}
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
                  {mockEditorData.map((editor) => (
                    <Tr key={editor.name}>
                      <Td>{editor.name}</Td>
                      <Td isNumeric>{formatNumber(editor.value)}</Td>
                      <Td isNumeric>{formatPercentage(editor.acceptanceRate)}</Td>
                    </Tr>
                  ))}
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
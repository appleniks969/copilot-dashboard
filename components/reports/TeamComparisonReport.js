import React from 'react';
import { 
  Box, 
  Text,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
  Link,
  Grid,
  GridItem,
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
} from 'recharts';
import ChartCard from '../ChartCard';
import { useCopilot } from '../../lib/CopilotContext';
import { CHART_COLORS } from '../../lib/config';
import { formatNumber, formatPercentage } from '../../lib/utils';

const TeamComparisonReport = () => {
  const { team, orgData, metrics } = useCopilot();
  
  // Check if we have language and editor data available
  const hasLanguageComparison = orgData && orgData.languages && orgData.languages.length > 0;
  const hasEditorComparison = orgData && orgData.editors && orgData.editors.length > 0;
  
  // Set the report title based on whether we're viewing team or org data
  const reportTitle = team ? `Team Usage Report: ${team}` : "Organization Usage Breakdown";
  
  if (!hasLanguageComparison && !hasEditorComparison) {
    // If we don't have enough data, show the info message
    return (
      <Box>
        <Heading size="lg" mb={6}>{reportTitle}</Heading>
        
        <Alert status="info" borderRadius="md" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle mb={2}>Limited Data Available</AlertTitle>
            <AlertDescription>
              {team ? 
                `We don't have detailed language and editor breakdowns for team: ${team}.` :
                `We don't have detailed language and editor breakdowns for this organization.`
              }
            </AlertDescription>
          </Box>
        </Alert>
        
        <VStack align="start" spacing={4} p={5} bg="white" borderRadius="md" shadow="sm">
          <Text>
            This report is designed to show language and editor usage breakdowns across your {team ? "team" : "organization"}.
            Unfortunately, the current API response doesn't include this detailed data.
          </Text>
          
          <Text>
            Possible reasons:
          </Text>
          
          <Box pl={4}>
            <Text>• Your GitHub token may not have sufficient permissions</Text>
            <Text>• There may not be enough Copilot usage data available yet</Text>
            <Text>• The API may have changed or may not be returning the expected data format</Text>
          </Box>
          
          <Button
            colorScheme="blue"
            size="sm"
            as={Link}
            href="https://docs.github.com/en/copilot/github-copilot-for-business/overview/about-github-copilot-analytics#about-the-github-copilot-analytics-dashboard"
            isExternal
          >
            Learn More About Copilot Analytics
          </Button>
        </VStack>
      </Box>
    );
  }
  
  // If we have language or editor data, we can show some comparison charts
  
  // Prepare language comparison data (if available)
  const languageData = hasLanguageComparison 
    ? orgData.languages
        .filter(lang => lang.total_suggestions > 0)
        .map(lang => ({
          name: lang.name,
          acceptedSuggestions: lang.total_acceptances || 0,
          totalSuggestions: lang.total_suggestions || 0,
          acceptanceRate: lang.total_suggestions > 0 
            ? (lang.total_acceptances / lang.total_suggestions) * 100 
            : 0,
        }))
        .sort((a, b) => b.acceptedSuggestions - a.acceptedSuggestions)
        .slice(0, 5)  // Top 5 languages
    : [];
  
  // Prepare editor comparison data (if available)
  const editorData = hasEditorComparison
    ? orgData.editors
        .filter(editor => editor.total_suggestions > 0)
        .map(editor => ({
          name: editor.name,
          acceptedSuggestions: editor.total_acceptances || 0,
          totalSuggestions: editor.total_suggestions || 0,
          acceptanceRate: editor.total_suggestions > 0 
            ? (editor.total_acceptances / editor.total_suggestions) * 100 
            : 0,
        }))
        .sort((a, b) => b.acceptedSuggestions - a.acceptedSuggestions)
    : [];
  
  return (
    <Box>
      <Heading size="lg" mb={6}>{reportTitle}</Heading>
      <Text mb={6}>
        {team 
          ? `This report shows Copilot usage for team ${team}, broken down by languages and editors.`
          : `This report shows Copilot usage across your organization, broken down by languages and editors.`
        }
      </Text>
      
      {hasLanguageComparison && (
        <Grid templateColumns={{ base: "1fr", lg: "1fr" }} gap={6} mb={6}>
          <GridItem>
            <ChartCard 
              title="Top Languages by Accepted Suggestions" 
              description="Languages with the most accepted suggestions"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={languageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Bar dataKey="acceptedSuggestions" fill={CHART_COLORS.primary} name="Accepted Suggestions" />
                  <Bar dataKey="totalSuggestions" fill={CHART_COLORS.quaternary} name="Total Suggestions" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </GridItem>
        </Grid>
      )}
      
      {hasEditorComparison && (
        <Grid templateColumns={{ base: "1fr", lg: "1fr" }} gap={6} mb={6}>
          <GridItem>
            <ChartCard 
              title="Editor Usage" 
              description="Copilot usage by editor"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={editorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value)} />
                  <Legend />
                  <Bar dataKey="acceptedSuggestions" fill={CHART_COLORS.secondary} name="Accepted Suggestions" />
                  <Bar dataKey="totalSuggestions" fill={CHART_COLORS.quaternary} name="Total Suggestions" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </GridItem>
        </Grid>
      )}
      
      {(hasLanguageComparison || hasEditorComparison) && (
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
          <Heading size="md" mb={4}>Detailed Breakdown</Heading>
          
          {hasLanguageComparison && (
            <>
              <Heading size="sm" mb={2}>Top Languages</Heading>
              <Box overflowX="auto" mb={4}>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Language</Th>
                      <Th isNumeric>Total Suggestions</Th>
                      <Th isNumeric>Accepted Suggestions</Th>
                      <Th isNumeric>Acceptance Rate</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {languageData.map((lang) => (
                      <Tr key={lang.name}>
                        <Td>{lang.name}</Td>
                        <Td isNumeric>{formatNumber(lang.totalSuggestions)}</Td>
                        <Td isNumeric>{formatNumber(lang.acceptedSuggestions)}</Td>
                        <Td isNumeric>{formatPercentage(lang.acceptanceRate)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </>
          )}
          
          {hasEditorComparison && (
            <>
              <Heading size="sm" mb={2}>Editors</Heading>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Editor</Th>
                      <Th isNumeric>Total Suggestions</Th>
                      <Th isNumeric>Accepted Suggestions</Th>
                      <Th isNumeric>Acceptance Rate</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {editorData.map((editor) => (
                      <Tr key={editor.name}>
                        <Td>{editor.name}</Td>
                        <Td isNumeric>{formatNumber(editor.totalSuggestions)}</Td>
                        <Td isNumeric>{formatNumber(editor.acceptedSuggestions)}</Td>
                        <Td isNumeric>{formatPercentage(editor.acceptanceRate)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TeamComparisonReport;
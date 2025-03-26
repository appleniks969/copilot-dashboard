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
  Tabs,
  TabList,
  TabPanels,
  Tab, 
  TabPanel,
  Stat,
  StatLabel, 
  StatNumber, 
  StatHelpText,
  Badge,
  Flex,
  SimpleGrid,
  Divider
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import ChartCard from '../ChartCard';
import StatCard from '../StatCard';
import { useCopilot } from '../../lib/CopilotContext';
import { CHART_COLORS, TEAMS_LIST } from '../../lib/config';
import { formatNumber, formatPercentage, formatCurrency } from '../../lib/utils';

const TeamComparisonReport = () => {
  const { team, orgData, metrics, multiTeamData, dateRange, extractDaysFromDateRange } = useCopilot();
  
  // Always show team comparison view if we have multi-team data
  const hasMultiTeamData = multiTeamData && multiTeamData.length > 0;
  
  // For single team view (fallback)
  const hasLanguageComparison = orgData && orgData.languages && orgData.languages.length > 0;
  const hasEditorComparison = orgData && orgData.editors && orgData.editors.length > 0;
  
  // Set the report title
  const reportTitle = hasMultiTeamData 
    ? "Teams Comparison Report" 
    : (team ? `Team Usage Report: ${team}` : "Organization Usage Breakdown");
  
  // If we have multi-team data, create charts for team comparison
  if (hasMultiTeamData) {
    // Prepare data for charts
    const teamSuggestionData = multiTeamData.map(teamData => ({
      name: teamData.team_slug,
      totalSuggestions: teamData.total_suggestions || 0,
      acceptedSuggestions: teamData.accepted_suggestions || 0,
      acceptanceRate: teamData.total_suggestions > 0 
        ? (teamData.accepted_suggestions / teamData.total_suggestions) * 100
        : 0,
      acceptedLines: teamData.accepted_lines || 0
    })).sort((a, b) => b.acceptedSuggestions - a.acceptedSuggestions);
    
    // For active users comparison
    const activeUsersData = multiTeamData.map(teamData => ({
      name: teamData.team_slug,
      activeUsers: teamData.active_users || 0,
      engagedUsers: teamData.engaged_users || 0
    })).sort((a, b) => b.activeUsers - a.activeUsers);
    
    // Top teams by acceptance rate
    const acceptanceRateData = [...teamSuggestionData]
      .sort((a, b) => b.acceptanceRate - a.acceptanceRate);
    
    // Languages data across teams
    const allLanguages = {};
    multiTeamData.forEach(teamData => {
      if (teamData.languages && teamData.languages.length > 0) {
        teamData.languages.forEach(lang => {
          if (!allLanguages[lang.name]) {
            allLanguages[lang.name] = {
              name: lang.name,
              totalAccepted: 0,
              teams: 0
            };
          }
          allLanguages[lang.name].totalAccepted += (lang.total_acceptances || 0);
          allLanguages[lang.name].teams++;
        });
      }
    });
    
    const languagesData = Object.values(allLanguages)
      .sort((a, b) => b.totalAccepted - a.totalAccepted)
      .slice(0, 5); // Top 5 languages
    
    return (
      <Box>
        <Heading size="lg" mb={3}>{reportTitle}</Heading>
        <Text mb={6}>This report compares GitHub Copilot usage metrics across different teams in your organization.</Text>
        
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={6}>
          <StatCard
            title="Teams Analyzed"
            value={multiTeamData.length}
            helpText={`Data from the last ${dateRange}`}
            infoTooltip={`This dashboard is showing data for the following teams: ${multiTeamData.map(t => t.team_slug).join(", ")}`}
          />
          <StatCard
            title="Total Active Users"
            value={formatNumber(multiTeamData.reduce((sum, team) => sum + (team.active_users || 0), 0))}
            helpText="Across all analyzed teams"
            infoTooltip="Active users are those who have used GitHub Copilot at least once during the selected time period"
          />
          <StatCard
            title="Total Accepted Suggestions"
            value={formatNumber(multiTeamData.reduce((sum, team) => sum + (team.accepted_suggestions || 0), 0))}
            helpText="Across all analyzed teams"
            infoTooltip="The total number of code suggestions that were accepted by all users across the analyzed teams"
          />
        </SimpleGrid>
        
        <Tabs colorScheme="blue" mb={6} isLazy>
          <TabList>
            <Tab>Team Metrics</Tab>
            <Tab>Suggestion Data</Tab>
            <Tab>Languages & Editors</Tab>
          </TabList>
          
          <TabPanels>
            {/* Team Metrics Tab */}
            <TabPanel p={0} pt={4}>
              <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mb={6}>
                <GridItem>
                  <ChartCard
                    title="Teams by Active Users"
                    description="Number of active users per team"
                    infoTooltip="Active users are those who have used GitHub Copilot at least once during the selected time period"
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={activeUsersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatNumber(value)} />
                        <Legend />
                        <Bar dataKey="activeUsers" fill={CHART_COLORS.primary} name="Active Users" />
                        <Bar dataKey="engagedUsers" fill={CHART_COLORS.secondary} name="Engaged Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </GridItem>
                
                <GridItem>
                  <ChartCard
                    title="Teams by Acceptance Rate"
                    description="Percentage of suggestions accepted by each team"
                    infoTooltip="Acceptance rate represents the percentage of GitHub Copilot suggestions that were accepted by developers on each team"
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={acceptanceRateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                        <Legend />
                        <Bar dataKey="acceptanceRate" fill={CHART_COLORS.tertiary} name="Acceptance Rate" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </GridItem>
              </Grid>
              
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white" overflowX="auto">
                <Heading size="md" mb={4}>Team Performance Metrics</Heading>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Team</Th>
                      <Th isNumeric>Active Users</Th>
                      <Th isNumeric>Engaged Users</Th>
                      <Th isNumeric>Acceptance Rate</Th>
                      <Th isNumeric>Accepted Lines</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {multiTeamData.map((teamData) => (
                      <Tr key={teamData.team_slug}>
                        <Td fontWeight="bold">{teamData.team_slug}</Td>
                        <Td isNumeric>{formatNumber(teamData.active_users || 0)}</Td>
                        <Td isNumeric>{formatNumber(teamData.engaged_users || 0)}</Td>
                        <Td isNumeric>
                          {formatPercentage(
                            teamData.total_suggestions > 0
                              ? (teamData.accepted_suggestions / teamData.total_suggestions) * 100
                              : 0
                          )}
                        </Td>
                        <Td isNumeric>{formatNumber(teamData.accepted_lines || 0)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
            
            {/* Suggestion Data Tab */}
            <TabPanel p={0} pt={4}>
              <Grid templateColumns={{ base: "1fr", lg: "1fr" }} gap={6} mb={6}>
                <GridItem>
                  <ChartCard
                    title="Teams by Copilot Suggestions"
                    description="Total and accepted suggestions per team"
                    infoTooltip="This chart compares the volume of GitHub Copilot suggestions across teams and shows what percentage of those suggestions were accepted"
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={teamSuggestionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              
              <Grid templateColumns={{ base: "1fr", lg: "1fr" }} gap={6} mb={6}>
                <GridItem>
                  <ChartCard
                    title="Teams by Accepted Lines of Code"
                    description="Lines of code accepted from Copilot suggestions"
                    infoTooltip="This chart shows the total number of lines of code from GitHub Copilot that were accepted by each team"
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={teamSuggestionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatNumber(value)} />
                        <Legend />
                        <Bar dataKey="acceptedLines" fill={CHART_COLORS.secondary} name="Accepted Lines of Code" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </GridItem>
              </Grid>
              
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white" overflowX="auto">
                <Heading size="md" mb={4}>Suggestion Metrics by Team</Heading>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Team</Th>
                      <Th isNumeric>Total Suggestions</Th>
                      <Th isNumeric>Accepted Suggestions</Th>
                      <Th isNumeric>Acceptance Rate</Th>
                      <Th isNumeric>Accepted Lines</Th>
                      <Th isNumeric>Avg. Lines per Suggestion</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {multiTeamData.map((teamData) => (
                      <Tr key={teamData.team_slug}>
                        <Td fontWeight="bold">{teamData.team_slug}</Td>
                        <Td isNumeric>{formatNumber(teamData.total_suggestions || 0)}</Td>
                        <Td isNumeric>{formatNumber(teamData.accepted_suggestions || 0)}</Td>
                        <Td isNumeric>
                          {formatPercentage(
                            teamData.total_suggestions > 0
                              ? (teamData.accepted_suggestions / teamData.total_suggestions) * 100
                              : 0
                          )}
                        </Td>
                        <Td isNumeric>{formatNumber(teamData.accepted_lines || 0)}</Td>
                        <Td isNumeric>
                          {teamData.accepted_suggestions > 0
                            ? (teamData.accepted_lines / teamData.accepted_suggestions).toFixed(2)
                            : "0.00"}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
            
            {/* Languages & Editors Tab */}
            <TabPanel p={0} pt={4}>
              <Grid templateColumns={{ base: "1fr", lg: "1fr" }} gap={6} mb={6}>
                <GridItem>
                  <ChartCard
                    title="Top Languages Across Teams"
                    description="Most used programming languages with Copilot"
                    infoTooltip="This chart shows the programming languages most commonly used with GitHub Copilot across all teams"
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={languagesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatNumber(value)} />
                        <Legend />
                        <Bar dataKey="totalAccepted" fill={CHART_COLORS.primary} name="Accepted Suggestions" />
                        <Bar dataKey="teams" fill={CHART_COLORS.tertiary} name="Number of Teams" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </GridItem>
              </Grid>
              
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
                <Heading size="md" mb={4}>Language and Editor Usage by Team</Heading>
                <Text mb={4}>Top languages and editors for each team based on accepted suggestions.</Text>
                
                <Divider mb={4} />
                
                {multiTeamData.map((teamData) => (
                  <Box key={teamData.team_slug} mb={6}>
                    <Heading size="sm" mb={2}>{teamData.team_slug}</Heading>
                    
                    {teamData.languages && teamData.languages.length > 0 ? (
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        <Box>
                          <Text fontWeight="medium" mb={2}>Top Languages:</Text>
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th>Language</Th>
                                <Th isNumeric>Accepted Suggestions</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {teamData.languages
                                .sort((a, b) => (b.total_acceptances || 0) - (a.total_acceptances || 0))
                                .slice(0, 3)
                                .map((lang) => (
                                  <Tr key={lang.name}>
                                    <Td>{lang.name}</Td>
                                    <Td isNumeric>{formatNumber(lang.total_acceptances || 0)}</Td>
                                  </Tr>
                                ))}
                            </Tbody>
                          </Table>
                        </Box>
                        
                        {teamData.editors && teamData.editors.length > 0 && (
                          <Box>
                            <Text fontWeight="medium" mb={2}>Top Editors:</Text>
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Editor</Th>
                                  <Th isNumeric>Accepted Suggestions</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {teamData.editors
                                  .sort((a, b) => (b.total_acceptances || 0) - (a.total_acceptances || 0))
                                  .slice(0, 3)
                                  .map((editor) => (
                                    <Tr key={editor.name}>
                                      <Td>{editor.name}</Td>
                                      <Td isNumeric>{formatNumber(editor.total_acceptances || 0)}</Td>
                                    </Tr>
                                  ))}
                              </Tbody>
                            </Table>
                          </Box>
                        )}
                      </SimpleGrid>
                    ) : (
                      <Text color="gray.500">No language or editor data available for this team.</Text>
                    )}
                    
                    <Divider mt={4} mb={4} />
                  </Box>
                ))}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    );
  }
  
  // If we don't have multi-team data, show a message that team selection is required
  if (!hasMultiTeamData) {
    return (
      <Box>
        <Heading size="lg" mb={6}>{reportTitle}</Heading>
        
        <Alert status="info" borderRadius="md" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle mb={2}>Team Data Required</AlertTitle>
            <AlertDescription>
              Please select at least one team from the filter above to view team comparison data.
            </AlertDescription>
          </Box>
        </Alert>
        
        <VStack align="start" spacing={4} p={5} bg="white" borderRadius="md" shadow="sm">
          <Text>
            This report requires team data to generate comparisons between teams.
          </Text>
          
          <Text>
            To view this report:
          </Text>
          
          <Box pl={4}>
            <Text>• Make sure a team is selected in the filter bar</Text>
            <Text>• Ensure your GitHub token has sufficient permissions</Text>
            <Text>• Configure multiple teams in the TEAMS_LIST config to enable comparison</Text>
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
              infoTooltip="This chart shows which programming languages have the highest number of accepted GitHub Copilot suggestions"
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
              infoTooltip="This chart shows which code editors are most commonly used with GitHub Copilot"
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
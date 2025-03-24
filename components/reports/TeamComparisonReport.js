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
  ComposedChart,
  Line,
} from 'recharts';
import ChartCard from '../ChartCard';
import { useCopilot } from '../../lib/CopilotContext';
import { CHART_COLORS } from '../../lib/config';
import { formatNumber, formatPercentage } from '../../lib/utils';

const TeamComparisonReport = () => {
  const { teamBreakdownData } = useCopilot();
  
  if (!teamBreakdownData || !teamBreakdownData.teams || teamBreakdownData.teams.length === 0) {
    return (
      <Box p={4}>
        <Text>No team breakdown data available. Please make sure you're authenticated and have selected a valid organization with teams using Copilot.</Text>
      </Box>
    );
  }

  // Process team data for charts
  const teamsWithData = teamBreakdownData.teams.filter(team => team.active_users >= 5);
  
  // Transform team data for charts
  const teamUserData = teamsWithData.map(team => ({
    name: team.team_slug,
    activeUsers: team.active_users,
    acceptanceRate: team.total_suggestions > 0 
      ? (team.accepted_suggestions / team.total_suggestions) * 100 
      : 0,
  }));

  // Transform team data for the combined chart
  const teamCombinedData = teamsWithData.map(team => ({
    name: team.team_slug,
    activeUsers: team.active_users,
    acceptedSuggestions: team.accepted_suggestions,
    totalSuggestions: team.total_suggestions,
    acceptanceRate: team.total_suggestions > 0 
      ? (team.accepted_suggestions / team.total_suggestions) * 100 
      : 0,
  }));
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Team Comparison Report</Heading>
      <Text mb={6}>This report compares Copilot usage across different teams in your organization, helping identify best practices and areas for improvement.</Text>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mb={6}>
        <GridItem>
          <ChartCard 
            title="Active Users by Team" 
            description="Number of active Copilot users in each team"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamUserData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Legend />
                <Bar dataKey="activeUsers" fill={CHART_COLORS.primary} name="Active Users" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>
        
        <GridItem>
          <ChartCard 
            title="Acceptance Rate by Team" 
            description="Percentage of suggestions accepted by each team"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamUserData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => formatPercentage(value)} />
                <Legend />
                <Bar dataKey="acceptanceRate" fill={CHART_COLORS.secondary} name="Acceptance Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>
      </Grid>

      <Grid templateColumns={{ base: "1fr" }} gap={6} mb={6}>
        <GridItem>
          <ChartCard 
            title="Combined Team Metrics" 
            description="Active users and acceptance rates across teams"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={teamCombinedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="acceptedSuggestions" fill={CHART_COLORS.primary} name="Accepted Suggestions" />
                <Bar yAxisId="left" dataKey="totalSuggestions" fill={CHART_COLORS.quaternary} name="Total Suggestions" />
                <Line yAxisId="right" type="monotone" dataKey="acceptanceRate" stroke={CHART_COLORS.tertiary} name="Acceptance Rate %" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </GridItem>
      </Grid>

      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
        <Heading size="md" mb={4}>Detailed Team Comparison</Heading>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Team</Th>
                <Th isNumeric>Active Users</Th>
                <Th isNumeric>Total Suggestions</Th>
                <Th isNumeric>Accepted Suggestions</Th>
                <Th isNumeric>Acceptance Rate</Th>
                <Th isNumeric>Lines of Code Accepted</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teamsWithData.map((team) => (
                <Tr key={team.team_slug}>
                  <Td>{team.team_slug}</Td>
                  <Td isNumeric>{team.active_users}</Td>
                  <Td isNumeric>{formatNumber(team.total_suggestions)}</Td>
                  <Td isNumeric>{formatNumber(team.accepted_suggestions)}</Td>
                  <Td isNumeric>
                    {formatPercentage(
                      team.total_suggestions > 0 
                        ? (team.accepted_suggestions / team.total_suggestions) * 100 
                        : 0
                    )}
                  </Td>
                  <Td isNumeric>{formatNumber(team.accepted_lines)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default TeamComparisonReport;
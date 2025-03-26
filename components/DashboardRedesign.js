import React, { useState } from 'react';
import {
  Box,
  Text,
  Heading,
  Flex,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  HStack,
  Icon,
  useColorModeValue,
  Button,
  Divider,
  Select,
  InputGroup,
  InputLeftElement,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tooltip,
} from '@chakra-ui/react';
import { 
  StarIcon, 
  TimeIcon, 
  InfoIcon, 
  SearchIcon, 
  ChevronDownIcon, 
  DownloadIcon,
  ViewIcon,
  RepeatIcon,
  SettingsIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
import { useCopilot } from '../lib/CopilotContext';
import { DATE_RANGES } from '../lib/config';
import { formatNumber, formatPercentage } from '../lib/utils';
import TimeNavigator from './TimeNavigator';
import MetricGaugeCard from './MetricGaugeCard';

/**
 * DashboardRedesign - A redesigned, modern dashboard layout
 * 
 * Features:
 * - Three-panel view system (Overview, Analysis, Optimization)
 * - Enhanced visualization components
 * - Interactive metrics and data relationship displays
 * - Actionable insights and recommendations
 */
const DashboardRedesign = () => {
  // Context and state
  const { 
    metrics, 
    dateRange, 
    setDateRange,
    orgData,
    isLoading
  } = useCopilot();
  
  const [compareWithPrevious, setCompareWithPrevious] = useState(false);
  const [activePanel, setActivePanel] = useState('overview');
  
  // UI Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const subtleBg = useColorModeValue('gray.50', 'gray.900');
  
  // Sample data (in real implementation, this would come from context)
  const generateTrendData = (points, trend = 'up', base = 50) => {
    const data = [];
    let value = base;
    
    for (let i = 0; i < points; i++) {
      if (trend === 'up') {
        value += Math.random() * 10;
      } else if (trend === 'down') {
        value -= Math.random() * 8;
      } else {
        value += Math.random() * 10 - 5;
      }
      // Ensure value doesn't go negative
      value = Math.max(value, 5);
      
      data.push({
        day: i + 1,
        value: Math.round(value),
        date: new Date(Date.now() - (points - i) * 86400000).toLocaleDateString(),
      });
    }
    return data;
  };
  
  // Sample data for the charts
  const userTrendData = generateTrendData(28, 'up', 30);
  const suggestionTrendData = generateTrendData(28, 'up', 200);
  const acceptanceTrendData = generateTrendData(28, 'flat', 75);
  const productivityTrendData = generateTrendData(28, 'up', 40);
  
  // Sample language distribution data
  const languageData = [
    { name: 'JavaScript', value: 35, color: '#F0DB4F' },
    { name: 'TypeScript', value: 25, color: '#3178C6' },
    { name: 'Python', value: 20, color: '#3776AB' },
    { name: 'Java', value: 10, color: '#007396' },
    { name: 'C#', value: 5, color: '#178600' },
    { name: 'Other', value: 5, color: '#6B7280' },
  ];
  
  // Sample team comparison data
  const teamData = [
    { name: 'Frontend', users: 12, acceptanceRate: 78, productivity: 85 },
    { name: 'Backend', users: 15, acceptanceRate: 72, productivity: 79 },
    { name: 'Mobile', users: 8, acceptanceRate: 80, productivity: 88 },
    { name: 'Data Science', users: 6, acceptanceRate: 68, productivity: 72 },
    { name: 'DevOps', users: 5, acceptanceRate: 65, productivity: 70 },
  ];
  
  // Sample recommendation data
  const recommendations = [
    {
      id: 1,
      title: 'Promote Copilot Chat adoption',
      description: 'Copilot Chat usage is 20% below similar organizations. Promote its usage to improve productivity.',
      impact: 8,
      effort: 'Medium',
    },
    {
      id: 2,
      title: 'Python acceptance rate needs attention',
      description: 'Acceptance rate for Python suggestions is 15% below average. Consider training sessions.',
      impact: 7,
      effort: 'Medium',
    },
    {
      id: 3,
      title: 'Mobile team showing best practices',
      description: 'Mobile team has highest acceptance and productivity. Document their workflows as best practices.',
      impact: 6,
      effort: 'Low',
    },
  ];
  
  // Get real metrics if available, otherwise use sample data
  const activeUsers = metrics?.totalActiveUsers || 120;
  const acceptanceRate = metrics?.acceptanceRate || 75;
  const acceptedSuggestions = metrics?.acceptedSuggestions || 1450;
  const totalSuggestions = metrics?.totalSuggestions || 1950;
  const acceptedLines = metrics?.acceptedLines || 32500;
  
  // Current time period for display - always showing all available data
  const getCurrentTimePeriod = () => {
    return 'All Available Data (28 Days)';
  };
  
  return (
    <Box>
      {/* Header with tabs for different dashboard views */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="blue.600">
          Copilot Impact Center
        </Heading>
        
        <HStack spacing={4}>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="outline">
              Actions
            </MenuButton>
            <MenuList>
              <MenuItem icon={<DownloadIcon />}>Export report</MenuItem>
              <MenuItem icon={<ViewIcon />}>Share dashboard</MenuItem>
              <MenuItem icon={<SettingsIcon />}>Settings</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      
      {/* Time display - always shows all available data */}
      <TimeNavigator 
        dateRange={dateRange}
        setDateRange={() => {}} // No-op function since we don't allow changing date range
        compareWithPrevious={compareWithPrevious}
        setCompareWithPrevious={setCompareWithPrevious}
        onRefresh={() => console.log('Refreshing data...')}
        isLoading={isLoading}
      />
      
      {/* Main dashboard panel tabs */}
      <Tabs 
        variant="soft-rounded" 
        colorScheme="blue" 
        mb={6}
        onChange={(index) => {
          const panels = ['overview', 'analysis', 'optimization'];
          setActivePanel(panels[index]);
        }}
      >
        <TabList mb={4}>
          <Tab _selected={{ bg: 'blue.50', color: 'blue.600' }}>Overview Hub</Tab>
          <Tab _selected={{ bg: 'purple.50', color: 'purple.600' }}>Analysis Center</Tab>
          <Tab _selected={{ bg: 'orange.50', color: 'orange.600' }}>Optimization Lab</Tab>
        </TabList>
        
        <TabPanels>
          {/* OVERVIEW PANEL */}
          <TabPanel p={0}>
            {/* Key metrics section */}
            <Heading size="md" mb={4}>Key Performance Indicators</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
              <MetricGaugeCard
                title="Active Users"
                value={activeUsers}
                formattedValue={formatNumber(activeUsers)}
                target={150}
                min={0}
                max={200}
                category="usage"
                timeFrame={dateRange}
                timeFrameLabel={getCurrentTimePeriod()}
                change={12}
                changeDirection="increase"
                impactScore={9}
                description="Total users who received and interacted with Copilot suggestions."
                infoTooltip="Active users are those who had at least one Copilot suggestion shown to them during this period."
              />
              
              <MetricGaugeCard
                title="Acceptance Rate"
                value={acceptanceRate}
                formattedValue={`${acceptanceRate}%`}
                suffix="accepted"
                target={80}
                min={0}
                max={100}
                category="acceptance"
                timeFrame={dateRange}
                timeFrameLabel={getCurrentTimePeriod()}
                change={-3}
                changeDirection="decrease"
                impactScore={8}
                description="Percentage of displayed suggestions that were accepted by users."
                infoTooltip="Acceptance Rate = (Accepted Suggestions ÷ Total Suggestions) × 100%"
                colorScheme="green"
              />
              
              <MetricGaugeCard
                title="Accepted Lines"
                value={acceptedLines}
                formattedValue={formatNumber(acceptedLines)}
                suffix="lines"
                target={35000}
                min={0}
                max={50000}
                category="productivity"
                timeFrame={dateRange}
                timeFrameLabel={getCurrentTimePeriod()}
                change={18}
                changeDirection="increase"
                impactScore={7}
                description="Total lines of code accepted from Copilot suggestions."
                infoTooltip="Each line of code that was generated by Copilot and accepted by a user counts as one line."
                colorScheme="purple"
              />
              
              <MetricGaugeCard
                title="Time Saved"
                value={Math.round(acceptedLines / 30)}
                formattedValue={`${Math.round(acceptedLines / 30)}h`}
                suffix="hours"
                target={1200}
                min={0}
                max={1500}
                category="roi"
                timeFrame={dateRange}
                timeFrameLabel={getCurrentTimePeriod()}
                change={15}
                changeDirection="increase"
                impactScore={9}
                description="Estimated dev time saved based on accepted suggestions."
                infoTooltip="Based on industry average of 30 lines of code per hour for a typical developer."
                colorScheme="orange"
              />
            </SimpleGrid>
            
            {/* Trend charts section */}
            <Heading size="md" mb={4}>Trend Analysis</Heading>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
              <Box
                p={5}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                bg={bgColor}
                boxShadow="sm"
                height="350px"
              >
                <Flex justify="space-between" mb={4}>
                  <Heading size="sm">User Engagement Trend</Heading>
                  <Badge colorScheme="blue" px={2} py={1} borderRadius="full">
                    {getCurrentTimePeriod()}
                  </Badge>
                </Flex>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={userTrendData}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        // Only show every 7th day for readability
                        const idx = userTrendData.findIndex(d => d.date === value);
                        return idx % 7 === 0 ? value : '';
                      }}
                    />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value) => [`${value} users`, 'Active Users']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#2563EB" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              
              <Box
                p={5}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                bg={bgColor}
                boxShadow="sm"
                height="350px"
              >
                <Flex justify="space-between" mb={4}>
                  <Heading size="sm">Acceptance Rate Trend</Heading>
                  <Badge colorScheme="green" px={2} py={1} borderRadius="full">
                    {getCurrentTimePeriod()}
                  </Badge>
                </Flex>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={acceptanceTrendData}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const idx = acceptanceTrendData.findIndex(d => d.date === value);
                        return idx % 7 === 0 ? value : '';
                      }}
                    />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip 
                      formatter={(value) => [`${value}%`, 'Acceptance Rate']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </SimpleGrid>
            
            {/* Distribution section */}
            <Heading size="md" mb={4}>Usage Distribution</Heading>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>
              <Box
                p={5}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                bg={bgColor}
                boxShadow="sm"
                height="300px"
              >
                <Heading size="sm" mb={4}>Language Distribution</Heading>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={languageData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {languageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              
              <Box
                p={5}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                bg={bgColor}
                boxShadow="sm"
                gridColumn={{ lg: "span 2" }}
              >
                <Heading size="sm" mb={4}>Team Performance</Heading>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={teamData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <RechartsTooltip />
                    <Bar dataKey="acceptanceRate" name="Acceptance Rate (%)" fill="#10B981" />
                    <Bar dataKey="productivity" name="Productivity Score" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </SimpleGrid>
          </TabPanel>
          
          {/* ANALYSIS PANEL - Simplified for example */}
          <TabPanel p={0}>
            <Heading size="md" mb={4}>Advanced Analysis</Heading>
            <Text mb={6}>
              This panel would contain more detailed analysis tools, comparative views, and
              drill-down capabilities for deeper investigation of Copilot usage patterns.
            </Text>
            
            <Flex 
              justify="center" 
              align="center" 
              bg={subtleBg} 
              p={12} 
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
              flexDirection="column"
              gap={4}
            >
              <InfoIcon boxSize={12} color="purple.400" />
              <Text fontWeight="medium" fontSize="lg">Analysis Center components would be built here</Text>
              <Text color={mutedTextColor} textAlign="center" maxW="600px">
                This section would include detailed breakdowns by team, language, time periods, 
                and allow for custom comparisons and advanced filtering.
              </Text>
            </Flex>
          </TabPanel>
          
          {/* OPTIMIZATION PANEL - Simplified for example */}
          <TabPanel p={0}>
            <Heading size="md" mb={4}>AI-Powered Recommendations</Heading>
            <Text mb={6}>
              Based on your usage patterns, these recommendations can help improve your team's productivity with Copilot.
            </Text>
            
            {recommendations.map((rec) => (
              <Flex 
                key={rec.id}
                p={5}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                bg={bgColor}
                boxShadow="sm"
                mb={4}
                align="center"
                justify="space-between"
              >
                <Flex direction="column" maxW="70%">
                  <Flex align="center" gap={2} mb={1}>
                    <Heading size="sm">{rec.title}</Heading>
                    <Badge colorScheme="orange" px={2} py={0.5} borderRadius="full">
                      {rec.effort} Effort
                    </Badge>
                  </Flex>
                  <Text fontSize="sm" color={mutedTextColor}>{rec.description}</Text>
                </Flex>
                
                <Flex align="center" gap={4}>
                  <Flex 
                    direction="column" 
                    align="center" 
                    bg="orange.50" 
                    p={2} 
                    borderRadius="md"
                    minW="60px"
                  >
                    <Flex align="center" gap={1}>
                      <Icon as={StarIcon} color="orange.500" boxSize={3} />
                      <Text fontWeight="bold" fontSize="md" color="orange.500">
                        {rec.impact}/10
                      </Text>
                    </Flex>
                    <Text fontSize="xs" color={mutedTextColor}>
                      Impact
                    </Text>
                  </Flex>
                  
                  <Button 
                    rightIcon={<ChevronRightIcon />} 
                    colorScheme="orange" 
                    size="sm"
                  >
                    Implement
                  </Button>
                </Flex>
              </Flex>
            ))}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default DashboardRedesign;
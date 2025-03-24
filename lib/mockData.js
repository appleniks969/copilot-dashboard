// Mock data for GitHub Copilot Usage Dashboard

// Organization-level mock data
export const mockOrgData = {
  active_users: 125,
  total_suggestions: 32456,
  accepted_suggestions: 24342,
  accepted_lines: 98456,
  language_breakdown: {
    'JavaScript': 8765,
    'TypeScript': 7654,
    'Python': 5432,
    'Java': 3456,
    'Go': 2345,
    'Ruby': 1234,
    'C#': 987,
    'PHP': 876,
    'Other': 543,
  },
  editor_breakdown: {
    'VS Code': 16543,
    'JetBrains': 5432,
    'Visual Studio': 1543,
    'Vim/Neovim': 543,
    'Other': 281,
  },
};

// Team-level mock data
export const mockTeamData = {
  team_slug: 'engineers',
  active_users: 45,
  total_suggestions: 12765,
  accepted_suggestions: 9876,
  accepted_lines: 42567,
};

// Team breakdown mock data
export const mockTeamBreakdownData = {
  teams: [
    {
      team_slug: 'engineers',
      active_users: 45,
      total_suggestions: 12765,
      accepted_suggestions: 9876,
      accepted_lines: 42567,
    },
    {
      team_slug: 'data-scientists',
      active_users: 32,
      total_suggestions: 9876,
      accepted_suggestions: 7654,
      accepted_lines: 32456,
    },
    {
      team_slug: 'frontend',
      active_users: 28,
      total_suggestions: 8765,
      accepted_suggestions: 6543,
      accepted_lines: 27654,
    },
    {
      team_slug: 'backend',
      active_users: 22,
      total_suggestions: 6543,
      accepted_suggestions: 4321,
      accepted_lines: 19876,
    },
    {
      team_slug: 'devops',
      active_users: 12,
      total_suggestions: 3456,
      accepted_suggestions: 2345,
      accepted_lines: 9876,
    },
    {
      team_slug: 'mobile',
      active_users: 8,
      total_suggestions: 2345,
      accepted_suggestions: 1234,
      accepted_lines: 5432,
    },
  ],
};
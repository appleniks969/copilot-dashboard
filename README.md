# GitHub Copilot Usage Dashboard

A comprehensive dashboard for tracking and analyzing GitHub Copilot usage metrics across your organization. This dashboard provides insights into Copilot's adoption, productivity impact, code quality, and overall value to your organization.

## Features

- **User Engagement Reports**: Track active users, suggestions delivered, and acceptance rates.
- **Productivity Improvement Analysis**: Assess how Copilot impacts development speed and efficiency.
- **ROI Calculation**: Quantify the financial return on your Copilot investment.
- **Language & Editor Usage**: Identify which programming languages and editors Copilot is most used with.
- **Team Comparison**: Compare Copilot usage across different teams in your organization.

## Tech Stack

- **Next.js**: React framework for the frontend
- **Chakra UI**: Component library for UI
- **Recharts**: Charting library for data visualization
- **Axios**: HTTP client for API requests
- **GitHub Copilot API**: Data source for Copilot usage metrics

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn
- GitHub organization with Copilot licenses
- GitHub Personal Access Token with `admin:org` and `repo` scopes

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd copilot-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Authentication

When you first open the dashboard, you'll be prompted to enter your GitHub Personal Access Token. This token is used to authenticate with the GitHub API and fetch Copilot usage data.

The token is stored in your browser's localStorage and is never sent to any server other than GitHub's API.

## Usage

1. Enter your GitHub Personal Access Token.
2. Select your organization and team (optional).
3. Choose the date range for the data (7, 14, or 28 days).
4. Enter the total number of licensed Copilot users for ROI calculations.
5. Navigate between the different report tabs to view various metrics and insights.

## API Documentation

This dashboard uses the [GitHub Copilot Usage Metrics API](https://docs.github.com/en/rest/copilot/copilot-usage?apiVersion=2022-11-28#get-a-summary-of-copilot-usage-for-a-team) to fetch usage data. The API provides metrics such as:

- Active users
- Suggestions delivered
- Acceptance rates
- Lines of code accepted
- Breakdowns by team, language, editor, and feature

## License

[MIT](LICENSE)

## Acknowledgements

- GitHub for providing the Copilot Usage Metrics API
- [Recharts](https://recharts.org/) for the charting library
- [Chakra UI](https://chakra-ui.com/) for the UI components# copilot-dashboard

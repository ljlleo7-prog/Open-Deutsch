# Open-Deutsch

Open-Deutsch is an open-source, interactive platform designed to help beginners and intermediate learners master the German language. By leveraging AI-generated content and modern web technologies, it provides a dynamic and personalized learning experience.

## Features

- **Interactive Exercises**: Practice grammar, vocabulary, and sentence structure with immediate feedback.
- **AI-Generated Reading Material**: Access a limitless supply of reading comprehension texts tailored to your proficiency level (A2, B1, B2).
- **Diverse Topics**: Explore content across various interests, including:
  - German History (with educational context)
  - Formula 1
  - Aviation
  - Transportation & Logistics
  - Technology & Innovation
  - General News
- **Smart Difficulty Adjustment**: Reading materials come with complexity scores to help you find the right challenge.
- **Progress Tracking**: Monitor your learning journey with detailed statistics and compete on the leaderboard.
- **Responsive Design**: Learn on the go with a fully mobile-friendly interface.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend/Database**: Supabase
- **AI Integration**: OpenAI / Local LLM for content generation
- **State Management**: React Context & Hooks

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/open-deutsch.git
   cd open-deutsch
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Supabase and API credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

To deploy to GitHub Pages:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

## Database Reference

See [DATABASE_REFERENCE.md](DATABASE_REFERENCE.md) for detailed schema information and usage guidelines.

## Disclaimer

(c) 2026 GeeksProductionStudio. For Education Only.

This project uses AI to generate educational content. While we strive for accuracy, some texts may be adapted for learning purposes. Historical content is presented for educational context and may reflect perspectives that do not align with modern values.

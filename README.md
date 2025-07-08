# SupportZen Dashboard

Welcome to SupportZen, a comprehensive ticketing dashboard designed for customer technical support. This application is built with Next.js, ShadCN UI, and Genkit to provide a modern, feature-rich, and AI-enhanced experience for managing support operations.

## Features

### 1. Main Dashboard
- **At-a-Glance Statistics:** Key metrics are displayed in stat cards, including Open Tickets, Tickets Resolved Today, Average Response Time, and Total Earnings.
- **Recent Activity:** A table shows the most recent support tickets for a quick overview.

### 2. Ticket Management
- **Full CRUD Operations:** Create, read, update, and delete support tickets through a user-friendly interface.
- **Detailed Ticket View:** A dialog allows for detailed entry and editing of ticket information, including title, description, agent response, and relevant links.
- **Multi-Category Tagging:** Assign one or more categories to tickets, such as `Technical Issue`, `Billing & Payments`, or `Account Issue`.
- **AI-Powered Status Suggestions:** A Genkit-powered feature analyzes the ticket's description and suggests the most likely status (`Open`, `In Progress`, `Resolved`), speeding up ticket processing.

### 3. Shift Management
- **Schedule & Track Shifts:** Create and manage work shifts with specific start times.
- **Active Shift Timer:** A live timer in the header tracks the duration of the currently active shift.
- **Shift History:** Completed shifts are stored in an organized, expandable accordion view.
- **Per-Shift Ticket View:** View all tickets that were worked on during a specific completed shift.
- **In-Context Editing:** Edit tickets directly from the completed shift view to update metrics or statuses after the fact.

### 4. Analytics
- **Visual Data Insights:** The analytics page provides charts to visualize ticket data.
- **Tickets by Status:** A pie chart shows the current distribution of tickets by their status.
- **Resolution Over Time:** A line chart tracks the number of tickets created versus resolved over the past week.

### 5. Earnings Calculator
- **Performance-Based Earnings:** Automatically calculates total earnings based on the number of resolved and closed tickets.
- **Currency Conversion:** Includes a simple currency converter to view earnings in a local currency, with a user-configurable exchange rate.

### 6. Advanced Settings
- **Profile Customization:** Change your profile picture.
- **Appearance:**
  - **Theme:** Switch between Light, Dark, and System-based themes.
  - **Time Format:** Toggle between 12-hour and 24-hour time displays throughout the app.
- **Data Management:**
  - **Export Data:** Export all tickets, shifts, and settings to a JSON file for backup.
  - **Import Data:** Import data from a previously exported JSON file. The importer is designed to be backwards-compatible, mapping older data formats to the current structure.
  - **Clear Data:** A "Wipe Data" function with a confirmation prompt allows you to reset the entire dashboard to a fresh state.

## How It Works

This application is architected using modern web development practices and tools.

- **Framework:** **Next.js 15** with the App Router is used for its performance benefits and server-side rendering capabilities.
- **UI Components:** The user interface is built with **ShadCN UI**, a collection of accessible and reusable components, styled with **Tailwind CSS**.
- **State Management:** Application-wide state is managed using **React Context API**. Separate providers (`TicketProvider`, `ShiftProvider`, `SettingsProvider`) handle the logic and data for their respective domains.
- **Data Persistence:** All user data, including tickets, shifts, and settings, is persisted in the browser's **`localStorage`**. This ensures that your data remains available across sessions without needing a backend database.
- **Generative AI:** The "Suggest Status" feature is powered by **Google's Gemini model**, integrated via **Genkit**. The flow is defined in `src/ai/flows/suggestStatus.ts`.
- **Charting:** Data visualizations on the Analytics page are created using the **Recharts** library, integrated as ShadCN Chart components.
- **Forms:** All forms and dialogs use **React Hook Form** for state management and **Zod** for robust schema validation.

import type { Ticket, Shift } from './types';

export const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'Screen Flickering After Update',
    description: "User's screen is flickering after the latest update. Seems to be a driver issue.",
    agentResponse: 'Rolled back graphics driver to previous version. Advised user to wait for patched driver.',
    link: 'https://support.example.com/kb/12345',
    aiToolsUsed: ['Gemini', 'Copilot'],
    status: 'In Progress',
    createdAt: new Date(2023, 10, 28, 10, 0),
  },
  {
    id: 'TKT-002',
    title: 'Cannot Connect to Office Printer',
    description: 'Cannot connect to the new office printer. Getting a network error.',
    status: 'Open',
    createdAt: new Date(2023, 10, 28, 9, 30),
  },
  {
    id: 'TKT-003',
    title: 'Application Crashes on Startup',
    description: 'Application crashes on startup. Log files attached.',
    agentResponse: 'Identified a memory leak in the startup module. A fix has been deployed.',
    link: 'https://github.com/org/repo/issues/101',
    aiToolsUsed: ['ChatGPT'],
    status: 'Resolved',
    createdAt: new Date(2023, 10, 27, 15, 0),
  },
  {
    id: 'TKT-004',
    title: 'Password Reset Link Expired',
    description: 'Password reset link not working. User is locked out.',
    status: 'Open',
    createdAt: new Date(2023, 10, 28, 11, 0),
  },
  {
    id: 'TKT-005',
    title: 'Login Server Deployment',
    description: 'The issue with the login server has been identified and a patch is being deployed.',
    status: 'In Progress',
    createdAt: new Date(2023, 10, 28, 14, 20),
  },
  {
    id: 'TKT-006',
    title: 'Customer Data Export Failed',
    description: 'Customer data export failed. The root cause was a timeout in the database query.',
    agentResponse: 'Optimized the database query and increased the timeout limit. Export is now successful.',
    aiToolsUsed: ['Perplexity'],
    status: 'Closed',
    createdAt: new Date(2023, 10, 26, 18, 0),
  },
  {
    id: 'TKT-007',
    title: 'UI Bug in Mobile Dashboard',
    description: 'UI bug on the dashboard where the side menu disappears on mobile.',
    agentResponse: 'Fixed the CSS for mobile viewports. The menu is now responsive.',
    link: 'https://github.com/org/repo/pull/243',
    status: 'Resolved',
    createdAt: new Date(2023, 10, 28, 13, 0),
  },
];

export const mockShifts: Shift[] = [
    { id: 'SH-1', name: 'Morning Shift', startTime: '08:00', endTime: '16:00', assigned: 'Alice, Bob' },
    { id: 'SH-2', name: 'Evening Shift', startTime: '16:00', endTime: '00:00', assigned: 'Charlie, Diana' },
    { id: 'SH-3', name: 'Night Shift', startTime: '00:00', endTime: '08:00', assigned: 'Ethan' },
    { id: 'SH-4', name: 'Weekend On-Call', startTime: '10:00', endTime: '18:00', assigned: 'Frank' },
];

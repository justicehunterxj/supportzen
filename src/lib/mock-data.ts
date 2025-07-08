import type { Ticket, Shift } from './types';

export const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'Screen Flickering After Update',
    description: "User's screen is flickering after the latest update. Seems to be a driver issue.",
    category: ['Technical Issue'],
    agentResponse: 'Rolled back graphics driver to previous version. Advised user to wait for patched driver.',
    link: 'https://support.example.com/kb/12345',
    aiToolsUsed: ['Gemini', 'Copilot'],
    status: 'In Progress',
    createdAt: new Date(),
    shiftId: 'SH-2',
  },
  {
    id: 'TKT-002',
    title: 'Cannot Connect to Office Printer',
    description: 'Cannot connect to the new office printer. Getting a network error.',
    category: ['Technical Issue'],
    status: 'Open',
    createdAt: new Date(),
  },
  {
    id: 'TKT-003',
    title: 'Application Crashes on Startup',
    description: 'Application crashes on startup. Log files attached.',
    category: ['Technical Issue'],
    agentResponse: 'Identified a memory leak in the startup module. A fix has been deployed.',
    link: 'https://github.com/org/repo/issues/101',
    aiToolsUsed: ['ChatGPT'],
    status: 'Resolved',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    shiftId: 'SH-1',
  },
  {
    id: 'TKT-004',
    title: 'Password Reset Link Expired',
    description: 'Password reset link not working. User is locked out.',
    category: ['Account Issue'],
    status: 'Open',
    createdAt: new Date(),
  },
  {
    id: 'TKT-005',
    title: 'Login Server Deployment',
    description: 'The issue with the login server has been identified and a patch is being deployed.',
    category: ['Technical Issue'],
    status: 'In Progress',
    createdAt: new Date(),
    shiftId: 'SH-2',
  },
  {
    id: 'TKT-006',
    title: 'Customer Data Export Failed',
    description: 'Customer data export failed. The root cause was a timeout in the database query.',
    category: ['Technical Issue', 'Billing & Payments'],
    agentResponse: 'Optimized the database query and increased the timeout limit. Export is now successful.',
    aiToolsUsed: ['Perplexity'],
    status: 'Closed',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    shiftId: 'SH-1',
  },
  {
    id: 'TKT-007',
    title: 'UI Bug in Mobile Dashboard',
    description: 'UI bug on the dashboard where the side menu disappears on mobile.',
    category: ['Feedback'],
    agentResponse: 'Fixed the CSS for mobile viewports. The menu is now responsive.',
    link: 'https://github.com/org/repo/pull/243',
    status: 'Resolved',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    shiftId: 'SH-1',
  },
];

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const completedStartedAt = new Date(yesterday);
completedStartedAt.setHours(8, 0, 0, 0);
const completedEndedAt = new Date(yesterday);
completedEndedAt.setHours(16, 0, 0, 0);

const activeStartedAt = new Date();
activeStartedAt.setHours(activeStartedAt.getHours() - 1);


export const mockShifts: Shift[] = [
    { id: 'SH-1', name: 'Yesterday Morning Shift', startTime: '08:00', endTime: '16:00', status: 'Completed', startedAt: completedStartedAt, endedAt: completedEndedAt },
    { id: 'SH-2', name: 'Today Evening Shift', startTime: '16:00', status: 'Active', startedAt: activeStartedAt },
    { id: 'SH-3', name: 'Tomorrow Night Shift', startTime: '00:00', status: 'Pending' },
    { id: 'SH-4', name: 'Weekend On-Call', startTime: '10:00', status: 'Pending' },
];

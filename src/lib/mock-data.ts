import type { Ticket, Shift } from './types';

export const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    description: "User's screen is flickering after the latest update. Seems to be a driver issue.",
    assignee: { name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    status: 'In Progress',
    createdAt: new Date(2023, 10, 28, 10, 0),
  },
  {
    id: 'TKT-002',
    description: 'Cannot connect to the new office printer. Getting a network error.',
    assignee: { name: 'Bob Williams', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
    status: 'Open',
    createdAt: new Date(2023, 10, 28, 9, 30),
  },
  {
    id: 'TKT-003',
    description: 'Application crashes on startup. Log files attached.',
    assignee: { name: 'Charlie Brown', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
    status: 'Resolved',
    createdAt: new Date(2023, 10, 27, 15, 0),
  },
  {
    id: 'TKT-004',
    description: 'Password reset link not working. User is locked out.',
    assignee: { name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    status: 'Open',
    createdAt: new Date(2023, 10, 28, 11, 0),
  },
  {
    id: 'TKT-005',
    description: 'The issue with the login server has been identified and a patch is being deployed.',
    assignee: { name: 'Diana Miller', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' },
    status: 'In Progress',
    createdAt: new Date(2023, 10, 28, 14, 20),
  },
  {
    id: 'TKT-006',
    description: 'Customer data export failed. The root cause was a timeout in the database query.',
    assignee: { name: 'Ethan Davis', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d' },
    status: 'Closed',
    createdAt: new Date(2023, 10, 26, 18, 0),
  },
  {
    id: 'TKT-007',
    description: 'UI bug on the dashboard where the side menu disappears on mobile.',
    assignee: { name: 'Bob Williams', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
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

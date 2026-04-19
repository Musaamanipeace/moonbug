export type CalendarEvent = {
  date: string; // YYYY-MM-DD
  title: string;
  category: 'holiday' | 'cosmic';
};

export const defaultEvents: CalendarEvent[] = [
  { date: '2024-01-01', title: "New Year's Day", category: 'holiday' },
  { date: '2024-01-04', title: 'Quadrantids Meteor Shower', category: 'cosmic' },
  { date: '2024-07-04', title: 'Independence Day', category: 'holiday' },
  { date: '2024-08-12', title: 'Perseids Meteor Shower', category: 'cosmic' },
  { date: '2024-10-31', title: 'Halloween', category: 'holiday' },
  { date: '2024-12-25', title: 'Christmas Day', category: 'holiday' },
  { date: '2024-04-08', title: 'Total Solar Eclipse', category: 'cosmic' },
  { date: '2024-03-25', title: 'Penumbral Lunar Eclipse', category: 'cosmic' },
];

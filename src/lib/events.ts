export type CalendarEvent = {
  date: string; // YYYY-MM-DD
  title: string;
  category: 'holiday' | 'cosmic';
  description: string;
  link?: string;
};

export const defaultEvents: CalendarEvent[] = [
  { date: '2024-01-01', title: "New Year's Day", category: 'holiday', description: "The first day of the Gregorian calendar year." },
  { date: '2024-01-04', title: 'Quadrantids Meteor Shower', category: 'cosmic', description: "One of the best annual meteor showers, peaking in early January.", link: "https://en.wikipedia.org/wiki/Quadrantids" },
  { date: '2024-03-20', title: 'March Equinox', category: 'cosmic', description: 'Marks the beginning of spring in the Northern Hemisphere.', link: "https://en.wikipedia.org/wiki/Equinox" },
  { date: '2024-04-08', title: 'Total Solar Eclipse', category: 'cosmic', description: 'A rare total solar eclipse visible across North America.', link: "https://en.wikipedia.org/wiki/Solar_eclipse_of_April_8,_2024" },
  { date: '2024-07-04', title: 'Independence Day', category: 'holiday', description: 'Federal holiday in the United States commemorating the Declaration of Independence.' },
  { date: '2024-08-12', title: 'Perseids Meteor Shower', category: 'cosmic', description: "One of the most plentiful showers with 50-100 meteors seen per hour.", link: "https://en.wikipedia.org/wiki/Perseids" },
  { date: '2024-09-22', title: 'September Equinox', category: 'cosmic', description: 'Marks the beginning of autumn in the Northern Hemisphere.', link: "https://en.wikipedia.org/wiki/Equinox" },
  { date: '2024-10-31', title: 'Halloween', category: 'holiday', description: 'A celebration observed in many countries on the eve of the Western Christian feast of All Hallows\' Day.' },
  { date: '2024-11-28', title: 'Thanksgiving Day', category: 'holiday', description: 'A national holiday celebrated in the United States, traditionally a day of giving thanks for the blessing of the harvest.' },
  { date: '2024-12-14', title: 'Geminids Meteor Shower', category: 'cosmic', description: 'Considered by many to be the best meteor shower in the heavens.', link: "https://en.wikipedia.org/wiki/Geminids" },
  { date: '2024-12-21', title: 'December Solstice', category: 'cosmic', description: 'The shortest day of the year in the Northern Hemisphere.', link: "https://en.wikipedia.org/wiki/Winter_solstice" },
  { date: '2024-12-25', title: 'Christmas Day', category: 'holiday', description: 'An annual festival commemorating the birth of Jesus Christ.' },
];


export type HistoricalEvent = {
  gregorianDate: string; // YYYY-MM-DD
  title: string;
  description: string;
  category: 'Humanity' | 'Science' | 'Conflict' | 'Exploration' | 'Extinction';
};

export const historicalEvents: HistoricalEvent[] = [
    {
        gregorianDate: '1969-07-20',
        title: 'Apollo 11 Moon Landing',
        description: 'Humans first walk on the Moon as part of the Apollo 11 mission.',
        category: 'Exploration'
    },
    {
        gregorianDate: '1914-07-28',
        title: 'Beginning of World War I',
        description: 'Austria-Hungary declares war on Serbia, beginning the Great War.',
        category: 'Conflict'
    },
    {
        gregorianDate: '1859-11-24',
        title: 'On the Origin of Species Published',
        description: 'Charles Darwin publishes his groundbreaking work on evolutionary biology.',
        category: 'Science'
    },
    {
        gregorianDate: '1989-11-09',
        title: 'Fall of the Berlin Wall',
        description: 'The border separating East and West Berlin is opened, symbolizing the end of the Cold War.',
        category: 'Conflict'
    },
    {
        gregorianDate: '1492-10-12',
        title: 'Columbus Reaches the Americas',
        description: 'Christopher Columbus makes his first landing in the New World, initiating an era of exploration.',
        category: 'Exploration'
    },
     {
        gregorianDate: '1990-04-24',
        title: 'Hubble Space Telescope Deployed',
        description: 'The Hubble Space Telescope is deployed from the Space Shuttle Discovery, revolutionizing astronomy.',
        category: 'Science'
    },
    {
        gregorianDate: '1776-07-04',
        title: 'U.S. Declaration of Independence',
        description: 'The Second Continental Congress formally declares independence from Great Britain.',
        category: 'Humanity'
    },
    {
        gregorianDate: '0066-00-00',
        title: 'Chicxulub Impactor',
        description: 'An asteroid impact event that led to a mass extinction, including non-avian dinosaurs.',
        category: 'Extinction'
    }
];

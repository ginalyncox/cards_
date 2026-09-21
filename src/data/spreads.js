// Spread layouts. Positions carry a grid slot so the board lays out in CSS grid.

export const SPREADS = [
  {
    id: 'one',
    name: 'Daily Card',
    blurb: 'One card for the shape of the day.',
    cols: 1,
    positions: [{ label: 'Today', meaning: 'The energy to work with, and what to watch for.', col: 1, row: 1 }],
  },
  {
    id: 'three',
    name: 'Past / Present / Future',
    blurb: 'The classic three-card line.',
    cols: 3,
    positions: [
      { label: 'Past', meaning: 'What has been shaping this — the ground you are standing on.', col: 1, row: 1 },
      { label: 'Present', meaning: 'Where the situation actually is right now.', col: 2, row: 1 },
      { label: 'Future', meaning: 'Where it tends if nothing changes.', col: 3, row: 1 },
    ],
  },
  {
    id: 'situation',
    name: 'Situation / Action / Outcome',
    blurb: 'Three cards for a decision you have to make.',
    cols: 3,
    positions: [
      { label: 'Situation', meaning: 'The honest state of things, stripped of story.', col: 1, row: 1 },
      { label: 'Action', meaning: 'What is yours to do about it.', col: 2, row: 1 },
      { label: 'Outcome', meaning: 'What that action tends to produce.', col: 3, row: 1 },
    ],
  },
  {
    id: 'horseshoe',
    name: 'Horseshoe',
    blurb: 'Seven cards for a situation with moving parts.',
    cols: 7,
    positions: [
      { label: 'The Past', meaning: 'What led here.', col: 1, row: 1 },
      { label: 'The Present', meaning: 'Where it stands.', col: 2, row: 1 },
      { label: 'Hidden Influences', meaning: 'What is acting on this out of sight.', col: 3, row: 1 },
      { label: 'You', meaning: 'Your own part in it — attitude, blind spot, contribution.', col: 4, row: 1 },
      { label: 'Others', meaning: 'How the people involved are actually behaving.', col: 5, row: 1 },
      { label: 'Advice', meaning: 'The most useful move available.', col: 6, row: 1 },
      { label: 'Likely Outcome', meaning: 'Where this lands on the current course.', col: 7, row: 1 },
    ],
  },
  {
    id: 'celtic',
    name: 'Celtic Cross',
    blurb: 'Ten cards. The deep reading — give it time.',
    cols: 4,
    positions: [
      { label: 'The Heart', meaning: 'The core of the matter.', col: 2, row: 2 },
      { label: 'The Crossing', meaning: 'What challenges or complicates it.', col: 2, row: 2, cross: true },
      { label: 'The Foundation', meaning: 'The root beneath the situation.', col: 2, row: 3 },
      { label: 'The Recent Past', meaning: 'What is passing out of the picture.', col: 1, row: 2 },
      { label: 'The Crown', meaning: 'What is possible — the best available outcome.', col: 2, row: 1 },
      { label: 'The Near Future', meaning: 'What arrives next.', col: 3, row: 2 },
      { label: 'Yourself', meaning: 'How you are approaching this.', col: 4, row: 4 },
      { label: 'Environment', meaning: 'The people and conditions around you.', col: 4, row: 3 },
      { label: 'Hopes and Fears', meaning: 'What you want and what you dread — often the same card.', col: 4, row: 2 },
      { label: 'The Outcome', meaning: 'Where it all resolves.', col: 4, row: 1 },
    ],
  },
  {
    id: 'year',
    name: 'Year Ahead',
    blurb: 'Twelve cards, one per month.',
    cols: 6,
    positions: Array.from({ length: 12 }, (_, i) => ({
      label: `Month ${i + 1}`,
      meaning: 'The theme of this month.',
      col: (i % 6) + 1,
      row: Math.floor(i / 6) + 1,
    })),
  },
];

export const spreadById = (id) => SPREADS.find((s) => s.id === id);

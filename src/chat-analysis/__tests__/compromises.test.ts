import { getCompromises } from '../chat-analysis.service';

interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expectedCompromiseKeywords: (string | string[])[];
  expectedCompromise: boolean;
}

const scenarios: TestScenario[] = [
  {
    description: 'should identify compromises in the conversation',
    messages: [
      { sender: 'Alice', body: "I'd prefer to meet in the morning." },
      { sender: 'Bob', body: 'I can only do afternoons.' },
      { sender: 'Charlie', body: 'What about noon? That could work for me.' },
      { sender: 'Alice', body: 'Noon is a bit early for me.' },
      { sender: 'Bob', body: 'How about 2pm?' },
      { sender: 'Alice', body: "2pm works for me. Let's do that." },
      { sender: 'Bob', body: 'Great, 2pm it is.' },
    ],
    expectedCompromiseKeywords: [
      ['2pm', '2 pm', 'afternoon', 'meet', 'agree', 'time'],
    ],
    expectedCompromise: true,
  },
  {
    description:
      'should not identify compromises when there are no disagreements',
    messages: [
      { sender: 'Alice', body: 'Should we meet at 2pm tomorrow?' },
      { sender: 'Bob', body: 'Yes, 2pm works perfectly for me.' },
      { sender: 'Alice', body: 'Great! See you then.' },
    ],
    expectedCompromiseKeywords: [],
    expectedCompromise: false,
  },
];

describe('getCompromises', () => {
  // Parameterized test for all defined scenarios
  test.each(scenarios)(
    '$description',
    async ({
      description,
      expectedCompromise,
      expectedCompromiseKeywords,
      messages,
    }) => {
      const result = await getCompromises({ messages });
      console.info({ description, result });

      // Ensure the result has the correct shape
      expect(result).toHaveProperty('compromises');
      expect(Array.isArray(result.compromises)).toBe(true);

      if (expectedCompromise) {
        expect(result.compromises.length).toBeGreaterThan(0);
      } else {
        expect(result.compromises.length).toBe(0);
      }

      // Check if the compromises contain the expected keywords
      const allCompromises = result.compromises.join(' ').toLowerCase();
      for (const keywordOrKeywords of expectedCompromiseKeywords) {
        if (Array.isArray(keywordOrKeywords)) {
          const found = keywordOrKeywords.some((k) =>
            allCompromises.includes(k),
          );
          expect(found).toBe(true);
        } else {
          expect(allCompromises).toContain(keywordOrKeywords);
        }
      }
    },
    90000, // 90-second timeout for each test case
  );
});

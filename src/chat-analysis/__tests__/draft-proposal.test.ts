import { draftProposal } from '../chat-analysis.service';

// Define the shape of a test scenario
interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expectedTitleKeywords: (string | string[])[];
  expectedDescriptionKeywords: (string | string[])[];
}

// Centralized test scenarios
const scenarios: TestScenario[] = [
  {
    description: 'should draft a proposal from the conversation',
    messages: [
      { sender: 'Alice', body: 'So we all agree on meeting Thursdays at 2pm?' },
      { sender: 'Bob', body: 'Yes, Thursday works for me' },
      { sender: 'Charlie', body: 'Thursday at 2pm is perfect' },
      { sender: 'Alice', body: "Great, let's lock that in" },
    ],
    expectedTitleKeywords: [['meeting', 'schedule']],
    expectedDescriptionKeywords: ['thursday', ['2pm', '2 pm']],
  },
];

describe('draftProposal', () => {
  // Parameterized test for all defined scenarios
  test.each(scenarios)(
    '$description',
    async ({
      messages,
      expectedTitleKeywords,
      expectedDescriptionKeywords,
    }) => {
      const result = await draftProposal({ messages });

      // Ensure the result has the correct shape
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(typeof result.title).toBe('string');
      expect(typeof result.description).toBe('string');

      // Check if the title contains the expected keywords
      const title = result.title.toLowerCase();
      for (const keywordOrKeywords of expectedTitleKeywords) {
        if (Array.isArray(keywordOrKeywords)) {
          const found = keywordOrKeywords.some((k) => title.includes(k));
          expect(found).toBe(true);
        } else {
          expect(title).toContain(keywordOrKeywords);
        }
      }

      // Check if the description contains the expected keywords
      const description = result.description.toLowerCase();
      for (const keywordOrKeywords of expectedDescriptionKeywords) {
        if (Array.isArray(keywordOrKeywords)) {
          const found = keywordOrKeywords.some((k) => description.includes(k));
          expect(found).toBe(true);
        } else {
          expect(description).toContain(keywordOrKeywords);
        }
      }
    },
    60000, // 60-second timeout for each test case
  );
});

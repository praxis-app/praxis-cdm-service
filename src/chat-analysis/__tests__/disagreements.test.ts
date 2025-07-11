import { getDisagreements } from '../chat-analysis.service';

// Define the shape of a test scenario
interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expectedDisagreementKeywords: (string | string[])[];
}

// Centralized test scenarios
const scenarios: TestScenario[] = [
  {
    description: 'should identify disagreements in the conversation',
    messages: [
      { sender: 'Alice', body: "I think we should use a blue color scheme." },
      { sender: 'Bob', body: 'No, I think red is much better.' },
      { sender: 'Charlie', body: 'I disagree with both, green would be the best option.' },
    ],
    expectedDisagreementKeywords: [
      ['blue', 'red', 'green', 'color', 'disagree'],
    ],
  },
];

describe('getDisagreements', () => {
  // Parameterized test for all defined scenarios
  test.each(scenarios)(
    '$description',
    async ({ messages, expectedDisagreementKeywords }) => {
      const result = await getDisagreements({ messages });

      // Ensure the result has the correct shape
      expect(result).toHaveProperty('disagreements');
      expect(Array.isArray(result.disagreements)).toBe(true);

      // Check if the disagreements contain the expected keywords
      const allDisagreements = result.disagreements.join(' ').toLowerCase();
      for (const keywordOrKeywords of expectedDisagreementKeywords) {
        if (Array.isArray(keywordOrKeywords)) {
          const found = keywordOrKeywords.some((k) =>
            allDisagreements.includes(k),
          );
          expect(found).toBe(true);
        } else {
          expect(allDisagreements).toContain(keywordOrKeywords);
        }
      }
    },
    60000, // 60-second timeout for each test case
  );
});
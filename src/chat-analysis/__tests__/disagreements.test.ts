import { getDisagreements } from '../chat-analysis.service';

// Define the shape of a test scenario
interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expectedDisagreementKeywords: (string | string[])[];
  expectedDisagreement: boolean;
}

// Centralized test scenarios
const scenarios: TestScenario[] = [
  {
    description: 'should identify disagreements in the conversation',
    messages: [
      { sender: 'Alice', body: 'I think we should use a blue color scheme.' },
      { sender: 'Bob', body: 'No, I think red is much better.' },
      {
        sender: 'Charlie',
        body: 'I disagree with both, green would be the best option.',
      },
    ],
    expectedDisagreementKeywords: [
      ['blue', 'red', 'green', 'color', 'disagree'],
    ],
    expectedDisagreement: true,
  },
  {
    description: 'should not identify disagreements when participants agree',
    messages: [
      { sender: 'Alice', body: 'I think this proposal is excellent.' },
      { sender: 'Bob', body: 'I agree, it covers all the key points.' },
      { sender: 'Charlie', body: 'Yes, I’m on board with this.' },
    ],
    expectedDisagreementKeywords: [],
    expectedDisagreement: false,
  },
  {
    description: 'should handle empty messages gracefully',
    messages: [],
    expectedDisagreementKeywords: [],
    expectedDisagreement: false,
  },
];

describe('getDisagreements', () => {
  // Parameterized test for all defined scenarios
  test.each(scenarios)(
    '$description',
    async ({
      messages,
      expectedDisagreementKeywords,
      expectedDisagreement,
    }) => {
      const result = await getDisagreements({ messages });

      // Ensure the result has the correct shape
      expect(result).toHaveProperty('disagreements');
      expect(Array.isArray(result.disagreements)).toBe(true);

      if (expectedDisagreement) {
        expect(result.disagreements.length).toBeGreaterThan(0);
      } else {
        expect(result.disagreements.length).toBe(0);
      }

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

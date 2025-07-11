import { getChatSummary } from '../chat-analysis.service';

interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expectedSummaryKeywords: (string | string[])[];
}

const scenarios: TestScenario[] = [
  {
    description: 'should generate a concise summary of the conversation',
    messages: [
      { sender: 'Alice', body: 'We need to decide on our meeting schedule' },
      { sender: 'Bob', body: 'What are the options?' },
      { sender: 'Charlie', body: "I'm not sure what works for everyone" },
      {
        sender: 'Alice',
        body: 'So we all agree on meeting Thursdays at 2pm?',
      },
      { sender: 'Bob', body: 'Yes, Thursday works for me' },
      { sender: 'Charlie', body: 'Thursday at 2pm is perfect' },
      { sender: 'Alice', body: "Great, let's lock that in" },
    ],
    expectedSummaryKeywords: [
      ['schedule', 'scheduling'],
      ['2pm', '2 pm'],
      'meeting',
      'thursday',
    ],
  },
];

describe('getChatSummary', () => {
  // Parameterized test for all defined scenarios
  test.each(scenarios)(
    '$description',
    async ({ description, messages, expectedSummaryKeywords }) => {
      const summary = await getChatSummary({ messages });
      console.info({ description, result: summary });

      // Ensure the summary is a non-empty string
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);

      // Check if the summary contains the expected keywords
      for (const keywordOrKeywords of expectedSummaryKeywords) {
        if (Array.isArray(keywordOrKeywords)) {
          const found = keywordOrKeywords.some((k) =>
            summary.toLowerCase().includes(k),
          );
          expect(found).toBe(true);
        } else {
          expect(summary.toLowerCase()).toContain(keywordOrKeywords);
        }
      }
    },
    60000, // 60-second timeout for each test case
  );
});

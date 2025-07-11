import { isReadyForProposal } from '../chat-analysis.service';

const TEST_SCENARIOS = {
  notReady: {
    messages: [
      { sender: 'Alice', body: 'We need to decide on our meeting schedule' },
      { sender: 'Bob', body: 'What are the options?' },
      { sender: 'Charlie', body: "I'm not sure what works for everyone" },
    ],
  },

  ready: {
    messages: [
      { sender: 'Alice', body: 'So we all agree on meeting Thursdays at 2pm?' },
      { sender: 'Bob', body: 'Yes, Thursday works for me' },
      { sender: 'Charlie', body: 'Thursday at 2pm is perfect' },
      { sender: 'Alice', body: "Great, let's lock that in" },
    ],
  },

  changedMinds: {
    messages: [
      { sender: 'Alice', body: "Let's meet on Mondays" },
      { sender: 'Bob', body: 'Monday works' },
      { sender: 'Charlie', body: 'Actually, I have conflicts on Monday' },
      { sender: 'Alice', body: 'How about Thursday instead?' },
      { sender: 'Bob', body: 'Thursday is better for me too' },
      { sender: 'Charlie', body: "Yes, let's do Thursday" },
    ],
  },
};

async function testIsReadyForProposal() {
  console.info('Testing isReadyForProposal...\n');

  for (const [name, scenario] of Object.entries(TEST_SCENARIOS)) {
    console.info(`Scenario: ${name}`);

    try {
      const result = await isReadyForProposal({ messages: scenario.messages });

      console.info(`Ready: ${result.isReady}`);
      console.info(`Reason: ${result.reason}`);

      // Basic validation
      if (name === 'notReady' && result.isReady === true) {
        console.info(`⚠️ Expected false, got true`);
      }
      if (name === 'ready' && result.isReady === false) {
        console.info(`⚠️ Expected true, got false`);
      }
      if (
        name === 'changedMinds' &&
        !result.reason?.toLowerCase().includes('thursday')
      ) {
        console.info(`⚠️ Should mention Thursday (final decision), not Monday`);
      }
    } catch (error) {
      console.info(`❌ Error: ${error}`);
    }

    console.info('');
  }
}

// Run with: npx ts-node src/chat-analysis/__tests__/proposal-readiness.fixture.ts
testIsReadyForProposal();

import ollama from 'ollama';
import { MODELS } from './ollama.constants';
import { ensureModel } from './ollama.utils';

interface Message {
  sender: string;
  body: string;
}

interface Conversation {
  messages: Message[];
}

export const getCompromises = async ({ messages }: Conversation) => {
  await ensureModel(MODELS['Llama 3.1']);

  const recentMessages = messages.slice(-50);
  const formattedConversation = getFormattedConversation(recentMessages);

  const { message } = await ollama.chat({
    model: MODELS['Llama 3.1'],
    messages: [
      {
        role: 'system',
        content: `
          You are an AI assistant that helps identify compromises between
          disagreeing parties in a conversation.

          Rules:
          - Identify realistic compromises between disagreeing parties
          - Each compromise should be actionable and specific
          - One compromise per disagreement
          - Empty array if no compromises possible
          - Return a valid JSON object with no other text

          Example with compromise(s):
          {
            "compromises": ["We can grow both vegetables and fruit."]
          }

          Example with no compromises:
          {
            "compromises": []
          }
        `,
      },
      {
        role: 'user',
        content: `
          Identify potential compromises in this conversation:
          ${formattedConversation}
        `,
      },
    ],
    options: {
      temperature: 0.1, // Very low for consistent JSON
      num_predict: 500, // Enough for multiple compromises
      repeat_penalty: 1.3, // Prevent repetition
    },
  });

  try {
    const response = JSON.parse(message.content);
    return {
      compromises: response.compromises,
    };
  } catch (e) {
    // Fallback parsing if JSON fails
    return {
      compromises: [],
      error: JSON.stringify(e),
    };
  }
};

export const getDisagreements = async ({ messages }: Conversation) => {
  await ensureModel(MODELS['Llama 3.1']);

  const recentMessages = messages.slice(-50);
  const formattedConversation = getFormattedConversation(recentMessages);

  const { message } = await ollama.chat({
    model: MODELS['Llama 3.1'],
    messages: [
      {
        role: 'system',
        content: `
          You are an AI assistant that helps identify disagreements in a conversation.

          Return a JSON object with no other text:
          - "disagreements": An array of strings, each representing a disagreement.
            If there are no disagreements, the array should be empty.

          Example with disagreements:
          {
            "disagreements": [
              "Jane and Sarah disagree on the type of produce to grow.",
              "John and Jane disagree on where to plant the produce."
            ]
          }

          Example with no disagreements:
          {
            "disagreements": []
          }
        `,
      },
      {
        role: 'user',
        content: `
          Identify disagreements in this conversation:
          ${formattedConversation}
        `,
      },
    ],
    options: {
      temperature: 0.1, // Very low for consistent JSON
      num_predict: 500, // Enough for multiple disagreements
      top_k: 10, // Narrow choices for structured output
      top_p: 0.8, // Further restrict token selection
    },
  });

  try {
    const response = JSON.parse(message.content);
    return {
      disagreements: response.disagreements,
    };
  } catch (e) {
    // Fallback parsing if JSON fails
    return {
      disagreements: [],
      error: JSON.stringify(e),
    };
  }
};

export const draftProposal = async ({ messages }: Conversation) => {
  await ensureModel(MODELS['Llama 3.1']);

  const recentMessages = messages.slice(-50);
  const formattedConversation = getFormattedConversation(recentMessages);

  const { message } = await ollama.chat({
    model: MODELS['Llama 3.1'],
    messages: [
      {
        role: 'system',
        content: `
          You are an AI assistant that helps draft a proposal based on a conversation.
          The conversation is a list of messages between participants along with some metadata.

          Return a JSON object with no other text:
          - "title": A short title for the proposal
          - "description": A short description of the proposal

          Example:
          {
            "title": "Meeting Schedule",
            "description": "We should meet every Tuesday at 2pm"
          }
        `,
      },
      {
        role: 'user',
        content: `
          Draft a proposal based on this conversation:
          ${formattedConversation}
        `,
      },
    ],
  });

  try {
    const response = JSON.parse(message.content);
    return {
      title: response.title,
      description: response.description,
    };
  } catch (e) {
    // Fallback parsing if JSON fails
    return {
      title: 'Error parsing response from LLM',
      description: message.content,
      error: JSON.stringify(e),
    };
  }
};

export const isReadyForProposal = async ({ messages }: Conversation) => {
  await ensureModel(MODELS['Llama 3.1']);

  // Limit conversation length to avoid excessive processing
  const recentMessages = messages.slice(-50);
  const formattedConversation = getFormattedConversation(recentMessages);

  const { message } = await ollama.chat({
    model: MODELS['Llama 3.1'],
    messages: [
      {
        role: 'system',
        content: `
          You are an AI assistant that helps identify when a discussion is ready for a proposal.
          
          A conversation is ready for a proposal when:
          - There's been sufficient discussion to understand the topic
          - One or more potential solutions or directions have emerged
          - There's some level of agreement or convergence among participants
          - The discussion has reached a natural point where formalizing the decision would be helpful
          
          A conversation is NOT ready when:
          - The topic is still being explored without any clear direction
          - Participants are still asking clarifying questions
          - There's active disagreement without any convergence
          - The discussion just started
          
          Return a JSON object with:
          - "ready": true/false
          - "reason": a short explanation, 2 sentences or less

          Example:
          {
            "ready": true,
            "reason": "Consensus reached"
          }
        `,
      },
      {
        role: 'user',
        content: `
          Analyze this conversation and determine if it's ready for a proposal:
          ${formattedConversation}
        `,
      },
    ],
    // Decision-making focused options
    options: {
      temperature: 0.2, // Lower creativity
      num_predict: 200, // Limit max tokens
      repeat_penalty: 1.2, // Prevent repetition
      top_k: 20, // Reduce nonsense
    },
  });

  try {
    const response = JSON.parse(message.content);
    return {
      isReady: response.ready,
      reason: response.reason,
    };
  } catch (e) {
    // Fallback parsing if JSON fails
    const isReady = message.content.toLowerCase().includes('true');
    return {
      isReady,
      reason: message.content,
    };
  }
};

export const summarizeConversation = async ({ messages }: Conversation) => {
  await ensureModel(MODELS['Llama 3.2 3B']);

  // Limit conversation length to avoid excessive processing
  const recentMessages = messages.slice(-50);
  const formattedConversation = getFormattedConversation(recentMessages);

  const { message } = await ollama.chat({
    model: MODELS['Llama 3.2 3B'],
    messages: [
      {
        role: 'system',
        content: `
          You are a conversation summarizer. Create a concise summary (2-3 sentences) covering:
          - Main topics discussed
          - Key decisions or conclusions
          - Action items (if any)
          - Unresolved issues
          - Important context
          Format: Direct summary without labels or prefixes.
        `,
      },
      {
        role: 'user',
        content: `
          Summarize this conversation:
          ${formattedConversation}
        `,
      },
    ],
    // Decision-making focused options
    options: {
      temperature: 0.2, // Lower creativity
      num_predict: 200, // Limit max tokens
      repeat_penalty: 1.2, // Prevent repetition
      top_k: 20, // Reduce nonsense
    },
  });

  return message.content.trim();
};

export const getOllamaHealth = async () => {
  await ensureModel(MODELS['Llama 3.2 3B']);

  const { message } = await ollama.chat({
    model: MODELS['Llama 3.2 3B'],
    messages: [
      {
        role: 'system',
        content: `
          You are a service named "Ollama" that is running on a server.
          You are responsible for responding to health checks.
          Each response should be 7 words or less.
        `,
      },
      {
        role: 'user',
        content: `What is your current status?`,
      },
    ],
  });

  return message.content.trim();
};

const getFormattedConversation = (messages: Message[]) => {
  const formattedMessages = messages
    .map((message) => `${message.sender}: ${message.body}`)
    .join('\n');

  const participantCount = new Set(messages.map((m) => m.sender)).size;
  const messageCount = messages.length;

  return JSON.stringify({
    messages: formattedMessages,
    participantCount,
    messageCount,
  });
};

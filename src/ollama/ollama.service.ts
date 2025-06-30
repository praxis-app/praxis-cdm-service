import ollama from 'ollama';
import { MODELS } from './ollama.constants';
import { PromptTemplate } from './ollama.types';
import { ensureModel } from './ollama.utils';
import { COMPROMISES_PROMPT } from './prompts/compromises.prompt';
import { DISAGREEMENTS_PROMPT } from './prompts/disagreements.prompt';

interface Message {
  sender: string;
  body: string;
}

interface Chat {
  messages: Message[];
}

export const getCompromises = async ({ messages }: Chat) => {
  const recentMessages = messages.slice(-50);
  const formattedChat = getFormattedChat(recentMessages);

  try {
    const content = await executePrompt('Llama 3.1', COMPROMISES_PROMPT, {
      formattedChat,
    });
    const response = JSON.parse(content);

    return { compromises: response.compromises };
  } catch (e) {
    return { compromises: [], error: JSON.stringify(e) };
  }
};

export const getDisagreements = async ({ messages }: Chat) => {
  await ensureModel(MODELS['Llama 3.1']);

  const recentMessages = messages.slice(-50);
  const formattedChat = getFormattedChat(recentMessages);

  try {
    const content = await executePrompt('Llama 3.1', DISAGREEMENTS_PROMPT, {
      formattedChat,
    });
    const response = JSON.parse(content);

    return { disagreements: response.disagreements };
  } catch (e) {
    return { disagreements: [], error: JSON.stringify(e) };
  }
};

export const draftProposal = async ({ messages }: Chat) => {
  await ensureModel(MODELS['Llama 3.1']);

  const recentMessages = messages.slice(-50);
  const formattedChat = getFormattedChat(recentMessages);

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
          ${formattedChat}
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

export const isReadyForProposal = async ({ messages }: Chat) => {
  await ensureModel(MODELS['Llama 3.1']);

  // Limit message length to avoid excessive processing
  const recentMessages = messages.slice(-50);
  const formattedChat = getFormattedChat(recentMessages);

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
          ${formattedChat}
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

export const getChatSummary = async ({ messages }: Chat) => {
  await ensureModel(MODELS['Llama 3.2 3B']);

  // Limit message length to avoid excessive processing
  const recentMessages = messages.slice(-50);
  const formattedChat = getFormattedChat(recentMessages);

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
          ${formattedChat}
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

export const executePrompt = async (
  model: keyof typeof MODELS,
  { system, user, options }: PromptTemplate,
  variables: Record<string, string>,
) => {
  await ensureModel(MODELS[model]);

  // Replace variables in user prompt
  const userContent = Object.entries(variables).reduce(
    (content, [key, value]) => content.replace(`{${key}}`, value),
    user,
  );

  const messages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    { role: 'user', content: userContent },
  ];

  const { message } = await ollama.chat({
    model: MODELS[model],
    messages,
    options,
  });

  return message.content;
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

const getFormattedChat = (messages: Message[]) => {
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

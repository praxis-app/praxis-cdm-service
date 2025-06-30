import ollama from 'ollama';
import { MODELS } from './ollama.constants';
import { PromptTemplate } from './ollama.types';
import { ensureModel } from './ollama.utils';
import { COMPROMISES_PROMPT } from './prompts/compromises.prompt';
import { DISAGREEMENTS_PROMPT } from './prompts/disagreements.prompt';
import { DRAFT_PROPOSAL_PROMPT } from './prompts/draft-proposal.prompt';
import { PROPOSAL_READINESS_PROMPT } from './prompts/proposal-readiness.prompt';

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
  const recentMessages = messages.slice(-50);
  const formattedChat = getFormattedChat(recentMessages);

  try {
    const content = await executePrompt('Llama 3.1', DRAFT_PROPOSAL_PROMPT, {
      formattedChat,
    });
    const response = JSON.parse(content);

    return {
      title: response.title,
      description: response.description,
    };
  } catch (e) {
    return {
      title: '',
      description: '',
      error: JSON.stringify(e),
    };
  }
};

export const isReadyForProposal = async ({ messages }: Chat) => {
  const recentMessages = messages.slice(-50);
  const formattedChat = getFormattedChat(recentMessages);

  try {
    const content = await executePrompt(
      'Llama 3.1',
      PROPOSAL_READINESS_PROMPT,
      { formattedChat },
    );
    const response = JSON.parse(content);

    return {
      isReady: response.ready,
      reason: response.reason,
    };
  } catch (e) {
    return {
      isReady: false,
      reason: 'Failed to parse JSON from LLM',
      error: JSON.stringify(e),
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

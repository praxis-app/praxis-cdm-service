import { executePrompt } from '../ollama/ollama.service';
import { CHAT_SUMMARY_PROMPT } from './prompts/chat-summary.prompt';
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
  const recentMessages = messages.slice(-50);
  const formattedChat = getFormattedChat(recentMessages);

  const content = await executePrompt('Llama 3.2 3B', CHAT_SUMMARY_PROMPT, {
    formattedChat,
  });

  return content.trim();
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

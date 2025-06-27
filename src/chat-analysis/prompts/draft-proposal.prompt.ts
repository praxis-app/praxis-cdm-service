import { PromptTemplate } from '../../ollama/ollama.types';

export const DRAFT_PROPOSAL_PROMPT: PromptTemplate = {
  system: `
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
  user: 'Draft a proposal based on this conversation:\n{formattedChat}',
};

import {
  draftProposal,
  getChatSummary,
  getCompromises,
  getDisagreements,
  isReadyForProposal,
} from '../chat-analysis/chat-analysis.service';
import { config } from '../config/config';
import { api } from '../matrix/matrix.client';
import { getMessageBody, isTextMessage } from '../matrix/matrix.utils';

enum Commands {
  Summary = '/summary',
  Consensus = '/consensus',
  Disagreements = '/disagreements',
  Compromises = '/compromises',
  DraftProposal = '/draft-proposal',
}

export const handleCommandExecution = async (
  event: Record<string, unknown>,
) => {
  const commandHandlers: Record<
    Commands,
    (event: Record<string, unknown>) => Promise<void>
  > = {
    [Commands.Summary]: handleSummaryCommand,
    [Commands.Consensus]: handleConsensusCommand,
    [Commands.Disagreements]: handleDisagreementsCommand,
    [Commands.Compromises]: handleCompromisesCommand,
    [Commands.DraftProposal]: handleDraftProposalCommand,
  };

  const command = extractCommand(event);
  if (!command) {
    throw new Error('No valid command found in message');
  }
  await commandHandlers[command](event);
};

export const extractCommand = (event: Record<string, unknown>) => {
  const body = getMessageBody(event);
  return Object.values(Commands).find((command) =>
    body?.toLowerCase().startsWith(command),
  );
};

const handleSummaryCommand = async (event: Record<string, unknown>) => {
  try {
    const roomId = event.room_id as string;
    const response = await api.getRoomMessages(roomId);

    const events = response.chunk || [];
    const messages = prepareMessages(events);

    if (messages.length === 0) {
      await api.sendBotMessage(
        roomId,
        'No messages found in this room to summarize.',
      );
      return;
    }

    console.info('🔍 Fetching chat summary');
    const start = Date.now();
    const summary = await getChatSummary({ messages });
    const message = `${summary} (${Date.now() - start}ms)`;

    await api.sendBotMessage(roomId, message);
  } catch (error) {
    console.error('Error handling summary command', error);
    const roomId = event.room_id as string;
    await api.sendBotMessage(
      roomId,
      'Sorry, I encountered an error while generating the summary. Please try again.',
    );
  }
};

const handleConsensusCommand = async (event: Record<string, unknown>) => {
  try {
    const roomId = event.room_id as string;
    const response = await api.getRoomMessages(roomId);

    const events = response.chunk || [];
    const messages = prepareMessages(events);

    if (messages.length === 0) {
      await api.sendBotMessage(
        roomId,
        'No messages found in this room to check for consensus.',
      );
      return;
    }

    console.info('🔍 Checking for consensus');
    const start = Date.now();
    const { isReady, reason, error } = await isReadyForProposal({ messages });
    let message = `${isReady ? '✅' : '❌'} - ${reason} (${Date.now() - start}ms)`;
    if (error) {
      message += `\nError: ${error}`;
    }

    await api.sendBotMessage(roomId, message);
  } catch (error) {
    console.error('Error handling consensus command', error);
    const roomId = event.room_id as string;
    await api.sendBotMessage(
      roomId,
      'Sorry, I encountered an error while checking for consensus. Please try again.',
    );
  }
};

const handleDisagreementsCommand = async (event: Record<string, unknown>) => {
  try {
    const roomId = event.room_id as string;
    const response = await api.getRoomMessages(roomId);

    const events = response.chunk || [];
    const messages = prepareMessages(events);

    if (messages.length === 0) {
      await api.sendBotMessage(
        roomId,
        'No messages found in this room to check for disagreements.',
      );
      return;
    }

    console.info('🔍 Checking for disagreements');
    const start = Date.now();
    const { disagreements, error } = await getDisagreements({ messages });

    const plural = disagreements.length === 1 ? '' : 's';
    const count = `${disagreements.length} disagreement${plural} found`;
    const separator = disagreements.length > 0 ? ':' : '';
    let message = `${count} (${Date.now() - start}ms)${separator}`;

    for (const [index, disagreement] of disagreements.entries()) {
      message += `\n\n${index + 1}. ${disagreement}`;
    }

    if (error) {
      message += `\nError: ${error}`;
    }

    await api.sendBotMessage(roomId, message);
  } catch (error) {
    console.error('Error handling disagreements command', error);
    const roomId = event.room_id as string;
    await api.sendBotMessage(
      roomId,
      'Sorry, I encountered an error while checking for disagreements. Please try again.',
    );
  }
};

const handleCompromisesCommand = async (event: Record<string, unknown>) => {
  try {
    const roomId = event.room_id as string;
    const response = await api.getRoomMessages(roomId);

    const events = response.chunk || [];
    const messages = prepareMessages(events);

    if (messages.length === 0) {
      await api.sendBotMessage(
        roomId,
        'No messages found in this room to check for compromises.',
      );
      return;
    }

    console.info('🔍 Checking for compromises');
    const start = Date.now();
    const { compromises, error } = await getCompromises({ messages });

    const plural = compromises.length === 1 ? '' : 's';
    const count = `${compromises.length} compromise${plural} found`;
    const separator = compromises.length > 0 ? ':' : '';
    let message = `${count} (${Date.now() - start}ms)${separator}`;

    for (const [index, compromise] of compromises.entries()) {
      message += `\n\n${index + 1}. ${compromise}`;
    }

    if (error) {
      message += `\nError: ${error}`;
    }

    await api.sendBotMessage(roomId, message);
  } catch (error) {
    console.error('Error handling compromises command', error);
    const roomId = event.room_id as string;
    await api.sendBotMessage(
      roomId,
      'Sorry, I encountered an error while checking for compromises. Please try again.',
    );
  }
};

const handleDraftProposalCommand = async (event: Record<string, unknown>) => {
  try {
    const roomId = event.room_id as string;
    const response = await api.getRoomMessages(roomId);

    const events = response.chunk || [];
    const messages = prepareMessages(events);

    if (messages.length === 0) {
      await api.sendBotMessage(
        roomId,
        'No messages found in this room to draft a proposal.',
      );
      return;
    }

    console.info('✍️ Drafting proposal');
    const start = Date.now();
    const { title, description, error } = await draftProposal({ messages });
    let message = `Drafted proposal: ${title}\n${description} (${Date.now() - start}ms)`;
    if (error) {
      message += `\nError: ${error}`;
    }

    await api.sendBotMessage(roomId, message);
  } catch (error) {
    console.error('Error handling draft proposal command', error);
    const roomId = event.room_id as string;
    await api.sendBotMessage(
      roomId,
      'Sorry, I encountered an error while drafting a proposal. Please try again.',
    );
  }
};

/**
 * Filter for text messages, not from the bot, and not a command.
 * Extract sender and body.
 */
const prepareMessages = (events: Record<string, unknown>[]) =>
  events
    .reduce(
      (
        result: { sender: string; body: string }[],
        event: Record<string, unknown>,
      ) => {
        const body = getMessageBody(event);
        const isText = isTextMessage(event);
        const isBot = event.sender === config.matrix.botName;
        const isCommand = !!extractCommand(event);

        if (body && isText && !isBot && !isCommand) {
          result.push({
            sender: event.sender as string,
            body,
          });
        }
        return result;
      },
      [] as { sender: string; body: string }[],
    )
    .reverse();

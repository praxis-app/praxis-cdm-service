import {
  getChatSummary,
  getCompromises,
  getDisagreements,
  isReadyForProposal,
} from '../chat-analysis/chat-analysis.service';
import { config } from '../config/config';
import { api } from '../matrix/matrix.client';

export enum Commands {
  Summary = '/summary',
  Consensus = '/consensus',
  Disagreements = '/disagreements',
  Compromises = '/compromises',
  DraftProposal = '/proposal',
}

export const handleCommandExecution = async (
  event: Record<string, unknown>,
) => {
  const content = event.content as Record<string, unknown>;
  const body = content?.body as string | undefined;
  if (!body) {
    return;
  }

  // TODO: Uncomment when ready to use
  // const commandHandlers = {
  //   [Commands.Summary]: handleSummaryCommand,
  //   [Commands.Consensus]: handleConsensusCommand,
  //   [Commands.Disagreements]: handleDisagreementsCommand,
  //   [Commands.Compromises]: handleCompromisesCommand,
  // };

  if (body.toLowerCase().startsWith(Commands.Summary)) {
    await handleSummaryCommand(event);
  }
  if (body.toLowerCase().startsWith(Commands.Consensus)) {
    await handleConsensusCommand(event);
  }
  if (body.toLowerCase().startsWith(Commands.Disagreements)) {
    await handleDisagreementsCommand(event);
  }
  if (body.toLowerCase().startsWith(Commands.Compromises)) {
    await handleCompromisesCommand(event);
  }
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
      message += `\n\nError: ${error}`;
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
      message += `\n\nError: ${error}`;
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
      message += `\n\nError: ${error}`;
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

export const isCommandMessage = (event: Record<string, unknown>) => {
  const body = (event.content as Record<string, unknown>).body as
    | string
    | undefined;
  return Object.values(Commands).some((command) =>
    body?.toLowerCase().startsWith(command),
  );
};

/**
 * Filter for text messages, not from the bot, and not a command.
 * Extract sender and body.
 */
const prepareMessages = (events: Record<string, unknown>[]) =>
  events
    .reduce(
      (
        acc: { sender: string; body: string }[],
        event: Record<string, unknown>,
      ) => {
        const body = (event.content as Record<string, unknown>).body as
          | string
          | undefined;

        const isTextMessage =
          body &&
          event.type === 'm.room.message' &&
          (event.content as Record<string, unknown>)?.msgtype === 'm.text';

        const isBot = event.sender === config.matrix.botName;
        const isCommand = isCommandMessage(event);

        if (isTextMessage && !isBot && !isCommand) {
          acc.push({
            sender: event.sender as string,
            body,
          });
        }
        return acc;
      },
      [] as { sender: string; body: string }[],
    )
    .reverse();

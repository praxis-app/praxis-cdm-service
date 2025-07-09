import {
  getChatSummary,
  isReadyForProposal,
} from '../chat-analysis/chat-analysis.service';
import { api } from '../matrix/matrix.client';

export const handleSummaryCommand = async (event: Record<string, unknown>) => {
  try {
    const roomId = event.room_id as string;
    const response = await api.getRoomMessages(roomId);

    const events = response.chunk || [];
    const messages = shapeMessages(events);

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

export const handleConsensusCommand = async (
  event: Record<string, unknown>,
) => {
  try {
    const roomId = event.room_id as string;
    const response = await api.getRoomMessages(roomId);

    const events = response.chunk || [];
    const messages = shapeMessages(events);

    if (messages.length === 0) {
      await api.sendBotMessage(
        roomId,
        'No messages found in this room to summarize.',
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

// Filter for text messages and extract sender and body
const shapeMessages = (events: Array<Record<string, unknown>>) => {
  return events
    .reduce(
      (
        acc: Array<{ sender: string; body: string }>,
        event: Record<string, unknown>,
      ) => {
        if (
          event.type === 'm.room.message' &&
          (event.content as Record<string, unknown>)?.msgtype === 'm.text'
        ) {
          acc.push({
            sender: event.sender as string,
            body: (event.content as Record<string, unknown>)?.body as string,
          });
        }
        return acc;
      },
      [] as Array<{ sender: string; body: string }>,
    )
    .reverse(); // Reverse to get chronological order
};

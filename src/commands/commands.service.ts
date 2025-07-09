import { getChatSummary } from '../chat-analysis/chat-analysis.service';
import { api } from '../matrix/matrix.client';

export const handleSummaryCommand = async (event: Record<string, unknown>) => {
  try {
    const roomId = event.room_id as string;
    const response = await api.getRoomMessages(roomId);
    const events = response.chunk || [];

    // Filter for text messages and extract sender and body
    const messages = events
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

    if (messages.length === 0) {
      await api.sendBotMessage(
        roomId,
        'No messages found in this room to summarize.',
      );
      return;
    }

    console.info('🔍 Fetching chat summary');
    const summary = await getChatSummary({ messages });

    await api.sendBotMessage(roomId, summary);
  } catch (error) {
    console.error('Error handling summary command', error);
    const roomId = event.room_id as string;
    await api.sendBotMessage(
      roomId,
      'Sorry, I encountered an error while generating the summary. Please try again.',
    );
  }
};

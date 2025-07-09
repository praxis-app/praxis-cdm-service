import { getChatSummary } from '../chat-analysis/chat-analysis.service';
import { fetchRoomMessages, sendBotMessage } from '../matrix/matrix.service';

export const handleSummaryCommand = async (event: Record<string, unknown>) => {
  try {
    const roomId = event.room_id as string;
    const messages = await fetchRoomMessages(roomId, 20);

    if (messages.length === 0) {
      await sendBotMessage(
        roomId,
        'No messages found in this room to summarize.',
      );
      return;
    }

    console.info('🔍 Fetching chat summary');
    const summary = await getChatSummary({ messages });

    await sendBotMessage(roomId, summary);
  } catch (error) {
    console.error('Error handling summary command', error);
    const roomId = event.room_id as string;
    await sendBotMessage(
      roomId,
      'Sorry, I encountered an error while generating the summary. Please try again.',
    );
  }
};

// TODO: Clean up error handling, logging, and comments

import axios from 'axios';
import { appService } from './app-service';
import { getChatSummary } from '../chat-analysis/chat-analysis.service';

const handleMatrixEvent = (event: Record<string, unknown>) => {
  if (event.type === 'm.room.message' || event.type === 'm.room.member') {
    return;
  }
  console.log('😎 matrix event', event);
};

const handleMatrixEphemeralEvent = (event: Record<string, unknown>) => {
  console.log('👻 matrix ephemeral event', event);
};

const handleMatrixRoomMemberEvent = async (event: Record<string, unknown>) => {
  console.log('👤 matrix room member event', event);

  const content = event.content as Record<string, unknown>;
  const membership = content?.membership as string;
  const stateKey = event.state_key as string;

  // TODO: Remove hardcoded state key
  if (
    membership === 'invite' &&
    stateKey === '@praxis-bot:rhizome.matrix.host'
  ) {
    await joinRoom(event.room_id as string);
  }
};

const handleMatrixMessageEvent = async (event: Record<string, unknown>) => {
  console.log('💬 matrix message event', event);

  // Check if this is a text message with /summary command
  const content = event.content as Record<string, unknown>;
  const body = content?.body as string;

  if (body?.startsWith('/summary')) {
    await handleSummaryCommand(event);
  }
};

const handleSummaryCommand = async (event: Record<string, unknown>) => {
  try {
    const roomId = event.room_id as string;
    const sender = event.sender as string;

    console.log(
      `📝 Processing /summary command from ${sender} in room ${roomId}`,
    );

    // Fetch last 20 messages from the room
    const messages = await fetchRoomMessages(roomId, 20);

    if (messages.length === 0) {
      await sendBotMessage(
        roomId,
        'No messages found in this room to summarize.',
      );
      return;
    }

    // Generate summary using the chat analysis service
    const summary = await getChatSummary({ messages });

    // Send the summary as a bot message
    await sendBotMessage(roomId, summary);
  } catch (error) {
    console.error('❌ Error handling summary command:', error);
    const roomId = event.room_id as string;
    await sendBotMessage(
      roomId,
      'Sorry, I encountered an error while generating the summary. Please try again.',
    );
  }
};

const joinRoom = async (roomId: string) => {
  const matrixServerUrl = process.env.MATRIX_HS_URL || 'http://localhost:8008';
  const accessToken = process.env.MATRIX_AS_TOKEN;

  if (!accessToken) {
    throw new Error('MATRIX_AS_TOKEN environment variable is required');
  }

  try {
    await axios.post(
      `${matrixServerUrl}/_matrix/client/r0/rooms/${encodeURIComponent(roomId)}/join`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(`✅ Successfully joined room: ${roomId}`);
  } catch (error: any) {
    // If we're already in the room, that's fine
    if (
      error.response?.status === 400 &&
      error.response?.data?.errcode === 'M_USER_IN_USE'
    ) {
      console.log(`ℹ️ Already a member of room: ${roomId}`);
      return;
    }

    // If we can't join due to permissions or room doesn't exist
    if (error.response?.status === 403) {
      console.warn(
        `⚠️ Cannot join room ${roomId}: Access denied. Room may be private or invite-only.`,
      );
      throw new Error(
        `Cannot access room ${roomId}. The room may be private or invite-only.`,
      );
    }

    // For other errors, log and throw
    console.warn(
      `⚠️ Could not join room ${roomId}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};

const fetchRoomMessages = async (
  roomId: string,
  limit: number = 20,
): Promise<Array<{ sender: string; body: string }>> => {
  const matrixServerUrl = process.env.MATRIX_HS_URL || 'http://localhost:8008';
  const accessToken = process.env.MATRIX_AS_TOKEN;

  if (!accessToken) {
    throw new Error('MATRIX_AS_TOKEN environment variable is required');
  }

  try {
    const response = await axios.get(
      `${matrixServerUrl}/_matrix/client/r0/rooms/${encodeURIComponent(roomId)}/messages`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          limit,
          dir: 'b', // backwards (most recent first)
        },
      },
    );

    const events = response.data.chunk || [];

    // Filter for text messages and extract sender and body
    return events
      .filter(
        (event: Record<string, unknown>) =>
          event.type === 'm.room.message' &&
          (event.content as Record<string, unknown>)?.msgtype === 'm.text',
      )
      .map((event: Record<string, unknown>) => ({
        sender: event.sender as string,
        body: (event.content as Record<string, unknown>)?.body as string,
      }))
      .reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error('Error fetching room messages:', error);
    throw new Error('Failed to fetch room messages');
  }
};

const sendBotMessage = async (roomId: string, message: string) => {
  const matrixServerUrl = process.env.MATRIX_HS_URL || 'http://localhost:8008';
  const accessToken = process.env.MATRIX_AS_TOKEN;

  if (!accessToken) {
    throw new Error('MATRIX_AS_TOKEN environment variable is required');
  }

  try {
    const eventId = await axios.post(
      `${matrixServerUrl}/_matrix/client/r0/rooms/${encodeURIComponent(roomId)}/send/m.room.message`,
      {
        msgtype: 'm.text',
        body: message,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(`✅ Bot message sent with event ID: ${eventId.data.event_id}`);
  } catch (error) {
    console.error('Error sending bot message:', error);
    throw new Error('Failed to send bot message');
  }
};

export const initMatrixEventHandlers = () => {
  appService.on('event', handleMatrixEvent);
  appService.on('ephemeral', handleMatrixEphemeralEvent);
  appService.on('type:m.room.message', handleMatrixMessageEvent);
  appService.on('type:m.room.member', handleMatrixRoomMemberEvent);
};

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

const joinRoom = async (roomId: string) => {
  const matrixServerUrl = process.env.MATRIX_HS_URL || 'http://localhost:8008';
  const accessToken = process.env.MATRIX_AS_TOKEN;

  if (!accessToken) {
    throw new Error('MATRIX_AS_TOKEN environment variable is required');
  }

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
  console.info(`✅ Successfully joined room: ${roomId}`);
};

const fetchRoomMessages = async (
  roomId: string,
  limit: number = 20,
): Promise<Array<{ sender: string; body: string }>> => {
  const matrixServerUrl = process.env.MATRIX_HS_URL || 'http://localhost:8008';

  const response = await axios.get(
    `${matrixServerUrl}/_matrix/client/r0/rooms/${encodeURIComponent(roomId)}/messages`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MATRIX_AS_TOKEN}`,
        'Content-Type': 'application/json',
      },

      // TODO: Verify that params are valid
      params: {
        limit,
        dir: 'b', // backwards (most recent first)
      },
    },
  );

  const events = response.data.chunk || [];

  // Filter for text messages and extract sender and body
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

const sendBotMessage = async (roomId: string, message: string) => {
  const matrixServerUrl = process.env.MATRIX_HS_URL || 'http://localhost:8008';

  await axios.post(
    `${matrixServerUrl}/_matrix/client/r0/rooms/${encodeURIComponent(roomId)}/send/m.room.message`,
    {
      msgtype: 'm.text',
      body: message,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.MATRIX_AS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    },
  );
};

export const initMatrixEventHandlers = () => {
  appService.on('event', handleMatrixEvent);
  appService.on('ephemeral', handleMatrixEphemeralEvent);
  appService.on('type:m.room.message', handleMatrixMessageEvent);
  appService.on('type:m.room.member', handleMatrixRoomMemberEvent);
};

import axios from 'axios';

export const joinRoom = async (roomId: string) => {
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

export const fetchRoomMessages = async (
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

export const sendBotMessage = async (roomId: string, message: string) => {
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

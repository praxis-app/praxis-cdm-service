export const getMessageBody = (event: Record<string, unknown>) =>
  (event.content as Record<string, unknown>).body as string | undefined;

export const isTextMessage = (event: Record<string, unknown>) =>
  event.type === 'm.room.message' &&
  (event.content as Record<string, unknown>)?.msgtype === 'm.text';

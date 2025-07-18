import * as commandsService from '../commands/commands.service';
import { config } from '../config/config';
import { appService } from './app-service';
import { getMessageBody, isTextMessage } from './matrix.utils';

// TODO: Implement poll start event handling
export const handlePollStartEvent = async (event: Record<string, unknown>) => {
  console.log('📋 poll start', event);
};

// TODO: Implement poll response event handling
export const handlePollResponseEvent = async (
  event: Record<string, unknown>,
) => {
  console.log('🗳️ poll response', event);
};

export const handleRoomMemberEvent = async (event: Record<string, unknown>) => {
  const content = event.content as Record<string, unknown>;
  const membership = content?.membership as string;
  const stateKey = event.state_key as string;

  if (membership === 'invite' && stateKey === config.matrix.botName) {
    await appService.joinRoom(event.room_id as string);
  }
};

export const handleMessageEvent = async (event: Record<string, unknown>) => {
  const body = getMessageBody(event);
  const isText = isTextMessage(event);
  const isBot = event.sender === config.matrix.botName;
  const isCommand = body && commandsService.isCommandMessage(body);

  if (isText && isCommand && !isBot) {
    await commandsService.handleCommandExecution(event);
  }
};

import * as commandsService from '../commands/commands.service';
import { config } from '../config/config';
import { appService } from './app-service';
import { api } from './matrix.client';
import { isTextMessage } from './matrix.utils';

export const initMatrixEventHandlers = () => {
  appService.on('type:m.room.message', handleMatrixMessageEvent);
  appService.on('type:m.room.member', handleMatrixRoomMemberEvent);
};

const handleMatrixRoomMemberEvent = async (event: Record<string, unknown>) => {
  const content = event.content as Record<string, unknown>;
  const membership = content?.membership as string;
  const stateKey = event.state_key as string;

  if (membership === 'invite' && stateKey === config.matrix.botName) {
    await api.joinRoom(event.room_id as string);
    console.info(`✅ Successfully joined room: ${event.room_id}`);
  }
};

const handleMatrixMessageEvent = async (event: Record<string, unknown>) => {
  const isText = isTextMessage(event);
  const isBot = event.sender === config.matrix.botName;
  const isCommand = !!commandsService.extractCommand(event);

  if (isText && isCommand && !isBot) {
    await commandsService.handleCommandExecution(event);
  }
};

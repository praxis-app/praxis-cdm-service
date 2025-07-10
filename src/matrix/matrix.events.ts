import * as commandsService from '../commands/commands.service';
import { config } from '../config/config';
import { appService } from './app-service';
import { api } from './matrix.client';

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
  if (commandsService.isCommandMessage(event)) {
    await commandsService.handleCommandExecution(event);
  }
};

export const initMatrixEventHandlers = () => {
  appService.on('type:m.room.message', handleMatrixMessageEvent);
  appService.on('type:m.room.member', handleMatrixRoomMemberEvent);
};

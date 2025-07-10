import { Commands } from '../commands/commands.constants';
import {
  handleConsensusCommand,
  handleDisagreementsCommand,
  handleSummaryCommand,
} from '../commands/commands.service';
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
  const content = event.content as Record<string, unknown>;
  const body = content?.body as string | undefined;
  if (!body) {
    return;
  }

  if (body.toLowerCase().startsWith(Commands.Summary)) {
    await handleSummaryCommand(event);
  }
  if (body.toLowerCase().startsWith(Commands.Consensus)) {
    await handleConsensusCommand(event);
  }
  if (body.toLowerCase().startsWith(Commands.Disagreements)) {
    await handleDisagreementsCommand(event);
  }
};

export const initMatrixEventHandlers = () => {
  appService.on('type:m.room.message', handleMatrixMessageEvent);
  appService.on('type:m.room.member', handleMatrixRoomMemberEvent);
};

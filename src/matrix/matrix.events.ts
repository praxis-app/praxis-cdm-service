import { Commands } from '../commands/commands.constants';
import { handleSummaryCommand } from '../commands/commands.service';
import { appService } from './app-service';
import { joinRoom } from './matrix.service';

const handleMatrixRoomMemberEvent = async (event: Record<string, unknown>) => {
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
  // Check if this is a text message with /summary command
  const content = event.content as Record<string, unknown>;
  const body = content?.body as string;

  if (body?.startsWith(Commands.SUMMARY)) {
    await handleSummaryCommand(event);
  }
};

export const initMatrixEventHandlers = () => {
  appService.on('type:m.room.message', handleMatrixMessageEvent);
  appService.on('type:m.room.member', handleMatrixRoomMemberEvent);
};

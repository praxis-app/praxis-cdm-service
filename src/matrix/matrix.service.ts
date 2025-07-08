// TODO: Account for duplicate processing of the same event

import { appService } from './app-service';

const handleMatrixEvent = (event: Record<string, unknown>) => {
  console.log('😎 matrix event', event);
};

const handleMatrixEphemeralEvent = (event: Record<string, unknown>) => {
  console.log('😎 matrix ephemeral event', event);
};

const handleMatrixMessageEvent = (event: Record<string, unknown>) => {
  console.log('🤖 matrix message event', event);
};

export const initMatrixEventHandlers = () => {
  appService.on('event', handleMatrixEvent);
  appService.on('ephemeral', handleMatrixEphemeralEvent);
  appService.on('type:m.room.message', handleMatrixMessageEvent);
};

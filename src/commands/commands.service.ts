import {
  handleCompromisesCommand,
  handleConsensusCommand,
  handleDisagreementsCommand,
  handleDraftProposalCommand,
  handleSummaryCommand,
} from '../chat-analysis/chat-analysis.commands';
import { getMessageBody } from '../matrix/matrix.utils';

enum Commands {
  Summary = '/summary',
  Consensus = '/consensus',
  Disagreements = '/disagreements',
  Compromises = '/compromises',
  DraftProposal = '/draft-proposal',
}

export const handleCommandExecution = async (
  event: Record<string, unknown>,
) => {
  const commandHandlers: Record<
    Commands,
    (event: Record<string, unknown>) => Promise<void>
  > = {
    [Commands.Summary]: handleSummaryCommand,
    [Commands.Consensus]: handleConsensusCommand,
    [Commands.Disagreements]: handleDisagreementsCommand,
    [Commands.Compromises]: handleCompromisesCommand,
    [Commands.DraftProposal]: handleDraftProposalCommand,
  };

  const command = extractCommand(event);
  if (!command) {
    throw new Error('No valid command found in message');
  }
  await commandHandlers[command](event);
};

export const extractCommand = (event: Record<string, unknown>) => {
  const body = getMessageBody(event);
  return Object.values(Commands).find((command) =>
    body?.toLowerCase().startsWith(command),
  );
};

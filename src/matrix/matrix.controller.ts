import { Request, Response } from 'express';

let lastProcessedTxnId: string | null = null;

export const handleTransaction = async (req: Request, res: Response) => {
  if (isInvalidToken(req, res)) {
    return;
  }

  const txnId = req.params.txnId;
  if (!txnId) {
    res.send('Missing transaction ID.');
    return;
  }
  if (!req.body) {
    res.send('Missing body.');
    return;
  }

  const events = req.body.events || [];
  const ephemeral = req.body['de.sorunome.msc2409.ephemeral'] || [];

  // Account for duplicates
  if (lastProcessedTxnId === txnId) {
    res.send({});
    return;
  }

  console.log('TODO: Handle events here', events);
  console.log('TODO: Handle ephemeral here', ephemeral);

  lastProcessedTxnId = txnId;
  res.send({});
};

const isInvalidToken = (req: Request, res: Response) => {
  const providedToken =
    req.headers.authorization?.substring('Bearer '.length) ??
    req.query.access_token;
  if (providedToken !== process.env.MATRIX_HS_TOKEN) {
    res.status(403);
    res.send({
      errcode: 'M_FORBIDDEN',
      error: 'Bad token supplied,',
    });
    return true;
  }
  return false;
};

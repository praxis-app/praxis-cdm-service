import * as dotenv from 'dotenv';
import { EventEmitter } from 'events';
import { Request, Response } from 'express';

dotenv.config();

class AppService extends EventEmitter {
  private lastProcessedTxnId = '';

  constructor(private hsToken: string) {
    super();
  }

  handleTransaction = (req: Request, res: Response) => {
    if (this.isInvalidToken(req, res)) {
      return;
    }

    const { txnId } = req.params;
    if (!txnId) {
      res.send('Missing transaction ID.');
      return;
    }
    if (!req.body) {
      res.send('Missing body.');
      return;
    }

    if (this.lastProcessedTxnId === txnId) {
      res.send({});
      return;
    }

    const events = req.body.events || [];
    const ephemeral = req.body['de.sorunome.msc2409.ephemeral'] || [];

    for (const event of events) {
      this.emit('event', event);
      if (event.type) {
        this.emit(`type:${event.type}`, event);
      }
    }

    for (const event of ephemeral) {
      this.emit('ephemeral', event);
      if (event.type) {
        this.emit(`ephemeral_type:${event.type}`, event);
      }
    }

    this.lastProcessedTxnId = txnId;
    res.send({});
  };

  private isInvalidToken = (req: Request, res: Response) => {
    const providedToken =
      req.headers.authorization?.substring('Bearer '.length) ??
      req.query.access_token;

    if (providedToken !== this.hsToken) {
      res.status(403).send({
        errcode: 'M_FORBIDDEN',
        error: 'Bad token supplied',
      });
      return true;
    }
    return false;
  };
}

export const matrixService = new AppService(process.env.MATRIX_HS_TOKEN!);

import { EventEmitter } from 'events';
import { NextFunction, Request, Response } from 'express';
import { config } from '../config/config';
import { matrixClient } from './matrix.client';
import {
  handleMessageEvent,
  handlePollResponseEvent,
  handlePollStartEvent,
  handleRoomMemberEvent,
} from './matrix.events';

const BOT_DISPLAY_NAME = 'praxis-bot';
const BOT_AVATAR_URL =
  'https://raw.githubusercontent.com/praxis-app/media-assets/refs/heads/main/images/app-icon-color-256px.png';

declare interface AppService {
  /**
   * Emitted when an event is pushed to the appservice.
   * The format of the event object is documented at
   * https://matrix.org/docs/spec/application_service/r0.1.2#put-matrix-app-v1-transactions-txnid
   * @event
   * @example
   * appService.on("event", function(ev) {
   *   console.log("ID: %s", ev.event_id);
   * });
   */
  on(event: 'event', cb: (event: Record<string, unknown>) => void): this;
  /**
   * Emitted when an ephemeral event is pushed to the appservice.
   * The format of the event object is documented at
   * https://github.com/matrix-org/matrix-doc/pull/2409
   * @event
   * @example
   * appService.on("ephemeral", function(ev) {
   *   console.log("ID: %s", ev.type);
   * });
   */
  on(event: 'ephemeral', cb: (event: Record<string, unknown>) => void): this;
  /**
   * Emitted when the HTTP listener logs some information.
   * `access_tokens` are stripped from requests
   * @event
   * @example
   * appService.on("http-log", function(line) {
   *   console.log(line);
   * });
   */
  on(event: 'http-log', cb: (line: string) => void): this;
  /**
   * Emitted when an event of a particular type is pushed to the appservice.
   * This will be emitted *in addition* to "event" - deduplicate events
   * will need to be handled accordingly
   * @event
   * @param event Should start with "type:"
   * @example
   * appService.on("type:m.room.message", function(event) {
   *   console.log("ID: %s", ev.content.body);
   * });
   */
  on(
    event: `type:${string}`,
    cb: (event: Record<string, unknown>) => void,
  ): this;
  /**
   * Emitted when an ephemeral event of a particular type is pushed to the appservice.
   * This will be emitted *in addition* to "ephemeral" - deduplicate events
   * will need to be handled accordingly
   * @event
   * @param event Should start with "ephemeral_type:"
   * @example
   * appService.on("ephemeral_type:m.room.message", function(event) {
   *   console.log("ID: %s", ev.content.body);
   * });
   */
  on(
    event: `ephemeral_type:${string}`,
    cb: (event: Record<string, unknown>) => void,
  ): this;
}

class AppService extends EventEmitter {
  private lastProcessedTxnId = '';

  constructor(private hsToken: string) {
    super();

    // Initialize event handlers for Matrix events
    this.on('type:org.matrix.msc3381.poll.start', handlePollStartEvent);
    this.on('type:org.matrix.msc3381.poll.response', handlePollResponseEvent);
    this.on('type:m.room.member', handleRoomMemberEvent);
    this.on('type:m.room.message', handleMessageEvent);
  }

  handleTransaction = (req: Request, res: Response) => {
    const { txnId } = req.params;
    if (!txnId) {
      res.send('Missing transaction ID.');
      return;
    }
    if (!req.body) {
      res.send('Missing body.');
      return;
    }

    // Prevent duplicate processing of the same transaction
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

  joinRoom = async (roomId: string) => {
    await matrixClient.setStateEvent(
      roomId,
      'm.room.member',
      config.matrix.botName,
      {
        membership: 'join',
        avatar_url: BOT_AVATAR_URL,
        displayname: BOT_DISPLAY_NAME,
      },
    );
    await matrixClient.sendBotMessage(roomId, 'Hey everyone 👋');
    console.info(`✅ Successfully joined room: ${roomId}`);
  };

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    let [type, token] = req.headers.authorization?.split(' ') ?? [];
    token = token ?? req.query.access_token;

    if (type !== 'Bearer' || !token || token !== this.hsToken) {
      res.status(403).send({
        errcode: 'M_FORBIDDEN',
        error: 'Bad token supplied',
      });
      return;
    }
    next();
  };
}

export const appService = new AppService(config.matrix.hsToken);

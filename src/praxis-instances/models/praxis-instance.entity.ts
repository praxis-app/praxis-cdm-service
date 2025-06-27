import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PraxisInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * URL of the Praxis instance
   */
  @Column({ unique: true })
  apiUrl: string;

  /**
   * API key used by the Praxis instance to authenticate its requests to the bot (self)
   */
  @Column({ unique: true })
  apiKey: string;

  /**
   * API key used by the bot (self) to authenticate its requests to the Praxis instance
   */
  @Column({ unique: true })
  botApiKey: string;

  /**
   * ID of the server config for the Praxis instance
   */
  @Column({ unique: true })
  serverConfigId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

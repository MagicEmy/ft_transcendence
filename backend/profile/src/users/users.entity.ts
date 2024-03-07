import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({
    length: 50,
  })
  user_name: string;

  @Column()
  email: string;

  @Column({ type: 'bytea', nullable: true })
  avatar: Buffer;
}

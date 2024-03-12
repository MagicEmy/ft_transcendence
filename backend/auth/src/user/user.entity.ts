import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({
    length: 10,
  })
  intra_login: string;

  @Column({
    length: 50,
  })
  user_name: string;

  @Column({ type: 'bytea', nullable: true })
  avatar: Buffer;
}

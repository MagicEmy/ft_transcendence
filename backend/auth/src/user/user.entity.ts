import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id?: string;

  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({
    length: 10,
  })
  intra_login: string;

  @Column({
    length: 50,
    unique: true,
  })
  user_name: string;
}

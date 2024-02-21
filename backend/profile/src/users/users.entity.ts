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

  @Column()
  avatar_path: string; // this will be a base64 version of the image, not a path
}

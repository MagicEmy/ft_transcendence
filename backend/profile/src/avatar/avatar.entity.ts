import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'avatars' })
export class Avatar {
  @PrimaryColumn()
  user_id: string;

  @Column({ type: 'bytea', nullable: true })
  avatar: Buffer;

  @Column()
  mime_type: string;
}

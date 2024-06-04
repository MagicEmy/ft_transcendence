import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { KafkaTopic, PlayerInfo } from './user/enum/kafka.enum';
import { UserService } from './user/user.service';
import { Observable, of } from 'rxjs';
import { UserStatus } from './user/user-status.entity';
import { UserIdNameDto } from './user/dto/user-id-name-dto';
import { UserIdNameStatusDto } from './user/dto/user-id-name-status-dto';
import { IPlayerInfo } from './user/interface/kafka.interface';
import { NewUserDto } from './user/dto/new-user-dto';
import { AvatarDto } from './avatar/avatar-dto';
import { FriendshipDto } from './friend/dto/friendship-dto';
import { FriendService } from './friend/friend.service';
import { User } from './user/user.entity';

@Controller()
export class AppController {
  constructor(
    private readonly userService: UserService,
    private readonly friendService: FriendService,
  ) {}

  // Kafka-related methods

  @EventPattern(KafkaTopic.NEW_USER) //CHECKED
  createUserStatus(data: NewUserDto): Promise<UserStatus> {
    return this.userService.createUserStatus(data.userId);
  }

  @MessagePattern(PlayerInfo.TOPIC) //CHECKED
  async handlePlayerInfoRequest(data: any): Promise<Observable<IPlayerInfo>> {
    try {
      const player = {
        playerID: data.playerID,
        playerName: await this.userService.getUserName(data.playerID),
      };
      return of(player);
    } catch (error) {
      throw error;
    }
  }

  @EventPattern(KafkaTopic.STATUS_CHANGE) // CHECKED
  updateUserStatus(data): void {
    // more logic needs to come here!
    this.userService.changeUserStatus({
      userId: data.userId,
      status: data.newStatus,
    });
  }

  // Gateway-related methods

  @MessagePattern('setUserName')
  async setUserName(data: UserIdNameDto): Promise<Observable<User>> {
    return of(await this.userService.setUserName(data));
  }

  @MessagePattern('getUserName')
  async getUserName(userId: string): Promise<Observable<string>> {
    return of(await this.userService.getUserName(userId));
  }

  @MessagePattern('getUserIdNameStatus')
  async getUserIdNameStatus(
    userId: string,
  ): Promise<Observable<UserIdNameStatusDto>> {
    return of(await this.userService.getUserIdNameStatus(userId));
  }

  @MessagePattern('getStatus')
  async getUserStatus(userId: string): Promise<Observable<UserStatus>> {
    return of(await this.userService.getUserStatus(userId));
  }

  @MessagePattern('getAllUserIds')
  async getAllUserIds(): Promise<Observable<string[]>> {
    const allUserIds = await this.userService.getAllUserIds();
    return of(allUserIds);
  }

  @MessagePattern('getNoOfUsers')
  async getNoOfUsers(): Promise<Observable<number>> {
    return of(await this.userService.getTotalNoOfUsers());
  }

  //   AVATAR

  @MessagePattern('setAvatar')
  async setAvatar(avatarDto: AvatarDto): Promise<Observable<string>> {
    try {
      await this.userService.setAvatar({
        userId: avatarDto.userId,
        mimeType: avatarDto.mimeType,
        avatar: Buffer.from(avatarDto.avatar),
      });
    } catch (error) {
      console.log('Error when uploading avatar:', error);
      return of('Error');
    }
    return of('OK');
  }

  @MessagePattern('getAvatar')
  async getAvatar(userId: string): Promise<Observable<AvatarDto>> {
    return of(await this.userService.getAvatar(userId));
  }

  //   FRIEND

  @MessagePattern('addFriend')
  async addFriend(payload: FriendshipDto): Promise<Observable<FriendshipDto>> {
    return of(await this.friendService.createFriendship(payload));
  }

  @MessagePattern('unfriend')
  async unfriend(payload: FriendshipDto): Promise<Observable<FriendshipDto>> {
    return of(await this.friendService.removeFriendship(payload));
  }

  @MessagePattern('getFriendsIds')
  getFriends(userId: string) {
    return this.friendService.getFriends(userId);
  }
}

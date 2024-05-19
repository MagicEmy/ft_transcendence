import { Inject, Injectable } from '@nestjs/common';
import { UserService } from './user/user.service';
import { StatsService } from './stats/stats.service';
import { GameService } from './game/game.service';
import { FriendService } from './friend/friend.service';
import { FriendDto, ProfileDto } from './dto/profile-dto';
import { Opponent } from './utils/opponent.enum';
import { PlayerInfo } from './utils/kafka.enum';
import { IPlayerInfo } from './utils/kafka.interface';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('PLAYER_INFO_SERVICE') private playerInfoClient: ClientKafka,
    private readonly userService: UserService,
    private readonly statsService: StatsService,
    private readonly gameService: GameService,
    private readonly friendService: FriendService,
  ) {}

  async getFriends(user_id: string): Promise<FriendDto[]> {
    const friendIds = await this.friendService.getFriends(user_id);
    if (friendIds.length === 0) {
      return [];
    }
    const friendNames = [];
    const friendStatuses = [];
    for (const item of friendIds) {
      friendNames.push(await this.userService.getUsername(item));
      friendStatuses.push((await this.userService.getUserStatus(item)).status);
    }
    const friends = [];
    for (let i = 0; i < friendIds.length; i++) {
      friends.push({
        user_id: friendIds[i] || null,
        user_name: friendNames[i] || null,
        status: friendStatuses[i] || null,
      });
    }
    return friends;
  }

  async getLeaderboardRank(user_id: string): Promise<number> {
    return this.statsService.getRank(user_id);
  }

  async getProfileById(user_id: string): Promise<ProfileDto> {
    const profile: ProfileDto = {
      user_info: await this.userService.getUserInfoForProfile(user_id),
      friends: await this.getFriends(user_id),
      leaderboard_position: await this.getLeaderboardRank(user_id),
      total_players: await this.userService.getTotalNoOfUsers(),
      games_against_bot: await this.statsService.getGamesAgainst(
        user_id,
        Opponent.BOT,
      ),
      games_against_human: await this.statsService.getGamesAgainst(
        user_id,
        Opponent.HUMAN,
      ),
      most_frequent_opponent:
        await this.gameService.mostFrequentOpponent(user_id),
    };
    return profile;
  }

  async providePlayerInfoToGame(playerId: string): Promise<void> {
    const playerInfo: IPlayerInfo = {
      playerID: playerId,
      playerName: await this.userService.getUsername(playerId),
      playerRank: await this.getLeaderboardRank(playerId),
    };
    this.playerInfoClient.emit(
      PlayerInfo.REPLY,
      JSON.stringify({ playerInfo }),
    );
  }
}

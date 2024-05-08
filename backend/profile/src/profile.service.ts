import { Injectable } from '@nestjs/common';
import { UserService } from './user/user.service';
import { StatsService } from './stats/stats.service';
import { GameService } from './game/game.service';
import { FriendService } from './friend/friend.service';
import { FriendDto, ProfileDto } from './dto/profile-dto';
import { Opponent } from './utils/opponent.enum';

@Injectable()
export class ProfileService {
  constructor(
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
    for (const item of friendIds) {
      friendNames.push(await this.userService.getUsername(item));
    }
    const friends = [];
    for (let i = 0; i < friendIds.length; i++) {
      friends.push({
        user_id: friendIds[i] || null,
        user_name: friendNames[i] || null,
      });
    }
    return friends;
  }

  async getLeaderboardRank(user_id: string): Promise<number> {
    const leaderboard = await this.statsService.createLeaderboard({
      user_names: false,
    });
    const user = leaderboard.find((item) => item.user_id === user_id);
    return user.rank;
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
}

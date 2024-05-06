import { Injectable } from '@nestjs/common';
import { UserService } from './user/user.service';
import { StatsService } from './stats/stats.service';
import { GameService } from './game/game.service';
import { FriendService } from './friend/friend.service';
import { FriendDto, GameStatsDto, ProfileDto } from './dto/profile-dto';
import { ProfileUserInfoDto } from './dto/profile-user-info-dto';
import { Opponent } from './utils/opponent.enum';
import { GamesAgainstUserIdDto } from './dto/games-against-userid-dto';

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

  // MAKE SURE EVERYTHING WORKS WITH NO GAMES/FRIENDS/...
  async getProfileById(user_id: string): Promise<ProfileDto> {
    const userInfo: ProfileUserInfoDto =
      await this.userService.getUserInfoForProfile(user_id);
    const friends: FriendDto[] = await this.getFriends(user_id);
    const leaderboardPos: number = await this.getLeaderboardRank(user_id);
    const totalPlayers: number = await this.userService.getTotalNoOfUsers();
    const gamesAgainstBot: GameStatsDto =
      await this.statsService.getGamesAgainst(user_id, Opponent.BOT);
    const gamesAgainstHuman: GameStatsDto =
      await this.statsService.getGamesAgainst(user_id, Opponent.HUMAN);
    const mostFrequentOpponent: GamesAgainstUserIdDto =
      await this.gameService.mostFrequentOpponent(user_id);
    const mostFrequentOpponentUsername: string =
      await this.userService.getUsername(user_id);

    // ADD RETURNING AVATAR? OR SEPARATE CALL FROM FRONTEND?

    return {
      user_id: userInfo.user_id,
      user_name: userInfo.user_name,
      friends: friends,
      leaderboard_position: leaderboardPos,
      total_players: totalPlayers,
      most_frequent_opponent: {
        user_id: mostFrequentOpponent.user_id,
        user_name: mostFrequentOpponentUsername,
        games: mostFrequentOpponent.games,
      },
      games_against_human: gamesAgainstHuman,
      games_against_bot: gamesAgainstBot,
    };
  }
}

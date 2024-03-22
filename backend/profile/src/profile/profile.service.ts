import { Injectable } from '@nestjs/common';
import { FriendDto, GameStatsDto, ProfileDto } from './dto/profile-dto';
import { UserService } from 'src/user/user.service';
import { ProfileUserInfoDto } from 'src/user/dto/profile-user-info-dto';
import { StatsService } from 'src/stats/stats.service';
import { Opponent } from 'src/stats/opponent.enum';
import { GameService } from 'src/game/game.service';
import { GamesAgainstUserIdDto } from 'src/game/dto/games-against-userid-dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userService: UserService,
    private readonly statsService: StatsService,
    private readonly gameService: GameService,
  ) {}

  async getFriends(user_id: string): Promise<FriendDto[]> {
    const friendIds = await this.userService.getFriends(user_id);
    if (friendIds.length === 0) {
      return [];
    }
    const friendNames = [];
    for (const item of friendIds) {
      friendNames.push(await this.userService.getUserName(item));
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
    const mostFrequentOpponentUserName: string =
      await this.userService.getUserName(user_id);

    return {
      user_id: userInfo.user_id,
      user_name: userInfo.user_name,
      avatar: userInfo.avatar,
      friends: friends,
      leaderboard_position: leaderboardPos,
      total_players: totalPlayers,
      most_frequent_opponent: {
        user_id: mostFrequentOpponent.user_id,
        user_name: mostFrequentOpponentUserName,
        games: mostFrequentOpponent.games,
      },
      games_against_human: gamesAgainstHuman,
      games_against_bot: gamesAgainstBot,
    };
  }
}

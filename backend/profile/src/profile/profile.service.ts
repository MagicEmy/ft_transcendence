import { Injectable } from '@nestjs/common';
import { FriendDto, GameStatsDto, ProfileDto } from './dto/profile-dto';
import { UserService } from 'src/user/user.service';
import { ProfileUserInfoDto } from 'src/user/dto/profile-user-info-dto';
import { StatsService } from 'src/stats/stats.service';
import { Opponent } from 'src/stats/opponent.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly statsService: StatsService,
  ) {}

  async getFriends(user_id: string): Promise<FriendDto[]> {
    const friendIds = await this.userService.getFriends(user_id);
    const friendNamesRaw = await this.userRepository
      .createQueryBuilder('users')
      .select('user_name')
      .where('user_id IN (:...friendIds)', { friendIds })
      .getRawMany();
    const friends = friendNamesRaw.map((item, idx) => ({
      user_id: friendIds[idx],
      user_name: item.user_name,
    }));
    return friends;
  }

  async getProfileById(user_id: string): Promise<ProfileDto> {
    const userInfo: ProfileUserInfoDto =
      await this.userService.getUserInfoForProfile(user_id);

    const friends = await this.getFriends(user_id);
    const leaderboardPos = 1; // to be replaced by getLeaderboardPos(user_id) by statsService
    const totalPlayers = await this.userService.getTotalNoOfUsers();
    const gamesAgainstBot: GameStatsDto =
      await this.statsService.getGamesAgainst(user_id, Opponent.BOT);
    const gamesAgainstHuman: GameStatsDto =
      await this.statsService.getGamesAgainst(user_id, Opponent.HUMAN);

    // to be added: function to retrieve the most frequent opponent by gameService

    return {
      user_id: userInfo.user_id,
      user_name: userInfo.user_name,
      avatar: userInfo.avatar,
      friends: friends,
      leaderboard_position: leaderboardPos,
      total_players: totalPlayers,
      games_against_human: gamesAgainstHuman,
      games_against_bot: gamesAgainstBot,
      most_frequent_opponent: 'bot',
    };
  }
}

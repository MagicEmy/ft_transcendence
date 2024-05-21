import { Repository } from 'typeorm';
import { Stats } from './stats.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NewUserDto } from '../dto/new-user-dto';
import { Opponent } from '../enums/opponent.enum';
import { LeaderboardStatsDto } from 'src/dto/leaderboard-stats-dto';

export class StatsRepository extends Repository<Stats> {
  constructor(
    @InjectRepository(Stats) private statsRepository: Repository<Stats>,
  ) {
    super(
      statsRepository.target,
      statsRepository.manager,
      statsRepository.queryRunner,
    );
  }

  async createStatsRowNewUser(newUserDto: NewUserDto): Promise<void> {
    // adding one line for games against another human
    const statsHuman = this.statsRepository.create({
      user_id: newUserDto.user_id,
      opponent: Opponent.HUMAN,
    });
    await this.statsRepository.save(statsHuman);

    // adding one line for games against the bot
    const statsBot = this.statsRepository.create({
      user_id: newUserDto.user_id,
      opponent: Opponent.BOT,
    });
    await this.statsRepository.save(statsBot);
  }

  async getStatsForLeaderboard(): Promise<LeaderboardStatsDto[]> {
    return this.createQueryBuilder('stats')
      .select('user_id, wins, losses, draws, points_total')
      .where('opponent LIKE :opponent', { opponent: Opponent.HUMAN })
      .orderBy('points_total', 'DESC')
      .getRawMany();
  }
}

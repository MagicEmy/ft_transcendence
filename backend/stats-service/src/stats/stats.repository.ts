import { Repository } from 'typeorm';
import { Stats } from './stats.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NewUserDto } from './dto/new-user-dto';
import { LeaderboardStatsDto } from './dto/leaderboard-stats-dto';
import { Opponent } from './enum/opponent.enum';

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

  async createStatsRowNewUser(userId: string): Promise<void> {
    // adding one line for games against another human
    const statsHuman = this.create({
      user_id: userId,
      opponent: Opponent.HUMAN,
    });
    await this.save(statsHuman);

    // adding one line for games against the bot
    const statsBot = this.create({
      user_id: userId,
      opponent: Opponent.BOT,
    });
    await this.save(statsBot);
  }

  async getStatsForLeaderboard(): Promise<LeaderboardStatsDto[]> {
    return this.createQueryBuilder('stats')
      .select(
        'user_id AS "userId", wins, losses, draws, points_total AS "pointsTotal"',
      )
      .where('opponent LIKE :opponent', { opponent: Opponent.HUMAN })
      .orderBy('points_total', 'DESC')
      .getRawMany();
  }
}

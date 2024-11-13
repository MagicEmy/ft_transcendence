import { Repository } from 'typeorm';
import { Stats } from './stats.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaderboardStatsDto } from './dto/leaderboard-stats-dto';
import { Opponent } from './enum/opponent.enum';
import { RpcException } from '@nestjs/microservices';
import { InternalServerErrorException, Logger } from '@nestjs/common';

export class StatsRepository extends Repository<Stats> {
  private logger: Logger = new Logger(StatsRepository.name);
  constructor(
    @InjectRepository(Stats) private statsRepository: Repository<Stats>,
  ) {
    super(
      statsRepository.target,
      statsRepository.manager,
      statsRepository.queryRunner,
    );
  }

  async createStatsRow(userId: string, opponent: Opponent): Promise<Stats> {
    const statsRow = this.create({
      user_id: userId,
      opponent,
    });
    try {
      return this.save(statsRow);
    } catch (error) {
      if (error.code !== '23505') {
        // '23505' means duplicate entry
        this.logger.error(
          `Error when saving Stats row of user ${userId} against ${opponent}: `,
          error,
        );
        throw new RpcException(
          new InternalServerErrorException(
            error.driverError + '; ' + error.detail,	// to be tested
          ),
        );
      }
    }
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

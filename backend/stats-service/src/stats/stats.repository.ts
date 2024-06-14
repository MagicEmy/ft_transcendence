import { Repository } from 'typeorm';
import { Stats } from './stats.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaderboardStatsDto } from './dto/leaderboard-stats-dto';
import { Opponent } from './enum/opponent.enum';
import { RpcException } from '@nestjs/microservices';
import { InternalServerErrorException } from '@nestjs/common';

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

  async createStatsRowHuman(userId: string): Promise<Stats> {
    // adding one line for games against another human
    const statsHuman = this.create({
      user_id: userId,
      opponent: Opponent.HUMAN,
    });
    try {
      return this.save(statsHuman);
    } catch (error) {
      if (error.code !== '23505') {
        // '23505' means duplicate entry
        throw new RpcException(new InternalServerErrorException());
      }
    }
  }

  async createStatsRowBot(userId: string): Promise<Stats> {
    // adding one line for games against the bot
    const statsBot = this.create({
      user_id: userId,
      opponent: Opponent.BOT,
    });
    try {
      return this.save(statsBot);
    } catch (error) {
      throw new RpcException(new InternalServerErrorException());
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

import { Repository } from 'typeorm';
import { Stats } from './stats.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NewUserDto } from './dto/new-user-dto';
import { Opponent } from './opponent.enum';

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
    const statsHuman = new Stats();
    statsHuman.user_id = newUserDto.user_id;
    statsHuman.opponent = Opponent.HUMAN;
    await this.statsRepository.save(statsHuman);

    // adding one line for games against the bot
    const statsBot = new Stats();
    statsBot.user_id = newUserDto.user_id;
    statsBot.opponent = Opponent.BOT;
    await this.statsRepository.save(statsBot);

    console.log('New Stats rows added:');
    console.log(statsHuman);
    console.log(statsBot);
  }
}

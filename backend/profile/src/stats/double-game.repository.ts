import { Repository } from 'typeorm';
import { DoubleGame } from './double-game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DoubleGameStartDto } from './dto/double-game-start-dto';

export class DoubleGameRepository extends Repository<DoubleGame> {
  constructor(
    @InjectRepository(DoubleGame)
    private doubleGameRepository: Repository<DoubleGame>,
  ) {
    super(
      doubleGameRepository.target,
      doubleGameRepository.manager,
      doubleGameRepository.queryRunner,
    );
  }

  async createDoubleGame(
    doubleGameStartDto: DoubleGameStartDto,
  ): Promise<DoubleGame> {
    const { game_id, left_player_id, right_player_id, game_start } =
      doubleGameStartDto;

    const doubleGame: DoubleGame = {
      game_id,
      left_player_id,
      right_player_id,
      game_start,
      game_end: null,
      left_score: 0,
      right_score: 0,
    };

    await this.save(doubleGame);
    return doubleGame;
  }
}

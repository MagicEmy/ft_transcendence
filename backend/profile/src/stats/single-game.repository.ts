import { Repository } from 'typeorm';
import { SingleGame } from './single-game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SingleGameStartDto } from './dto/single-game-start-dto';

export class SingleGameRepository extends Repository<SingleGame> {
  constructor(
    @InjectRepository(SingleGame)
    private singleGameRepository: Repository<SingleGame>,
  ) {
    super(
      singleGameRepository.target,
      singleGameRepository.manager,
      singleGameRepository.queryRunner,
    );
  }

  async createSingleGame(
    singleGameStartDto: SingleGameStartDto,
  ): Promise<SingleGame> {
    const { game_id, player_id, game_start } = singleGameStartDto;

    const singleGame: SingleGame = {
      game_id,
      player_id,
      game_start,
      game_end: null,
      score: 0,
    };

    await this.save(singleGame);
    return singleGame;
  }
}

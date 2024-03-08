import { Repository } from 'typeorm';
import { SingleGame } from './single-game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSingleGameDto } from './dto/create-single-game-dto';

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
    createSingleGameDto: CreateSingleGameDto,
  ): Promise<SingleGame> {
    const { game_id, player_id, game_start } = createSingleGameDto;

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

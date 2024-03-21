import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GameEndDto } from './dto/game-end-dto';

export class GameRepository extends Repository<Game> {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {
    super(
      gameRepository.target,
      gameRepository.manager,
      gameRepository.queryRunner,
    );
  }

  async createGame(gameEndDto: GameEndDto): Promise<Game> {
    const game: Game = {
      player1_id: gameEndDto.player1_id,
      player2_id: gameEndDto.player2_id,
      player1_score: gameEndDto.player1_score,
      player2_score: gameEndDto.player2_score,
      duration: gameEndDto.duration,
      status: gameEndDto.status,
    };

    await this.save(game); // should this be in a try/catch block?
    console.log(game); // DEBUG STATEMENT
    return game;
  }
}

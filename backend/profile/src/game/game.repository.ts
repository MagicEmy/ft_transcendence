import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GameEndDto } from '../dto/game-end-dto';
import { GamesAgainstUserIdDto } from '../dto/games-against-userid-dto';

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

  async getMostFrequentOpponent(
    user_id: string,
  ): Promise<GamesAgainstUserIdDto> {
    const result = await this.manager.query(
      'WITH t AS (SELECT player1_id AS "user_id" FROM game WHERE player2_id = $1 UNION ALL SELECT player2_id AS "user_id" FROM game WHERE player1_id = $1) SELECT user_id, COUNT(user_id) AS "games" FROM t GROUP BY user_id ORDER BY games DESC',
      [user_id],
    );

    console.log(result);
    return result[0];
  }
}

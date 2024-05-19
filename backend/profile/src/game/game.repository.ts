import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GamesAgainstUserIdDto } from '../dto/games-against-userid-dto';
import { IGameStatus } from 'src/utils/kafka.interface';

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

  async createGame(gameStatus: IGameStatus): Promise<Game> {
    const game: Game = {
      player1_id: gameStatus.player1ID,
      player2_id: gameStatus.player2ID,
      player1_score: gameStatus.player1Score,
      player2_score: gameStatus.player2Score,
      //   duration: gameStatus.duration,	// TO BE ADDED
      duration: gameStatus.player1Score * gameStatus.player2Score * 1111,
      status: gameStatus.status,
    };

    await this.save(game); // should this be in a try/catch block?
    console.log(game); // DEBUG STATEMENT
    return game;
  }

  async getMostFrequentOpponent(
    user_id: string,
  ): Promise<GamesAgainstUserIdDto[]> {
    const result: GamesAgainstUserIdDto[] = await this.manager.query(
      'WITH t AS (SELECT player1_id AS "user_id" FROM game WHERE player2_id = $1 UNION ALL SELECT player2_id AS "user_id" FROM game WHERE player1_id = $1) SELECT user_id, COUNT(user_id) AS "games" FROM t GROUP BY user_id ORDER BY games DESC',
      [user_id],
    );
    const mostFrequent: GamesAgainstUserIdDto[] = result.filter(
      (item) => item.games === result[0].games,
    );
    return mostFrequent;
  }
}

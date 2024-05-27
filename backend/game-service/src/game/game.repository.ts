import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IGameStatus } from './interface/kafka.interface';
import { GamesAgainstUserIdDto } from './dto/games-against-userid-dto';

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
      duration: gameStatus.duration,
      status: gameStatus.status,
    };
	try {
		await this.save(game); // should this be in a try/catch block?
	} catch (error) {}
    return game;
  }

  async getMostFrequentOpponent(
    userId: string,
  ): Promise<GamesAgainstUserIdDto[]> {
    const result: GamesAgainstUserIdDto[] = await this.manager.query(
      'WITH t AS (SELECT player1_id AS "user_id" FROM games WHERE player2_id = $1 UNION ALL SELECT player2_id AS "user_id" FROM games WHERE player1_id = $1) SELECT user_id AS "userId", COUNT(user_id) AS "totalGames" FROM t GROUP BY userId ORDER BY totalGames DESC',
      [userId],
    );
    const mostFrequent: GamesAgainstUserIdDto[] = result.filter(
      (item) => item.totalGames === result[0].totalGames,
    );
    return mostFrequent;
  }
}

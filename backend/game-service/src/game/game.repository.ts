import { IsNull, Repository } from 'typeorm';
import { Game } from './game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IGameStatus } from './interface/kafka.interface';
import { GamesAgainstUserIdDto } from './dto/games-against-userid-dto';
import { RpcException } from '@nestjs/microservices';
import { InternalServerErrorException, Logger } from '@nestjs/common';

export class GameRepository extends Repository<Game> {
  private logger: Logger = new Logger();
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
    const game: Game = this.create({
      player1_id: gameStatus.player1ID,
      player2_id: gameStatus.player2ID,
      player1_score: gameStatus.player1Score,
      player2_score: gameStatus.player2Score,
      duration: gameStatus.duration,
      status: gameStatus.status,
    });
    try {
      await this.save(game);
    } catch (error) {
      this.logger.error(
        `Error when saving the game between user ${gameStatus.player1ID} and ${gameStatus.player2ID}`,
        error,
      );
      throw new RpcException(
        new InternalServerErrorException(
          error.driverError + '; ' + error.detail,	// to be tested
        ),
      );
    }
    return game;
  }

  async getMostFrequentOpponent(
    userId: string,
  ): Promise<GamesAgainstUserIdDto[]> {
    const result = await this.manager.query(
      'WITH t AS (SELECT player1_id AS "user_id" FROM games WHERE player2_id = $1 UNION ALL SELECT player2_id AS "user_id" FROM games WHERE player1_id = $1) SELECT user_id AS "user_id", COUNT(user_id) AS "total_games" FROM t GROUP BY user_id ORDER BY total_games DESC',
      [userId],
    );
    const gamesAgainstBot = (await this.findAndCount({where: {player1_id: userId, player2_id: IsNull()}}))[1];
    if (result.length > 0 && result[0].total_games >= gamesAgainstBot) {
      const mostFrequent: GamesAgainstUserIdDto[] = result
        .filter((item) => item.total_games === result[0].total_games)
        .map((item) => ({
          userId: item.user_id,
          totalGames: item.total_games,
        }));
        if (result[0].total_games = gamesAgainstBot) {
          mostFrequent.push({userId: null, totalGames: gamesAgainstBot})
        }
      return mostFrequent;
    } else if (gamesAgainstBot > 0) {
      return [{userId: null, totalGames: gamesAgainstBot}];
    } else {
      return [];
    }
  }
}

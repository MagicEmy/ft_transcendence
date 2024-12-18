import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameRepository } from './game.repository';
import { IGameStatus } from './interface/kafka.interface';
import { GamesAgainstUserIdDto } from './dto/games-against-userid-dto';
import { GameHistoryDto } from './dto/game-history-dto';
import { GameStatus, GameTypes, MatchTypes } from './enum/kafka.enum';
import { Opponent } from './enum/game.enum';
import { Game } from './game.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameRepository)
    private readonly gameRepository: GameRepository,
  ) {}

  // Kafka-related methods
  async createGame(gameStatus: IGameStatus): Promise<Game> {
    return this.gameRepository.createGame(gameStatus);
  }

  // Gateway-related methods
  async mostFrequentOpponent(userId: string): Promise<GamesAgainstUserIdDto[]> {
    const mostFrequentOpponentNoname: GamesAgainstUserIdDto[] =
      await this.gameRepository.getMostFrequentOpponent(userId);
    const mostFrequentOpponent: GamesAgainstUserIdDto[] = await Promise.all(
      mostFrequentOpponentNoname.map(async (opponent) => ({
        userId: opponent.userId,
        totalGames: opponent.totalGames,
      })),
    );
    return mostFrequentOpponent;
  }

  async getGameHistory(userId: string): Promise<GameHistoryDto[]> {
    const gameOverview: GameHistoryDto[] = await this.gameRepository
      .createQueryBuilder()
      .select('game_id', 'gameId')
      .addSelect('player1_id', 'player1Id')
      .addSelect('player1_score', 'player1Score')
      .addSelect('player2_id', 'player2Id')
      .addSelect('player2_score', 'player2Score')
      .where('player1_id = :user_id', { user_id: userId })
      .orWhere('player2_id = :user_id', { user_id: userId })
      .orderBy('game_id', 'DESC')
      .getRawMany();
    return gameOverview;
  }

  simulateGames(allUserIds: string[]): IGameStatus[] {
    const games: IGameStatus[] = [];
    for (const [idx, userId] of allUserIds.entries()) {
      // simulate 0-3 games against bot
      const repeats = Math.floor(Math.random() * 4);
      for (let i = 0; i < repeats; i++) {
        games.push(this.simulateOneGame(userId, Opponent.BOT));
      }
      let idxOpp = idx + 1;
      while (idxOpp < allUserIds.length) {
        // simulate 1-7 games against other userIds
        const repeats = Math.floor(Math.random() * 7) + 1;
        for (let i = 0; i < repeats; i++) {
          games.push(this.simulateOneGame(userId, allUserIds[idxOpp]));
        }
        idxOpp++;
      }
    }
    return games;
  }

  simulateOneGame(player1Id: string, player2Id: string): IGameStatus {
    const player1Score = Math.floor(Math.random() * 16);
    const player2Score = Math.floor(Math.random() * 16);
    const duration = Math.floor(Math.random() * 838284) + 181818;
    return {
      gameType: GameTypes.PONG,
      matchType: player2Id === Opponent.BOT ? MatchTypes.SOLO : MatchTypes.PAIR,
      status: GameStatus.COMPLETED,
      player1ID: player1Id,
      player1Score,
      player2ID: player2Id === Opponent.BOT ? null : player2Id,
      player2Score,
      duration,
    };
  }
}

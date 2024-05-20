import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameRepository } from './game.repository';
import { GamesAgainstUserIdDto } from '../dto/games-against-userid-dto';
import { GameHistoryDto } from '../dto/game-history-dto';
import { UserService } from 'src/user/user.service';
import { MostFrequentOpponentDto } from 'src/dto/profile-dto';
import { Opponent } from 'src/utils/opponent.enum';
import { IGameStatus } from 'src/utils/kafka.interface';
import { GameStatus, GameTypes, MatchTypes } from 'src/utils/kafka.enum';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameRepository)
    private readonly gameRepository: GameRepository,
    private readonly userService: UserService,
  ) {}

  async createGame(gameStatus: IGameStatus): Promise<void> {
    this.gameRepository.createGame(gameStatus);
  }

  async mostFrequentOpponent(
    user_id: string,
  ): Promise<MostFrequentOpponentDto[]> {
    const mostFrequentOpponentNoname: GamesAgainstUserIdDto[] =
      await this.gameRepository.getMostFrequentOpponent(user_id);
    const mostFrequentOpponent: MostFrequentOpponentDto[] = await Promise.all(
      mostFrequentOpponentNoname.map(async (opponent) => ({
        user_id: opponent.user_id,
        user_name:
          opponent.user_id === Opponent.BOT
            ? 'bot'
            : await this.userService.getUsername(opponent.user_id),
        games: opponent.games,
      })),
    );
    return mostFrequentOpponent;
  }

  async getGameHistory(user_id: string): Promise<GameHistoryDto[]> {
    // to be added: user_id validation
    const gameOverview: GameHistoryDto[] = await this.gameRepository
      .createQueryBuilder()
      .select('player1_id', 'player1_id')
      .addSelect('player1_score')
      .addSelect('player2_id', 'player2_id')
      .addSelect('player2_score')
      .where('player1_id = :user_id', { user_id })
      .orWhere('player2_id = :user_id', { user_id })
      .orderBy('game_id', 'DESC')
      .getRawMany();
    await Promise.all(
      gameOverview.map(async (item) => {
        item.player1_name =
          item.player1_id === 'bot'
            ? item.player1_id
            : await this.userService.getUsername(item.player1_id);
        item.player2_name =
          item.player2_id === 'bot'
            ? item.player2_id
            : await this.userService.getUsername(item.player2_id);
      }),
    );
    return gameOverview;
  }

  simulateGame(player1Id: string, player2Id: string): IGameStatus {
    const player1Score = Math.floor(Math.random() * 16);
    const player2Score = Math.floor(Math.random() * 16);
    const duration = Math.floor(Math.random() * 838284) + 181818;
    return {
      gameType: GameTypes.PONG,
      matchType: player2Id === Opponent.BOT ? MatchTypes.SOLO : MatchTypes.PAIR,
      status: GameStatus.COMPLETED,
      player1ID: player1Id,
      player1Score,
      player2ID: player2Id,
      player2Score,
      duration,
    };
  }
}

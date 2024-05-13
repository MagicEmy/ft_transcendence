import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameRepository } from './game.repository';
import { GameEndDto } from '../dto/game-end-dto';
import { GamesAgainstUserIdDto } from '../dto/games-against-userid-dto';
import { GameHistoryDto } from '../dto/game-history-dto';
import { UserService } from 'src/user/user.service';
import { MostFrequentOpponentDto } from 'src/dto/profile-dto';
import { Opponent } from 'src/utils/opponent.enum';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameRepository)
    private readonly gameRepository: GameRepository,
    private readonly userService: UserService,
  ) {}

  async createGame(gameEndDto: GameEndDto): Promise<void> {
    this.gameRepository.createGame(gameEndDto);
  }

  async mostFrequentOpponent(
    user_id: string,
  ): Promise<MostFrequentOpponentDto[]> {
    const mostFrequentOpponentNoname: GamesAgainstUserIdDto[] =
      await this.gameRepository.getMostFrequentOpponent(user_id);
    const mostFrequentOpponent: MostFrequentOpponentDto[] = [];
    await Promise.all(
      mostFrequentOpponentNoname.map(async (opponent) => {
        mostFrequentOpponent.push({
          user_id: opponent.user_id,
          user_name:
            opponent.user_id === Opponent.BOT
              ? 'bot'
              : await this.userService.getUsername(opponent.user_id),
          games: opponent.games,
        });
      }),
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
}

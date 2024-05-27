import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';
import { GameService } from './game/game.service';
import { GameHistoryDto } from './game/dto/game-history-dto';
import { GameStatus } from './game/enum/kafka.enum';
import { UserIdGamesDto } from './game/dto/user-id-games-dto';
import { IGameStatus } from './game/interface/kafka.interface';

@Controller()
export class AppController {
  constructor(private readonly gameService: GameService) {}

  // Kafka-related methods

  @EventPattern(GameStatus.TOPIC) // CHECKED
  handleGameEnd(data: any): void {
    this.gameService.createGame(data);
  }

  // Gateway-related methods

  @MessagePattern('getGameHistory')
  async getGameHistory(
    userId: string,
  ): Promise<Observable<GameHistoryDto[]>> {
    const gameHistory: GameHistoryDto[] = await this.gameService.getGameHistory(
      userId,
    );
    return of(gameHistory);
  }

  @MessagePattern('getMostFrequentOpponent')
  async getMostFrequentOpponent(
    userId: string,
  ): Promise<Observable<UserIdGamesDto[]>> {
    const mostFrequentOpponent: UserIdGamesDto[] =
      await this.gameService.mostFrequentOpponent(userId);
    return of(mostFrequentOpponent);
  }

  @MessagePattern('simulateGames')
  simulateGames(payload: string[]): Observable<IGameStatus[]> {
    return of(this.gameService.simulateGames(payload));
  }
}

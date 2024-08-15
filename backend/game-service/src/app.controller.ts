import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';
import { GameService } from './game/game.service';
import { GameHistoryDto } from './game/dto/game-history-dto';
import { GameStatus, MatchTypes } from './game/enum/kafka.enum';
import { IGameStatus } from './game/interface/kafka.interface';
import { Game } from './game/game.entity';
import { GamesAgainstUserIdDto } from './game/dto/games-against-userid-dto';

@Controller()
export class AppController {
  constructor(private readonly gameService: GameService) {}

  // Kafka-related methods

  @EventPattern(GameStatus.TOPIC) // CHECKED
  handleGameEnd(data: IGameStatus): void {
    if (data.matchType != MatchTypes.LOCAL) {
      // local games are not being saved in the database, as it is not clear who the opponent was
      this.gameService.createGame(data);
    }
  }

  // Gateway-related methods

  @MessagePattern('getGameHistory')
  async getGameHistory(userId: string): Promise<Observable<GameHistoryDto[]>> {
    return of(await this.gameService.getGameHistory(userId));
  }

  @MessagePattern('getMostFrequentOpponent')
  async getMostFrequentOpponent(
    userId: string,
  ): Promise<Observable<GamesAgainstUserIdDto[]>> {
    return of(await this.gameService.mostFrequentOpponent(userId));
  }

  @MessagePattern('simulateGames')
  simulateGames(payload: string[]): Observable<IGameStatus[]> {
    return of(this.gameService.simulateGames(payload));
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameRepository } from './game.repository';
import { GameEndDto } from './dto/game-end-dto';
import { GamesAgainstUserIdDto } from './dto/games-against-userid-dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameRepository)
    private readonly gameRepository: GameRepository,
  ) {}

  async createGame(gameEndDto: GameEndDto): Promise<void> {
    this.gameRepository.createGame(gameEndDto);
  }

  async mostFrequentOpponent(user_id: string): Promise<GamesAgainstUserIdDto> {
    const mostFrequentOpponent =
      await this.gameRepository.getMostFrequentOpponent(user_id);
    console.log(mostFrequentOpponent);
    return mostFrequentOpponent;
  }
}

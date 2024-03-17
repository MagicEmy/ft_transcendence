import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameRepository } from './game.repository';
import { GameEndDto } from './dto/game-end-dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(GameRepository)
    private gameRepository: GameRepository,
  ) {}

  async handleGameEnd(gameEndDto: GameEndDto): Promise<void> {
    this.gameRepository.createGame(gameEndDto);
  }
}

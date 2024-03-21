import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameRepository } from './game.repository';
import { GameEndDto } from './dto/game-end-dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameRepository)
    private readonly gameRepository: GameRepository,
  ) {}

  async createGame(gameEndDto: GameEndDto): Promise<void> {
    this.gameRepository.createGame(gameEndDto);
  }
}

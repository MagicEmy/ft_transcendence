import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SingleGame } from './single-game.entity';
import { SingleGameRepository } from './single-game.repository';
import { SingleGameStartDto } from './dto/single-game-start-dto';
import { SingleGameEndDto } from './dto/single-game-end-dto';
import { DoubleGame } from './double-game.entity';
import { DoubleGameRepository } from './double-game.repository';
import { DoubleGameStartDto } from './dto/double-game-start-dto';
import { DoubleGameEndDto } from './dto/double-game-end-dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(SingleGameRepository)
    private singleGameRepository: SingleGameRepository,
    @InjectRepository(DoubleGameRepository)
    private doubleGameRepository: DoubleGameRepository,
  ) {}

  async handleSingleGameStart(
    singleGameStartDto: SingleGameStartDto,
  ): Promise<void> {
    await this.singleGameRepository.createSingleGame(singleGameStartDto);
  }

  async handleSingleGameEnd({
    game_id,
    game_end,
    score,
  }: SingleGameEndDto): Promise<void> {
    const found = await this.getSingleGameById(game_id);

    found.game_end = game_end;
    found.score = score;
    this.singleGameRepository.save(found);
  }

  async handleDoubleGameStart(
    doubleGameStartDto: DoubleGameStartDto,
  ): Promise<void> {
    await this.doubleGameRepository.createDoubleGame(doubleGameStartDto);
  }

  async handleDoubleGameEnd({
    game_id,
    game_end,
    left_score,
    right_score,
  }: DoubleGameEndDto): Promise<void> {
    const found = await this.getDoubleGameById(game_id);

    found.game_end = game_end;
    found.left_score = left_score;
    found.right_score = right_score;
    this.doubleGameRepository.save(found);
  }

  async getSingleGameById(id: string): Promise<SingleGame> {
    const found = await this.singleGameRepository.findOneBy({ game_id: id });
    if (!found) {
      throw new NotFoundException(`Single game with id "${id}" not found`);
    } else {
      return found;
    }
  }

  async getDoubleGameById(id: string): Promise<DoubleGame> {
    const found = await this.doubleGameRepository.findOneBy({ game_id: id });
    if (!found) {
      throw new NotFoundException(`Double game with id "${id}" not found`);
    } else {
      return found;
    }
  }
}

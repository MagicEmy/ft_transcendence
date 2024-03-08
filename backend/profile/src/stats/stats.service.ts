import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SingleGameRepository } from './single-game.repository';
import { CreateSingleGameDto } from './dto/create-single-game-dto';
import { SingleGame } from './single-game.entity';
import { UpdateSingleGameEndDto } from './dto/update-single-game-end-dto';
import { DoubleGameRepository } from './double-game.repository';
import { CreateDoubleGameDto } from './dto/create-double-game-dto';
import { DoubleGame } from './double-game.entity';
import { UpdateDoubleGameEndDto } from './dto/update-double-game-end-dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(SingleGameRepository)
    private singleGameRepository: SingleGameRepository,
    @InjectRepository(DoubleGameRepository)
    private doubleGameRepository: DoubleGameRepository,
  ) {}

  async createSingleGame(
    createSingleGameDto: CreateSingleGameDto,
  ): Promise<SingleGame> {
    return this.singleGameRepository.createSingleGame(createSingleGameDto);
  }

  async createDoubleGame(
    createDoubleGameDto: CreateDoubleGameDto,
  ): Promise<DoubleGame> {
    return this.doubleGameRepository.createDoubleGame(createDoubleGameDto);
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

  async updateSingleGameEnd(
    id: string,
    updateSingleGameEndDto: UpdateSingleGameEndDto,
  ): Promise<SingleGame> {
    const { game_end, score } = updateSingleGameEndDto;
    const found = await this.getSingleGameById(id);

    found.game_end = game_end;
    found.score = score;
    this.singleGameRepository.save(found);
    return found;
  }

  async updateDoubleGameEnd(
    id: string,
    updateDoubleGameEndDto: UpdateDoubleGameEndDto,
  ): Promise<DoubleGame> {
    const { game_end, left_score, right_score } = updateDoubleGameEndDto;
    const found = await this.getDoubleGameById(id);

    found.game_end = game_end;
    found.left_score = left_score;
    found.right_score = right_score;
    this.doubleGameRepository.save(found);
    return found;
  }
}

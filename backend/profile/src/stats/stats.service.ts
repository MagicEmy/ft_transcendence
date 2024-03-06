import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SingleGameRepository } from './single-game.repository';
import { CreateSingleGameDto } from './dto/create-single-game-dto';
import { SingleGame } from './single-game.entity';
import { UpdateSingleGameEndDto } from './dto/update-single-game-end-dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(SingleGameRepository)
    private singleGameRepository: SingleGameRepository,
  ) {}

  async createSingleGame(
    createSingleGameDto: CreateSingleGameDto,
  ): Promise<SingleGame> {
    return this.singleGameRepository.createSingleGame(createSingleGameDto);
  }

  async getSingleGameById(id: string): Promise<SingleGame> {
    const found = await this.singleGameRepository.findOneBy({ game_id: id });
    if (!found) {
      throw new NotFoundException(`Single game with id ${id} not found`);
    } else {
      return found;
    }
  }

  async updateSingleGame(
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
}

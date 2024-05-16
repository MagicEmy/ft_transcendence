import { Repository } from 'typeorm';
import { Token } from './token-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenDto } from './dto/refresh-token-dto';

export class TokenRepository extends Repository<Token> {
  constructor(
    @InjectRepository(Token) private tokenRepository: Repository<Token>,
  ) {
    super(
      tokenRepository.target,
      tokenRepository.manager,
      tokenRepository.queryRunner,
    );
  }

  async createRefreshToken(refreshTokenDto: RefreshTokenDto): Promise<Token> {
    const token = this.create(refreshTokenDto);
    try {
      this.save(token);
    } catch (error) {
      // TBD: do we want to rewrite the token or maybe invalidate it?
    }
    return token;
  }

  async replaceOrCreateRefreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<Token> {
    const { user_id, refresh_token } = refreshTokenDto;
    const token = await this.findOneBy({ user_id });
    if (!token) {
      return this.createRefreshToken(refreshTokenDto);
    } else {
      token.refresh_token = refresh_token;
      return this.save(token);
    }
  }
}

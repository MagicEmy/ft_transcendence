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
    const { userId, refreshToken } = refreshTokenDto;
    const token = this.create({ user_id: userId, refresh_token: refreshToken });
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
    const { userId, refreshToken } = refreshTokenDto;
    const token = await this.findOneBy({ user_id: userId });
    if (!token) {
      return this.createRefreshToken(refreshTokenDto);
    } else {
      token.refresh_token = refreshToken;
      return this.save(token);
    }
  }
}

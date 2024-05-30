import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Observable, lastValueFrom, map, mergeMap, tap } from 'rxjs';
import { LeaderboardStatsDto } from './dto/leaderboard-stats-dto';
import { UserStatusEnum } from './enum/kafka.enum';
import { ProfileDto, UserIdNameStatusDto } from './dto/profile-dto';
import { IGameStatus } from './interface/kafka.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarDto } from './dto/avatar-dto';
import { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth/jwt-auth-guard';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './jwt-auth/auth.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // AUTH

  // a uuid verification of userId is needed here
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req, @Res() resp: Response, @Body() userId: string): Response {
    resp.clearCookie(this.configService.get('JWT_ACCESS_TOKEN_COOKIE_NAME'));
    resp.clearCookie(this.configService.get('JWT_REFRESH_TOKEN_COOKIE_NAME'));
    this.authService.deleteRefreshTokenFromDB({ userId: userId });
    return resp.sendStatus(200);
  }

  //   @Get('/tokens')
  //   generateJwtTokens(
  //     @Body() jwtPayloadDto: JwtPayloadDto,
  //   ): Observable<TokensDto> {
  //     return this.appService.generateJwtTokens(jwtPayloadDto);
  //   }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getUserInfo(@Req() req): any {
    return this.authService.getJwtTokenPayload(req.headers.cookie).pipe(
      map((user) => {
        if (!user) {
          throw new BadRequestException();
        } else {
          return {
            userId: user.sub,
            userName: user.userName,
          };
        }
      }),
    );
  }

  // PROFILE

  @UseGuards(JwtAuthGuard)
  @Get('/profile/:id')
  getProfile(@Param('id') userId: string): Promise<ProfileDto> {
    const response = this.appService.getProfile(userId);
    return lastValueFrom(response);
  }

  //   @Get('/mfo/:id')
  //   getMostFrequentOpponent(
  //     @Param('id') userId: string,
  //   ): Observable<MostFrequentOpponentDto[]> {
  //     return this.appService.getMostFrequentOpponent(userId);
  //   }

  //   @Get('/gamesagainst')
  //   getGamesAgainst(
  //     @Query('id') userId: string,
  //     @Query('opponent') opponent: Opponent,
  //   ) {
  //     return this.appService.getGamesAgainst({ userId, opponent });
  //   }

  //   @Get('userInfo')
  //   getUserInfo(@Body('userId') userId: string): Observable<UserIdNameStatusDto> {
  //     return this.appService.getUserIdNameStatus(userId);
  //   }

  // LEADERBOARD

  @UseGuards(JwtAuthGuard)
  @Get('/leaderboard')
  getLeaderboard(): Observable<LeaderboardStatsDto[]> {
    console.log('in getLeaderboard() - authorization worked!');
    return this.appService.getLeaderboard();
  }

  // GAME

  @UseGuards(JwtAuthGuard)
  @Get('/games/:id')
  getGameHistory(@Param('id') userId: string): Observable<string> {
    return this.appService.getGameHistory(userId);
  }

  // USER

  @UseGuards(JwtAuthGuard)
  @Get('/username/:id')
  getUserName(@Param('id') userId: string): Observable<string> {
    return this.appService.getUserName(userId).pipe(
      map((userName) => {
        if (!userName) {
          throw new NotFoundException();
        } else {
          return userName;
        }
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('username')
  changeUserName(
    @Body('userId') userId: string,
    @Body('userName') userName: UserStatusEnum,
  ) {
    this.appService.updateUserName({ userId, userName });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/status/:id')
  getUserStatus(@Param('id') userId: string): Observable<string> {
    return this.appService.getUserStatus(userId).pipe(
      map((status) => {
        if (!status) {
          throw new NotFoundException();
        } else {
          return status;
        }
      }),
    );
  }

  //   @Patch('status')
  //   changeStatus(
  //     @Body('id') userId: string,
  //     @Body('status') status: UserStatusEnum,
  //   ) {
  //     this.appService.updateStatus({ userId, status });
  //   }

  //   @Get('/allUsers')
  //   getAllUserIds(): Observable<string[]> {
  //     return this.appService.getAllUserIds();
  //   }

  @Get('/simulate')
  simulateGames(): Observable<void> {
    return this.appService.getAllUserIds().pipe(
      mergeMap((allUserIds: string[]) =>
        this.appService.simulateGames(allUserIds),
      ),
      map((games: IGameStatus[]) => {
        games.forEach((game: IGameStatus) => {
          this.appService.createGameAndUpdateStats(game);
        });
      }),
    );
  }

  //   FRIENDS

  @UseGuards(JwtAuthGuard)
  @Post('/friend')
  createFriendship(
    @Body('userId') userId: string,
    @Body('friendId') friendId: string,
  ) {
    return this.appService.createFriendship({ userId, friendId });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/friend')
  removeFriendship(
    @Body('userId') userId: string,
    @Body('friendId') friendId: string,
  ) {
    return this.appService.removeFriendship({ userId, friendId });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/friends/:id')
  getFriends(@Param('id') userId: string): Observable<UserIdNameStatusDto[]> {
    return this.appService.getFriends(userId);
  }

  //   AVATAR

  @UseGuards(JwtAuthGuard)
  @Patch('/avatar/:id')
  @UseInterceptors(FileInterceptor('avatar'))
  changeAvatar(
    @Param('id') userId: string,
    @UploadedFile() image: Express.Multer.File,
  ): Observable<string> {
    return this.appService.setAvatar({
      userId: userId,
      avatar: image.buffer,
      mimeType: image.mimetype,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/avatar/:id')
  getAvatar(
    @Param('id') user_id: string,
    @Res({ passthrough: true }) res: Response,
  ): Observable<StreamableFile> {
    return this.appService.getAvatar(user_id).pipe(
      map((avatarDto: AvatarDto) => {
        if (!avatarDto) {
          throw new NotFoundException();
        }
        res.set({
          'Content-Type': `${avatarDto.mimeType}`,
        });
        return new StreamableFile(avatarDto.avatar);
      }),
    );
  }
}

import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  Observable,
  catchError,
  concatMap,
  defaultIfEmpty,
  delay,
  forkJoin,
  from,
  map,
  mergeMap,
  of,
  throwError,
} from 'rxjs';
import { LeaderboardStatsDto } from './dto/leaderboard-stats-dto';
import { ProfileDto, UserIdNameStatusDto } from './dto/profile-dto';
import { IGameStatus } from './interface/kafka.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarDto } from './dto/avatar-dto';
import { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth/jwt-auth-guard';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './jwt-auth/auth.service';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FriendshipDto } from './dto/friendship-dto';
import { UserIdNameDto } from './dto/user-id-name-dto';
import { UploadFileDto } from './dto/upload-file-dto';
import { Opponent } from './enum/opponent.enum';
import { GameHistoryDto } from './dto/game-history-dto';
import { extractTokenFromCookies } from './utils/cookie-utils';
import { GetUserId } from './utils/get-user-id.decorator';
import { UserStatusEnum } from './enum/kafka.enum';

@UseFilters()
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  // DASHBOARD & SETTINGS - add something for status - TBD

  // AUTH

  @ApiTags('logout')
  @Post('logout')
  logout(@Req() req, @Res() resp: Response): void {
    const refreshToken = extractTokenFromCookies({
      cookie: req.get('cookie'),
      cookieName: this.configService.get('JWT_REFRESH_TOKEN_COOKIE_NAME'),
    });
    if (refreshToken) {
      this.authService.deleteRefreshTokenFromDB({
        refreshToken: refreshToken,
      });
    }
    resp.clearCookie(this.configService.get('JWT_ACCESS_TOKEN_COOKIE_NAME'));
    resp.clearCookie(this.configService.get('JWT_REFRESH_TOKEN_COOKIE_NAME'));
    resp.clearCookie('userId');
    resp.sendStatus(200);
  }

  @ApiTags('auth')
  @UseGuards(JwtAuthGuard)
  @Get('/jwtValid')
  getJwtTokens(): boolean {
    return true;
  }

  @ApiTags('profile')
  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getUserInfo(@Req() req): Observable<UserIdNameDto> {
    return this.authService.getUserIdName(req.headers.cookie);
  }

  // PROFILE

  @ApiTags('profile')
  @UseGuards(JwtAuthGuard)
  @Get('/profile/:id')
  async getProfile(
    @Param('id', ParseUUIDPipe) userId: string,
    @GetUserId() requestingUserId: string,
  ): Promise<Observable<ProfileDto>> {
    return forkJoin({
      userInfo: this.appService.getUserIdNameStatus(userId, requestingUserId),
      leaderboard: this.appService.getLeaderboardPositionAndTotalPoints(userId),
      totalPlayers: this.appService.getTotalNoOfUsers(),
      gamesAgainstHuman: this.appService.getGamesAgainst({
        userId,
        opponent: Opponent.HUMAN,
      }),
      gamesAgainstBot: this.appService.getGamesAgainst({
        userId,
        opponent: Opponent.BOT,
      }),
      mostFrequentOpponent: this.appService.getMostFrequentOpponent(userId),
    }).pipe(
      map((result) => ({
        userInfo: result.userInfo,
        leaderboard: result.leaderboard,
        totalPlayers: result.totalPlayers,
        gamesAgainstHuman: result.gamesAgainstHuman,
        gamesAgainstBot: result.gamesAgainstBot,
        mostFrequentOpponent: result.mostFrequentOpponent,
      })),
    );
  }

  // LEADERBOARD

  @ApiTags('leaderboard')
  @UseGuards(JwtAuthGuard)
  @Get('/leaderboard')
  async getLeaderboard(): Promise<Observable<LeaderboardStatsDto[]>> {
    return this.appService.getLeaderboard();
  }

  // GAME

  @ApiTags('game history')
  @UseGuards(JwtAuthGuard)
  @Get('/games/:id')
  getGameHistory(
    @Param('id', ParseUUIDPipe) userId: string,
  ): Observable<GameHistoryDto[]> {
    return this.appService.getGameHistory(userId);
  }

  // USER

  @ApiTags('user')
  @UseGuards(JwtAuthGuard)
  @Get('/username/:id')
  getUserName(@Param('id', ParseUUIDPipe) userId: string): Observable<string> {
    return this.appService.getUserName(userId);
  }

  @ApiTags('user')
  @UseGuards(JwtAuthGuard)
  @Patch('username')
  changeUserName(
    @Body(ValidationPipe) userIdNameDto: UserIdNameDto,
  ): Observable<void | { error: any }> {
    return this.appService.updateUserName(userIdNameDto);
  }

  @ApiTags('status')
  @UseGuards(JwtAuthGuard)
  @Get('/status/:id')
  getUserStatus(
    @Param('id', ParseUUIDPipe) userId: string,
  ): Observable<string> {
    return this.appService.getUserStatus(userId);
  }

  @ApiTags('status')
  @UseGuards(JwtAuthGuard)
  @Patch('/status')
  setUserStatus(
    @Body('userId', ParseUUIDPipe) userId: string,
    @Body('newStatus') newStatus: UserStatusEnum,
  ): void {
    this.appService.setUserStatus(userId, newStatus);
  }

  @ApiTags('user')
  @UseGuards(JwtAuthGuard)
  @Get('/allUsers')
  getAllUserIds(): Observable<string[]> {
    return this.appService.getAllUserIds();
  }

  //   FRIENDS

  @ApiTags('friends')
  @UseGuards(JwtAuthGuard)
  @Post('/friend')
  createFriendship(
    @Body(ValidationPipe) friendshipDto: FriendshipDto,
  ): Observable<string> {
    return this.appService.createFriendship(friendshipDto);
  }

  @ApiTags('friends')
  @UseGuards(JwtAuthGuard)
  @Delete('/friend')
  removeFriendship(
    @Body(ValidationPipe) friendshipDto: FriendshipDto,
  ): Observable<string> {
    return this.appService.removeFriendship(friendshipDto);
  }

  @ApiTags('friends')
  @UseGuards(JwtAuthGuard)
  @Get('/friends/:id')
  getFriends(
    @Param('id', ParseUUIDPipe) userId: string,
  ): Observable<UserIdNameStatusDto[]> {
    return this.appService.getFriends(userId);
  }

  //   AVATAR

  @ApiTags('avatar')
  @UseGuards(JwtAuthGuard)
  @Patch('/avatar/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  changeAvatar(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() data: UploadFileDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500 * 1024 }), // 500 kB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    image: Express.Multer.File,
  ): Observable<string> {
    try {
      const avatar = this.appService.setAvatar({
        userId: userId,
        avatar: image.buffer,
        mimeType: image.mimetype,
      });
      return avatar;
    } catch (error) {
      throw error;
    }
  }

  @ApiTags('avatar')
  @UseGuards(JwtAuthGuard)
  @Get('/avatar/:id')
  getAvatar(
    @Param('id', ParseUUIDPipe) userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Observable<StreamableFile> {
    return this.appService.getAvatar(userId).pipe(
      catchError((error) => throwError(() => error)),
      map((avatarDto: AvatarDto) => {
        res.set({
          'Content-Type': `${avatarDto.mimeType}`,
        });
        return new StreamableFile(avatarDto.avatar);
      }),
    );
  }

  // SIMULATIONS

//   @ApiTags('simulation')
//   @Get('/create_users/:no')
//   createMockUsers(@Param('no', ParseIntPipe) no: number): Observable<string[]> {
//     return this.authService.createMockUsers(no);
//   }

//   @ApiTags('simulation')
//   @Get('/simulate')
//   simulateGames(): Observable<void> {
//     return this.appService.getAllUserIds().pipe(
//       defaultIfEmpty([]),
//       mergeMap((allUserIds: string[]) =>
//         this.appService.simulateGames(allUserIds).pipe(defaultIfEmpty([])),
//       ),
//       mergeMap((games: IGameStatus[]) => {
//         if (games.length > 0) {
//           return from(games).pipe(
//             defaultIfEmpty([]),
//             concatMap((game: IGameStatus) =>
//               of(game).pipe(
//                 delay(200),
//                 map((game) => this.appService.createGameAndUpdateStats(game)),
//               ),
//             ),
//           );
//         } else {
//           return of(undefined);
//         }
//       }),
//     );
//   }
}

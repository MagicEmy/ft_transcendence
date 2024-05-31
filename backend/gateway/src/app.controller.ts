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
import { Observable, delay, from, map, mergeMap } from 'rxjs';
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
import { UserIdDto } from './dto/user-id-dto';
import { UploadFileDto } from './dto/upload-file-dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // AUTH

  // a uuid verification of userId is needed here
  @ApiTags('logout')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @Req() req,
    @Res() resp: Response,
    @Body() userIdDto: UserIdDto,
  ): Response {
    resp.clearCookie(this.configService.get('JWT_ACCESS_TOKEN_COOKIE_NAME'));
    resp.clearCookie(this.configService.get('JWT_REFRESH_TOKEN_COOKIE_NAME'));
    this.authService.deleteRefreshTokenFromDB({ userId: userIdDto.userId });
    return resp.sendStatus(200);
  }

  //   @Get('/tokens')
  //   generateJwtTokens(
  //     @Body() jwtPayloadDto: JwtPayloadDto,
  //   ): Observable<TokensDto> {
  //     return this.appService.generateJwtTokens(jwtPayloadDto);
  //   }

  @ApiTags('profile')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getUserInfo(@Req() req): Observable<UserIdNameDto> {
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

  @ApiTags('profile')
  @UseGuards(JwtAuthGuard)
  @Get('/profile/:id')
  getProfile(@Param('id') userId: string): Observable<ProfileDto> {
    return this.appService.getProfile(userId);
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

  @ApiTags('leaderboard')
  @UseGuards(JwtAuthGuard)
  @Get('/leaderboard')
  getLeaderboard(): Observable<LeaderboardStatsDto[]> {
    return this.appService.getLeaderboard();
  }

  // GAME

  @ApiTags('game history')
  @UseGuards(JwtAuthGuard)
  @Get('/games/:id')
  getGameHistory(@Param('id') userId: string): Observable<string> {
    return this.appService.getGameHistory(userId);
  }

  // USER

  @ApiTags('user')
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

  @ApiTags('user')
  @UseGuards(JwtAuthGuard)
  @Patch('username')
  changeUserName(@Body() userIdNameDto: UserIdNameDto): void {
    this.appService.updateUserName(userIdNameDto);
  }

  @ApiTags('status')
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

  //   FRIENDS

  @ApiTags('friends')
//   @UseGuards(JwtAuthGuard)
  @Post('/friend')
  createFriendship(@Body() friendshipDto: FriendshipDto): Observable<string> {
    return this.appService.createFriendship(friendshipDto);
  }

  @ApiTags('friends')
//   @UseGuards(JwtAuthGuard)
  @Delete('/friend')
  removeFriendship(@Body() friendshipDto: FriendshipDto): Observable<string> {
    return this.appService.removeFriendship(friendshipDto);
  }

  @ApiTags('friends')
  @UseGuards(JwtAuthGuard)
  @Get('/friends/:id')
  getFriends(@Param('id') userId: string): Observable<UserIdNameStatusDto[]> {
    return this.appService.getFriends(userId);
  }

  //   AVATAR

  @ApiTags('avatar')
  @UseGuards(JwtAuthGuard)
  @Patch('/avatar/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  changeAvatar(
    @Param('id') userId: string,
    @Body() data: UploadFileDto,
    @UploadedFile() image: Express.Multer.File,
  ): Observable<string> {
    return this.appService.setAvatar({
      userId: userId,
      avatar: image.buffer,
      mimeType: image.mimetype,
    });
  }

  @ApiTags('avatar')
  @UseGuards(JwtAuthGuard)
  @Get('/avatar/:id')
  getAvatar(
    @Param('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Observable<StreamableFile> {
    return this.appService.getAvatar(userId).pipe(
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

  // SIMULATIONS

  @ApiTags('simulation')
  @Get('/create_users/:no')
  createMockUsers(@Param('no') no: number): Observable<string[]> {
    return this.authService.createMockUsers(no);
  }

  @ApiTags('simulation')
  @Get('/simulate')
  simulateGames(): Observable<void> {
    return this.appService.getAllUserIds().pipe(
      mergeMap((allUserIds: string[]) =>
        this.appService.simulateGames(allUserIds),
      ),
      mergeMap((games: IGameStatus[]) => {
        return from(games).pipe(
          delay(400),
          map((game) => this.appService.createGameAndUpdateStats(game)),
        );
      }),
    );
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Observable, map, mergeMap, tap } from 'rxjs';
import { LeaderboardStatsDto } from './dto/leaderboard-stats-dto';
import { UserStatusEnum } from './enum/kafka.enum';
import { ProfileDto, UserIdNameStatusDto } from './dto/profile-dto';
import { IGameStatus } from './interface/kafka.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarDto } from './dto/avatar-dto';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // PROFILE

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

  @Get('/leaderboard')
  getLeaderboard(): Observable<LeaderboardStatsDto[]> {
    return this.appService.getLeaderboard();
  }

  // GAME

  @Get('/games/:id')
  getGameHistory(@Param('id') userId: string): Observable<string> {
    return this.appService.getGameHistory(userId);
  }

  // USER

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

  @Patch('username')
  changeUserName(
    @Body('userId') userId: string,
    @Body('userName') userName: UserStatusEnum,
  ) {
    this.appService.updateUserName({ userId, userName });
  }

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

  @Post('/friend')
  createFriendship(
    @Body('userId') userId: string,
    @Body('friendId') friendId: string,
  ) {
    return this.appService.createFriendship({ userId, friendId });
  }

  @Delete('/friend')
  removeFriendship(
    @Body('userId') userId: string,
    @Body('friendId') friendId: string,
  ) {
    return this.appService.removeFriendship({ userId, friendId });
  }

  @Get('/friends/:id')
  getFriends(@Param('id') userId: string): Observable<UserIdNameStatusDto[]> {
    return this.appService.getFriends(userId);
  }

  //   AVATAR

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

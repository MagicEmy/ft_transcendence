import { Inject, Injectable, Logger, UseFilters } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import {
  Observable,
  catchError,
  forkJoin,
  from,
  iif,
  map,
  of,
  switchMap,
  mergeMap,
  throwError,
  lastValueFrom,
} from 'rxjs';
import { IGameStatus } from './interface/kafka.interface';
import { FriendshipDto } from './dto/friendship-dto';
import { GameStatus, KafkaTopic, UserStatusEnum } from './enum/kafka.enum';
import {
  GamesAgainstUserIdDto,
  UserIdOpponentDto,
} from './dto/games-against-dto';
import {
  GameStatsDto,
  MostFrequentOpponentDto,
  PositionTotalPointsDto,
  UserIdNameStatusDto,
} from './dto/profile-dto';
import { LeaderboardStatsDto } from './dto/leaderboard-stats-dto';
import { UserIdNameDto } from './dto/user-id-name-dto';
import { AvatarDto } from './dto/avatar-dto';
import { GameHistoryDto } from './dto/game-history-dto';
import { Opponent } from './enum/opponent.enum';
import { Kafka } from '@nestjs/microservices/external/kafka.interface';
import { StatusChangeDto } from './dto/status-change-dto';

@Injectable()
export class AppService {
  private logger: Logger = new Logger(AppService.name);
  constructor(
    @Inject('GameService') private readonly gameService: ClientProxy,
    @Inject('UserService') private readonly userService: ClientProxy,
    @Inject('StatsService') readonly statsService: ClientProxy,
  ) {}

  //   PROFILE

  getGamesAgainst(userIdOpponentDto: UserIdOpponentDto) {
    const pattern = 'getGamesAgainst';
    const payload: UserIdOpponentDto = userIdOpponentDto;
    return this.statsService
      .send<GameStatsDto>(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(
            () =>
              new RpcException(
                error.response || error || 'An unknown error occurred',
              ),
          ),
        ),
      );
  }

  getUserIdNameStatus(userId: string): Observable<UserIdNameStatusDto> {
    const pattern = 'getUserIdNameStatus';
    const payload = userId;
    return this.userService.send<UserIdNameStatusDto>(pattern, payload).pipe(
      catchError((error) => {
        this.logger.error('Caught: ', error, typeof error);
        return throwError(
          () =>
            new RpcException(
              error.response || error || 'An unknown error occurred',
            ),
        );
      }),
    );
  }

  //   LEADERBOARD

  getLeaderboard(): Observable<LeaderboardStatsDto[]> {
    const pattern = 'getLeaderboard';
    const payload = {};
    return this.statsService.send<LeaderboardStatsDto[]>(pattern, payload).pipe(
      switchMap((leaderboard: LeaderboardStatsDto[]) =>
        iif(
          () => leaderboard.length > 0,
          forkJoin(
            leaderboard.map((user: LeaderboardStatsDto) =>
              from(this.getUserName(user.userId)).pipe(
                map((userName) => {
                  user.userName = userName;
                  return user;
                }),
              ),
            ),
          ),
          of([]),
        ),
      ),
    );
  }

  getLeaderboardPositionAndTotalPoints(
    userId: string,
  ): Observable<PositionTotalPointsDto> {
    const pattern = 'getPositionAndTotalPoints';
    const payload = userId;
    return this.statsService
      .send<PositionTotalPointsDto>(pattern, payload)
      .pipe(
        catchError((error) => {
          this.logger.error('Caught: ', error, typeof error);
          return throwError(
            () =>
              new RpcException(
                error.response || error || 'An unknown error occurred',
              ),
          );
        }),
      );
  }

  //   USER

  getUserName(userId: string | null): Observable<string> {
    if (!userId) {
      return of(Opponent.BOT);
    }
    const pattern = 'getUserName';
    const payload = userId;
    return this.userService.send<string>(pattern, payload).pipe(
      catchError((error) => {
        this.logger.error('Caught: ', error, typeof error);
        return throwError(
          () =>
            new RpcException(
              error.response || error || 'An unknown error occurred',
            ),
        );
      }),
    );
  }

  updateUserName(userIdNameDto: UserIdNameDto): Observable<void> {
    const pattern = 'setUserName';
    const payload = userIdNameDto;
    return this.userService.send(pattern, payload).pipe(
      catchError((error) => {
        this.logger.error('Caught: ', error, typeof error);
        return throwError(
          () =>
            new RpcException(
              error.response || error || 'An unknown error occurred',
            ),
        );
      }),
    );
  }

  getUserStatus(userId: string): Observable<string> {
    const pattern = 'getStatus';
    const payload = userId;
    return this.userService.send<string>(pattern, payload).pipe(
      catchError((error) => {
        this.logger.error('Caught: ', error, typeof error);
        return throwError(
          () =>
            new RpcException(
              error.response || error || 'An unknown error occurred',
            ),
        );
      }),
    );
  }

  setUserStatus(userId: string, status: UserStatusEnum): void {
    const pattern = KafkaTopic.STATUS_CHANGE;
    const payload: StatusChangeDto = {
      userId,
      newStatus: status,
    };
    this.userService.emit(pattern, payload).pipe(
      catchError((error) => {
        this.logger.error(
          'Caught error when trying to change status: ',
          error,
          typeof error,
        );
        return of(undefined);
      }),
    );
  }

  getAllUserIds(): Observable<string[]> {
    const pattern = 'getAllUserIds';
    const payload = {};
    return this.userService.send<string[]>(pattern, payload).pipe(
      catchError((error) => {
        this.logger.error('Caught: ', error, typeof error);
        return throwError(
          () =>
            new RpcException(
              error.response || error || 'An unknown error occurred',
            ),
        );
      }),
    );
  }

  getTotalNoOfUsers(): Observable<number> {
    const pattern = 'getNoOfUsers';
    const payload = {};
    return this.userService.send<number>(pattern, payload).pipe(
      catchError((error) => {
        this.logger.error('Caught: ', error, typeof error);
        return throwError(
          () =>
            new RpcException(
              error.response || error || 'An unknown error occurred',
            ),
        );
      }),
    );
  }

  //   GAMES

  getGameHistory(userId: string): Observable<GameHistoryDto[]> {
    const pattern = 'getGameHistory';
    const payload = userId;
    return this.gameService.send<GameHistoryDto[]>(pattern, payload).pipe(
      catchError((error) =>
        throwError(
          () =>
            new RpcException(
              error.response || error || 'An unknown error occurred',
            ),
        ),
      ),
      mergeMap((games: GameHistoryDto[]) => {
        if (games.length === 0) {
          return of([]);
        }
        const gamesWithNames$ = games.map((game) =>
          forkJoin({
            player1Name: this.getUserName(game.player1Id),
            player2Name: this.getUserName(game.player2Id),
          }).pipe(
            map(({ player1Name, player2Name }) => ({
              ...game,
              player1Name,
              player2Name,
            })),
          ),
        );
        return forkJoin(gamesWithNames$);
      }),
    );
  }

  getMostFrequentOpponent(
    userId: string,
  ): Observable<MostFrequentOpponentDto[]> {
    const pattern = 'getMostFrequentOpponent';
    const payload = userId;
    return this.gameService
      .send<GamesAgainstUserIdDto[]>(pattern, payload)
      .pipe(
        switchMap((opponents: GamesAgainstUserIdDto[]) =>
          iif(
            () => opponents.length > 0,
            forkJoin(
              opponents.map((opponent: GamesAgainstUserIdDto) =>
                from(
                  this.getUserName(opponent.userId).pipe(
                    map((userName) => {
                      const mfo: MostFrequentOpponentDto = {
                        userId: opponent.userId,
                        userName: userName,
                        games: Number(opponent.totalGames),
                      };
                      return mfo;
                    }),
                  ),
                ),
              ),
            ),
            of([]),
          ),
        ),
      );
  }

  //   FRIENDS

  createFriendship(friendshipDto: FriendshipDto): Observable<string> {
    const pattern = 'addFriend';
    const payload = friendshipDto;
    return this.userService.send<string>(pattern, payload).pipe(
      catchError((error) => {
        this.logger.error('Caught: ', error, typeof error);
        return throwError(
          () =>
            new RpcException(
              error.response || error || 'An unknown error occurred',
            ),
        );
      }),
    );
  }

  removeFriendship(friendshipDto: FriendshipDto): Observable<string> {
    const pattern = 'unfriend';
    const payload = friendshipDto;
    return this.userService.send<string>(pattern, payload).pipe(
      catchError((error) => {
        this.logger.error('Caught: ', error, typeof error);
        return throwError(
          () =>
            new RpcException(
              error.response || error || 'An unknown error occurred',
            ),
        );
      }),
    );
  }

  @UseFilters()
  getFriends(userId: string): Observable<UserIdNameStatusDto[]> {
    return this.getFriendsIds(userId).pipe(
      switchMap((friends: string[]) =>
        iif(
          () => friends.length > 0,
          forkJoin(
            friends.map((friend: string) => this.getUserIdNameStatus(friend)),
          ),
          of([]),
        ),
      ),
    );
  }

  private getFriendsIds(userId: string): Observable<string[]> {
    const pattern = 'getFriendsIds';
    const payload = userId;
    return this.userService.send<string[]>(pattern, payload).pipe(
      catchError((error) => {
        this.logger.error('Caught: ', error, typeof error);
        return throwError(
          () =>
            new RpcException(
              error.response || error || 'An unknown error occurred',
            ),
        );
      }),
    );
  }

  // avatar

  setAvatar(avatarDto: AvatarDto): Observable<string> {
    const pattern = 'setAvatar';
    const payload = avatarDto;
    return this.userService.send<string>(pattern, payload).pipe(
      catchError((error) => {
        this.logger.error('Caught: ', error, typeof error);
        return throwError(
          () =>
            new RpcException(
              error.response || error || 'An unknown error occurred',
            ),
        );
      }),
    );
  }

  getAvatar(userId: string): Observable<AvatarDto | string> {
    const pattern = 'getAvatar';
    const payload = userId;
    return this.userService.send(pattern, payload).pipe(
      catchError((error) =>
        throwError(
          () =>
            new RpcException(
              error.response || error || 'An unknown error occurred',
            ),
        ),
      ),
      map((response) => {
        if (response) {
          return {
            userId: response.userId,
            mimeType: response.mimeType,
            avatar: Buffer.from(response.avatar),
          };
        }
      }),
    );
  }

  //   SIMULATION

  simulateGames(allUserIds: string[]): Observable<IGameStatus[]> {
    const pattern = 'simulateGames';
    const payload: string[] = allUserIds;
    return this.gameService.send<IGameStatus[]>(pattern, payload);
  }

  createGameAndUpdateStats(gameStatus: IGameStatus): void {
    const pattern = GameStatus.TOPIC;
    const payload: IGameStatus = gameStatus;
    this.statsService.emit(pattern, payload);
    this.gameService.emit(pattern, payload);
  }
}

import { Inject, Injectable, UseFilters } from '@nestjs/common';
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
} from 'rxjs';
import { IGameStatus } from './interface/kafka.interface';
import { FriendshipDto } from './dto/friendship-dto';
import { GameStatus } from './enum/kafka.enum';
import { UserIdOpponentDto } from './dto/games-against-dto';
import {
  GameStatsDto,
  MostFrequentOpponentDto,
  PositionTotalPointsDto,
  UserIdNameStatusDto,
} from './dto/profile-dto';
import { LeaderboardStatsDto } from './dto/leaderboard-stats-dto';
import { UserIdNameDto } from './dto/user-id-name-dto';
import { UserIdGamesDto } from './dto/user-id-games-dto';
import { AvatarDto } from './dto/avatar-dto';
import { GameHistoryDto } from './dto/game-history-dto';
import { Opponent } from './enum/opponent.enum';

@Injectable()
export class AppService {
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
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  getUserIdNameStatus(userId: string): Observable<UserIdNameStatusDto> {
    const pattern = 'getUserIdNameStatus';
    const payload = userId;
    return this.userService
      .send<UserIdNameStatusDto>(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
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

  getLeaderboardPositionAndTotalPoints(userId: string): Observable<PositionTotalPointsDto> {
    const pattern = 'getPositionAndTotalPoints';
    const payload = userId;
    return this.statsService
      .send<PositionTotalPointsDto>(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  //   USER

  getUserName(userId: string): Observable<string> {
	if (userId === Opponent.BOT) {
		return of(Opponent.BOT);
	}
    const pattern = 'getUserName';
    const payload = userId;
    return this.userService
      .send<string>(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  updateUserName(userIdNameDto: UserIdNameDto): Observable<void> {
    const pattern = 'setUserName';
    const payload = userIdNameDto;
    return this.userService
      .send(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  getUserStatus(userId: string): Observable<string> {
    const pattern = 'getStatus';
    const payload = userId;
    return this.userService
      .send<string>(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  //   updateStatus(userStatusDto: UserStatusDto): void {
  //     const pattern = KafkaTopic.STATUS_CHANGE;
  //     const payload = userStatusDto;
  //     this.userService.emit(pattern, payload);
  //   }

  getAllUserIds(): Observable<string[]> {
    const pattern = 'getAllUserIds';
    const payload = {};
    return this.userService
      .send<string[]>(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  getTotalNoOfUsers(): Observable<number> {
    const pattern = 'getNoOfUsers';
    const payload = {};
    return this.userService
      .send<number>(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  //   GAMES

  getGameHistory(userId: string): Observable<GameHistoryDto[]> {
    const pattern = 'getGameHistory';
    const payload = userId;
    return this.gameService.send<GameHistoryDto[]>(pattern, payload).pipe(
      catchError((error) => throwError(() => new RpcException(error.response))),
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
    return this.gameService.send<UserIdGamesDto[]>(pattern, payload).pipe(
      switchMap((opponents: UserIdGamesDto[]) =>
        iif(
          () => opponents.length > 0,
          forkJoin(
            opponents.map((opponent: UserIdGamesDto) =>
              from(
                this.getUserName(opponent.userId).pipe(
                  map((userName) => {
                    const mfo: MostFrequentOpponentDto = {
                      userId: opponent.userId,
                      userName: userName,
                      games: Number(opponent.games),
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
    return this.userService
      .send<string>(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  removeFriendship(friendshipDto: FriendshipDto): Observable<string> {
    const pattern = 'unfriend';
    const payload = friendshipDto;
    return this.userService
      .send<string>(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
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
    return this.userService
      .send<string[]>(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  // avatar

  setAvatar(avatarDto: AvatarDto): Observable<string> {
    const pattern = 'setAvatar';
    const payload = avatarDto;
    return this.userService
      .send<string>(pattern, payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  getAvatar(userId: string): Observable<AvatarDto | string> {
    const pattern = 'getAvatar';
    const payload = userId;
    return this.userService.send(pattern, payload).pipe(
      catchError((error) => throwError(() => new RpcException(error.response))),
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

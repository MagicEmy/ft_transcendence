import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  Observable,
  firstValueFrom,
  forkJoin,
  from,
  iif,
  map,
  of,
  switchMap,
} from 'rxjs';
import { IGameStatus } from './interface/kafka.interface';
import { FriendshipDto } from './dto/friendship-dto';
import { GameStatus } from './enum/kafka.enum';
import { Opponent } from './enum/opponent.enum';
import { UserIdOpponentDto } from './dto/games-against-dto';
import {
  GameStatsDto,
  MostFrequentOpponentDto,
  ProfileDto,
  UserIdNameStatusDto,
} from './dto/profile-dto';
import { LeaderboardStatsDto } from './dto/leaderboard-stats-dto';
import { UserIdNameDto } from './dto/user-id-name-dto';
import { UserIdGamesDto } from './dto/user-id-games-dto';
import { AvatarDto } from './dto/avatar-dto';

@Injectable()
export class AppService {
  constructor(
    @Inject('GameService') private readonly gameService: ClientProxy,
    @Inject('UserService') private readonly userService: ClientProxy,
    @Inject('StatsService') private readonly statsService: ClientProxy,
  ) {}

  //   PROFILE

  getProfile(userId: string): Observable<ProfileDto> {
    return forkJoin({
      userInfo: this.getUserIdNameStatus(userId),
      friends: this.getFriends(userId),
      leaderboardPosition: this.getLeaderboardPosition(userId),
      totalPlayers: this.getTotalNoOfUsers(),
      gamesAgainstHuman: this.getGamesAgainst({
        userId,
        opponent: Opponent.HUMAN,
      }),
      gamesAgainstBot: this.getGamesAgainst({
        userId,
        opponent: Opponent.BOT,
      }),
      mostFrequentOpponent: this.getMostFrequentOpponent(userId),
    }).pipe(
      map((result) => ({
        userInfo: result.userInfo,
        friends: result.friends,
        leaderboardPosition: result.leaderboardPosition,
        totalPlayers: result.totalPlayers,
        gamesAgainstHuman: result.gamesAgainstHuman,
        gamesAgainstBot: result.gamesAgainstBot,
        mostFrequentOpponent: result.mostFrequentOpponent,
      })),
    );
  }

  private getGamesAgainst(userIdOpponentDto: UserIdOpponentDto) {
    const pattern = 'getGamesAgainst';
    const payload: UserIdOpponentDto = userIdOpponentDto;
    return this.statsService.send<GameStatsDto>(pattern, payload);
  }

  private getUserIdNameStatus(userId: string): Observable<UserIdNameStatusDto> {
    const pattern = 'getUserIdNameStatus';
    const payload = userId;
    return this.userService.send<UserIdNameStatusDto>(pattern, payload);
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

  getLeaderboardPosition(userId: string): Observable<number> {
    const pattern = 'getRank';
    const payload = userId;
    return this.statsService.send<number>(pattern, payload);
  }

  //   USER

  getUserName(userId: string): Observable<string> {
    const pattern = 'getUserName';
    const payload = userId;
    return this.userService.send<string>(pattern, payload);
  }

  updateUserName(userIdNameDto: UserIdNameDto): void {
    const pattern = 'setUserName';
    const payload = userIdNameDto;
    this.userService.emit(pattern, payload);
  }

  getUserStatus(userId: string): Observable<string> {
    const pattern = 'getStatus';
    const payload = userId;
    return this.userService.send<string>(pattern, payload);
  }

  //   updateStatus(userStatusDto: UserStatusDto): void {
  //     const pattern = KafkaTopic.STATUS_CHANGE;
  //     const payload = userStatusDto;
  //     this.userService.emit(pattern, payload);
  //   }

  getAllUserIds(): Observable<string[]> {
    const pattern = 'getAllUserIds';
    const payload = {};
    return this.userService.send<string[]>(pattern, payload);
  }

  getTotalNoOfUsers(): Observable<number> {
    const pattern = 'getNoOfUsers';
    const payload = {};
    return this.userService.send<number>(pattern, payload);
  }

  //   GAMES

  getGameHistory(userId: string): Observable<string> {
    const pattern = 'getGameHistory';
    const payload = userId;
    return this.gameService.send<string>(pattern, payload);
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

  async createFriendship(friendshipDto: FriendshipDto): Promise<string> {
    const pattern = 'addFriend';
    const payload = friendshipDto;
    const response = await firstValueFrom(
      this.userService.send<string>(pattern, payload),
    );
    if (response === 'Error') {
      throw new InternalServerErrorException(); // TBD
    }
    return response;
  }

  async removeFriendship(friendshipDto: FriendshipDto): Promise<string> {
    const pattern = 'unfriend';
    const payload = friendshipDto;
    const response = await firstValueFrom(
      this.userService.send<string>(pattern, payload),
    );
    if (response === 'Error') {
      throw new InternalServerErrorException(); // TBD
    }
    return response;
  }

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
    return this.userService.send<string[]>(pattern, payload);
  }

  // avatar

  setAvatar(avatarDto: AvatarDto): Observable<string> {
    const pattern = 'setAvatar';
    const payload = avatarDto;
    return this.userService.send<string>(pattern, payload);
  }

  getAvatar(userId: string): Observable<AvatarDto | string> {
    const pattern = 'getAvatar';
    const payload = userId;
    return this.userService.send(pattern, payload).pipe(
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

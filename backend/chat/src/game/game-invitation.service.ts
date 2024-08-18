import { Injectable, Logger } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { KafkaProducerService } from 'src/kafka/kafka-producer.service'
import { User } from 'src/entities/user.entity'
import {  ResponseDto } from '../dto/chat.dto'
import { GameTypes, MatchTypes, } from 'src/kafka/kafka.enum'

@Injectable()
export class GameInvitation {
  constructor(
    private userService: UserService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) { }
  private logger = new Logger('GameInvitation')

  async sendGameInvitation(inviter: User, receiver: User | undefined): Promise<ResponseDto> {
    let response: ResponseDto = { success: false, message: '' };
    if (!receiver) {
      response.message = `User ${receiver.userId} not found`;
      this.logger.log(`Receiver not found`)
      return response
    }
    if (inviter.game !== '') {
      this.logger.log(`Inviter: ${inviter.userId} is already in a game`)
      response.message = 'You are already in a game, decline the previus one';
      return response
    }
    if (receiver.game !== '') {
      this.logger.log(`Receiver: ${receiver.userId} is already in a game`)
      response.message = 'Your invitee is already in a game';
      return response
    }
    if (receiver.socketId === '') {
      this.logger.log(`Receiver: ${receiver.userId} is offline`)
      response.message = 'Your invitee is offline';
      return response
    }
    const blocked: string = await this.userService.checkBlockedUser(
      inviter,
      receiver.userId,
    )
    if (blocked !== 'Not Blocked') {
      this.logger.log(`Inviter: ${inviter.userId} blocked: ${receiver.userId}`)
      response.message = `You are blocked by ${inviter.userName}`;
      return response
    }
    const blockedBy: string = await this.userService.checkBlockedUser(receiver, inviter.userId)
    if (blockedBy !== 'Not Blocked') {
      this.logger.log(`Receiver: ${receiver.userId} blocked: ${inviter.userId}`)
      response.message = `You blocked ${inviter.userName}`;
      return response
    }
    await this.userService.setGame(receiver.userId, inviter.userId, false);
    await this.userService.setGame(inviter.userId, receiver.userId, true);
    response.success = true;
    response.message = 'Game invitation sent';
    return response
      
  }

  async acceptGameInvitation(accepter: User , inviter: User | undefined): Promise<ResponseDto> {
    let response: ResponseDto = { success: false, message: '' };
    if (!inviter) {
      this.logger.log(`Inviter ${inviter.userId} not found`);
      this.userService.setGame(accepter.userId, '', false);
      response.message = 'User not found';
      return response
    }
    if (accepter.game !== inviter.userId) {
      this.userService.setGame(accepter.userId, '', false)
      this.logger.log(`accepter: ${accepter.game} !== Inviter ${inviter.userId}`)
      response.message = 'You are not invited to this game';
      return response
    }
    if (inviter.socketId === '') {
      this.userService.setGame(accepter.userId, '', false)
      this.logger.log(`inviter: ${inviter.userId} is offline`)
      response.message = 'Your opponent is not online';
      return response
    }
    const blocked: string = await this.userService.checkBlockedUser(
      inviter,
      accepter.userId,
    )
    if (blocked !== 'Not Blocked') {
      this.userService.setGame(accepter.userId, '', false)
      this.userService.setGame(inviter.userId, '', false)
      this.logger.log(`Inviter: ${inviter.userId} blocked: ${accepter.userId}`)
      response.message = `You are blocked by ${inviter.userName}`;
      return
    }
    const blockedBy: string = await this.userService.checkBlockedUser(accepter, inviter.userId)
    if (blockedBy !== 'Not Blocked') {
      this.userService.setGame(accepter.userId, '', false)
      this.userService.setGame(inviter.userId, '', false)
      this.logger.log(`Accepter: ${accepter.userId} blocked: ${inviter.userId}`)
      response.message = `You blocked ${inviter.userName}`;
      return response
    }
    
    this.logger.log(`game started`)
    this.kafkaProducerService.announceStartOfPairGame({
      gameType: GameTypes.PONG,
      matchType: MatchTypes.PAIR,
      player1ID: inviter.userId,
      player2ID: accepter.userId,
    }) // DM added

    // await this.userService.setGame(accepter.userId, '', false) // will come from kafka
    // await this.userService.setGame(inviter.userId, '', false)
    response.success = true;
    response.message = 'Game started';
    return response
  }

  async declineGameInvitation(decliner: User, declined: User | undefined): Promise <ResponseDto> {
    let response: ResponseDto = { success: false, message: '' };
    if (!declined) {
      this.logger.log(`Declined ${declined} not found`)
      this.userService.setGame(decliner.userId, '', false)
      response.message = 'User not found';
      return response
    }
    if (decliner.game !== declined.userId) {
      response.message = 'You are not invited to this game';
      this.userService.setGame(decliner.userId, '', false)
      this.logger.log(`Decliner: ${decliner.game} !== Declined: ${declined.userId}`)
      return response
    }
    this.userService.setGame(decliner.userId, '', false)
    this.userService.setGame(declined.userId, '', false)
    response.success = true;
    response.message = 'Game invitation declined';
    return response
  }
}
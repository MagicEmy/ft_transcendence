import { Injectable, Logger } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { KafkaProducerService } from 'src/kafka/kafka-producer.service'
import { User } from 'src/entities/user.entity'
import { ResponseDto } from '../dto/chat.dto'
import { GameTypes, MatchTypes } from 'src/kafka/kafka.enum'

@Injectable()
export class GameInvitation {
  constructor (
    private userService: UserService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}
  private logger = new Logger('GameInvitation')

  async sendGameInvitation (
    inviter: User,
    receiver: User | undefined,
  ): Promise<ResponseDto> {
    let response: ResponseDto = { success: false, message: '' }
    if (inviter.game === inviter.userId)
      await this.userService.setGame(inviter.userId, '', false)

    if (!receiver) {
      response.message = `User ${receiver.userId} not found`
      this.logger.log(`Receiver not found`)
      return response
    }
    if (inviter.userId === receiver.userId) {
      response.message = 'You cannot invite yourself'
      this.logger.log(`Inviter: ${inviter.userId} invited himself`)
      return response
    }
    if (inviter.game !== '') {
      this.logger.log(`Inviter: ${inviter.userId} is already in a game`)
      response.message = 'You are already in a game, decline the previus one'
      return response
    }
    if (receiver.game !== '') {
      this.logger.log(`Receiver: ${receiver.userId} is already in a game`)
      response.message = 'Your invitee is already in a game'
      return response
    }
    if (receiver.socketId === '') {
      this.logger.log(`Receiver: ${receiver.userId} is offline`)
      response.message = 'Your invitee is offline'
      return response
    }
    const blocked: string = await this.userService.checkBlockedUser(
      inviter,
      receiver.userId,
    )
    if (blocked !== 'Not Blocked') {
      this.logger.log(`Inviter: ${inviter.userId} blocked: ${receiver.userId}`)
      response.message = `You are blocked by ${inviter.userName}`
      return response
    }
    const blockedBy: string = await this.userService.checkBlockedUser(
      receiver,
      inviter.userId,
    )
    if (blockedBy !== 'Not Blocked') {
      this.logger.log(`Receiver: ${receiver.userId} blocked: ${inviter.userId}`)
      response.message = `You blocked ${inviter.userName}`
      return response
    }
    await this.userService.setGame(receiver.userId, inviter.userId, false)
    await this.userService.setGame(inviter.userId, receiver.userId, true)
    response.success = true
    response.message = 'Game invitation sent'
    return response
  }

  async acceptGameInvitation (
    accepter: User,
    inviter: User | undefined,
  ): Promise<ResponseDto> {
    let response: ResponseDto = { success: false, message: '' }
    if (accepter.game === accepter.userId) {
      await this.userService.setGame(accepter.userId, '', false)
      return response
    }
    if (!inviter) {
      this.logger.log(`Inviter ${inviter.userId} not found`)
      await this.userService.setGame(accepter.userId, '', false)
      response.message = 'User not found'
      return response
    }
    if (accepter.game !== inviter.userId) {
      await this.userService.setGame(accepter.userId, '', false)
      this.logger.log(
        `accepter: ${accepter.game} !== Inviter ${inviter.userId}`,
      )
      response.message = 'You are not invited to this game'
      return response
    }
    if (inviter.socketId === '') {
      await this.userService.setGame(accepter.userId, '', false)
      this.logger.log(`inviter: ${inviter.userId} is offline`)
      response.message = 'Your opponent is not online'
      return response
    }
    const blocked: string = await this.userService.checkBlockedUser(
      inviter,
      accepter.userId,
    )
    if (blocked !== 'Not Blocked') {
      await this.userService.setGame(accepter.userId, '', false)
      await this.userService.setGame(inviter.userId, '', false)
      this.logger.log(`Inviter: ${inviter.userId} blocked: ${accepter.userId}`)
      response.message = `You are blocked by ${inviter.userName}`
      return
    }
    const blockedBy: string = await this.userService.checkBlockedUser(
      accepter,
      inviter.userId,
    )
    if (blockedBy !== 'Not Blocked') {
      await this.userService.setGame(accepter.userId, '', false)
      await this.userService.setGame(inviter.userId, '', false)
      this.logger.log(`Accepter: ${accepter.userId} blocked: ${inviter.userId}`)
      response.message = `You blocked ${inviter.userName}`
      return response
    }

    this.logger.log(`game started`)
    this.kafkaProducerService.announceStartOfPairGame({
      gameType: GameTypes.PONG,
      matchType: MatchTypes.PAIR,
      player1ID: inviter.userId,
      player2ID: accepter.userId,
    }) // DM added

    response.success = true
    response.message = 'Game started'
    return response
  }

  async declineGameInvitation (
    decliner: User,
    declined: User | undefined,
  ): Promise<ResponseDto> {
    let response: ResponseDto = { success: false, message: '' }
    if (decliner.game === decliner.userId) {
      await this.userService.setGame(decliner.userId, '', false)
      return response
    }
    if (!declined) {
      this.logger.log(`Declined ${declined.userId} not found`)
      await this.userService.setGame(decliner.userId, '', false)
      response.message = 'User not found'
      return response
    }
    if (decliner.game !== declined.userId) {
      response.message = 'You are not invited to this game'
      await this.userService.setGame(decliner.userId, '', false)
      this.logger.log(
        `Decliner: ${decliner.game} !== Declined: ${declined.userId}`,
      )
      return response
    }
    if (decliner.isGameHost) response.message = 'Game invitation canceled'
    else response.message = 'Game invitation declined'
    await this.userService.setGame(decliner.userId, '', false)
    await this.userService.setGame(declined.userId, '', false)
    response.success = true

    return response
  }

  async getGameIvitation (user: User): Promise<boolean | {}> {
    if (user.game === '' || user.game === user.userId) {
      return false
    }
    if (user.isGameHost === true) {
      return { type: 'host', user: user.game }
    }
    return { type: 'invitation', user: user.game }
  }
}

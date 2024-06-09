export class GameHistoryDto {
  player1Id: string;
  player1Name?: string;
  player1Score: number;
  player2Id: string | null;
  player2Name?: string;
  player2Score: number;
}

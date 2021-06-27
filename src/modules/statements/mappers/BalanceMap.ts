/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Statement } from '../entities/Statement';

export class BalanceMap {
  static toDTO({
    statement,
    balance,
  }: {
    statement: Statement[];
    balance: number;
  }) {
    const parsedStatement = statement.map(
      ({
        id,
        amount,
        sender_id,
        description,
        type,
        created_at,
        updated_at,
      }) => {
        const parsedOp = {
          id,
          amount,
          sender_id,
          description,
          type,
          created_at,
          updated_at,
        };

        if (!sender_id) {
          delete parsedOp.sender_id;
        }

        return parsedOp;
      },
    );

    return {
      statement: parsedStatement,
      balance: Number(balance),
    };
  }
}

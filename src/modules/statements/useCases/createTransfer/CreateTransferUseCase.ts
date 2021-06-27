import { inject, injectable } from 'tsyringe';

import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { OperationType, Statement } from '../../entities/Statement';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { CreateTransferError } from './CreateTransferError';

interface IRequest {
  amount: number;
  description: string;
  sender_id: string;
  to_id: string;
}

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,
  ) {}

  async execute({
    amount,
    description,
    sender_id,
    to_id,
  }: IRequest): Promise<Statement> {
    const sender_user = await this.usersRepository.findById(sender_id);
    const receiver_user = await this.usersRepository.findById(to_id);

    if (!sender_user) {
      throw new CreateTransferError.UserNotFound();
    }

    if (!receiver_user) {
      throw new CreateTransferError.UserNotFound();
    }

    const balance = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
      with_statement: false,
    });

    if (balance.balance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    await this.statementsRepository.create({
      user_id: receiver_user.id as string,
      sender_id: sender_user.id as string,
      amount,
      description,
      type: OperationType.TRANSFER,
    });

    const receipt = await this.statementsRepository.create({
      user_id: sender_user.id as string,
      amount: amount * -1,
      description,
      type: OperationType.TRANSFER,
    });

    return receipt;
  }
}

export { CreateTransferUseCase };

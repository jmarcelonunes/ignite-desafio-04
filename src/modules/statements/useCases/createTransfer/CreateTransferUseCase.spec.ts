import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { CreateTransferError } from './CreateTransferError';
import { CreateTransferUseCase } from './CreateTransferUseCase';

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createTransferUseCase: CreateTransferUseCase;

describe('Create a transfer', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
    createTransferUseCase = new CreateTransferUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('should create a transfer', async () => {
    const sender_user = await inMemoryUsersRepository.create({
      name: 'Teste',
      email: 'Teste@Teste',
      password: '12345',
    });

    const to_user = await inMemoryUsersRepository.create({
      name: 'Teste2',
      email: 'Teste@Teste2',
      password: '12345',
    });

    await createStatementUseCase.execute({
      user_id: sender_user.id as string,
      amount: 1000,
      description: 'transaction test',
      type: OperationType.DEPOSIT,
    });

    const transfer = await createTransferUseCase.execute({
      sender_id: sender_user.id as string,
      to_id: to_user.id as string,
      amount: 500,
      description: 'transfer test',
    });
    expect(transfer).toHaveProperty('id');
  });

  it('should create a transfer and get the correct balance', async () => {
    const sender_user = await inMemoryUsersRepository.create({
      name: 'Teste',
      email: 'Teste@Teste',
      password: '12345',
    });

    const to_user = await inMemoryUsersRepository.create({
      name: 'Teste2',
      email: 'Teste@Teste2',
      password: '12345',
    });

    await createStatementUseCase.execute({
      user_id: sender_user.id as string,
      amount: 1000,
      description: 'transaction test',
      type: OperationType.DEPOSIT,
    });

    const transfer = await createTransferUseCase.execute({
      sender_id: sender_user.id as string,
      to_id: to_user.id as string,
      amount: 500,
      description: 'transfer test',
    });

    const sender_balance = await inMemoryStatementsRepository.getUserBalance({
      user_id: sender_user.id as string,
      with_statement: true,
    });

    const receiver_balance = await inMemoryStatementsRepository.getUserBalance({
      user_id: to_user.id as string,
      with_statement: true,
    });

    expect(sender_balance.balance).toBe(500);
    expect(receiver_balance.balance).toBe(500);
    expect(transfer).toHaveProperty('id');
  });

  it('should not transfer for a non-existing user', async () => {
    const sender_user = await inMemoryUsersRepository.create({
      name: 'Teste',
      email: 'Teste@Teste',
      password: '12345',
    });

    await expect(
      createTransferUseCase.execute({
        sender_id: sender_user.id as string,
        to_id: '2',
        amount: 1000,
        description: 'transfer test',
      }),
    ).rejects.toBeInstanceOf(CreateTransferError.UserNotFound);
  });

  it('should not transfer from a non-existing user', async () => {
    const to_user = await inMemoryUsersRepository.create({
      name: 'Teste',
      email: 'Teste@Teste',
      password: '12345',
    });

    await expect(
      createTransferUseCase.execute({
        sender_id: '2',
        to_id: to_user.id as string,
        amount: 1000,
        description: 'transfer test',
      }),
    ).rejects.toBeInstanceOf(CreateTransferError.UserNotFound);
  });

  it('should not transfer if insufficient funds', async () => {
    const sender_user = await inMemoryUsersRepository.create({
      name: 'Teste',
      email: 'Teste@Teste',
      password: '12345',
    });

    const receiver_user = await inMemoryUsersRepository.create({
      name: 'Teste',
      email: 'Teste@Teste',
      password: '12345',
    });

    await expect(
      createTransferUseCase.execute({
        sender_id: sender_user.id as string,
        to_id: receiver_user.id as string,
        amount: 1000,
        description: 'transfer test',
      }),
    ).rejects.toBeInstanceOf(CreateTransferError.InsufficientFunds);
  });
});

import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementError } from './CreateStatementError';
import { CreateStatementUseCase } from './CreateStatementUseCase';

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

describe('Create a statement', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('should create a statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Teste',
      email: 'Teste@Teste',
      password: '12345',
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 1000,
      description: 'transaction test',
      type: OperationType.DEPOSIT,
    });

    expect(statement).toHaveProperty('id');
  });

  it('should not create a statement for a non-existing user', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: '1',
        amount: 1000,
        description: 'transaction test',
        type: OperationType.DEPOSIT,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('should not create a statement if insufficient funds', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'Teste',
        email: 'Teste@Teste',
        password: '12345',
      });

      await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 100000,
        description: 'transaction test',
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});

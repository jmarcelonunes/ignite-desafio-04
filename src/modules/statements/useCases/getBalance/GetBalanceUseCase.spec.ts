import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetBalanceError } from './GetBalanceError';
import { GetBalanceUseCase } from './GetBalanceUseCase';

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe('Get a balance', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository,
    );
  });

  it('Should get the correct balance with statements', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'Teste',
      email: 'Teste@Teste',
      password: '12345',
    });

    const deposit = await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      amount: 1000,
      description: 'transaction test',
      type: OperationType.DEPOSIT,
    });

    const withdraw = await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      amount: 50,
      description: 'transaction test',
      type: OperationType.WITHDRAW,
    });

    const response = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(response).toStrictEqual({
      statement: [deposit, withdraw],
      balance: 950,
    });
  });

  it('Should not get the correct balance for a non-existing user', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: '1234',
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});

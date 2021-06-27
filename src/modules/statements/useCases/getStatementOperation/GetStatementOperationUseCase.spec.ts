import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetStatementOperationError } from './GetStatementOperationError';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Get Statement', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('Should get a statement operation', async () => {
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

    const statement = await getStatementOperationUseCase.execute({
      statement_id: deposit.id as string,
      user_id: user.id as string,
    });
    expect(statement).toStrictEqual(deposit);
  });

  it('Should not get a statement for a non-existing user', async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        statement_id: '12344',
        user_id: '1232313',
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('Should not get a statement for a non-existing statement', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'Teste',
        email: 'Teste@Teste',
        password: '12345',
      });

      await getStatementOperationUseCase.execute({
        statement_id: '12344',
        user_id: user.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});

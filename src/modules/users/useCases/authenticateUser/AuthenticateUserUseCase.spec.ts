import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";


let inMemoryUsersRepository : InMemoryUsersRepository
let authenticateUserUseCase : AuthenticateUserUseCase


describe("Authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should authenticate an user", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "Teste",
      email:"test@test.com",
      password: await hash("1234", 8)
    })

    const response = await authenticateUserUseCase.execute({
      email: "test@test.com",
      password: "1234"
    })

    expect(response).toHaveProperty("token");
    expect(response.user.id).toStrictEqual(user.id);
  });


  it("Should not authenticate an user with wrong password", async () => {
    expect(async () => {
      await inMemoryUsersRepository.create({
        name: "Teste",
        email:"test1@test.com",
        password: await hash("1234", 8)
      })

      await authenticateUserUseCase.execute({
        email: "test1@test.com",
        password: "12345"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });

  it("Should not authenticate an user that doesn't exists", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "test@test.com",
        password: "12345"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });

});

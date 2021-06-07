import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";


let inMemoryUsersRepository : InMemoryUsersRepository
let createUserUseCase : CreateUserUseCase


describe("Create user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should create an user", async () => {
    const user = await createUserUseCase.execute({
      name: "Teste",
      email:"test@test.com",
      password: "123"
    })

    expect(user).toHaveProperty("id");
  });

  it("Should not create an user that already exists", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Teste",
        email:"test@test.com",
        password: "123"
      })
      await createUserUseCase.execute({
        name: "Teste",
        email: "test@test.com",
        password: "123"
      })
    }).rejects.toBeInstanceOf(CreateUserError)
  });
});

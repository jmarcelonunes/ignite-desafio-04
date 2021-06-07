import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";


let inMemoryUsersRepository : InMemoryUsersRepository
let showUserProfileUseCase : ShowUserProfileUseCase


describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should show an user profile", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "Teste",
      email:"test@test.com",
      password: "123"
    })

    const response = await showUserProfileUseCase.execute(user.id as string);

    expect(response).toBe(user);
  });

  it("Should not show user profile for non existing user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("1234")
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  });
});

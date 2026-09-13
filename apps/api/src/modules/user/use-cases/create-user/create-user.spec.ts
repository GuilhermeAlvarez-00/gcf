import { Test, TestingModule } from "@nestjs/testing";
import { UserRepository } from "../../repositories/user.repository";
import { CreateUserUseCase } from "./create-user.usecase";
import { ConflictException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt");

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
  let repository: UserRepository;

  const mockUserRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const userData = {
    name: "John Doe",
    email: "john@example.com",
    password: "password",
    cellphone: "11999998888",
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    repository = module.get<UserRepository>(UserRepository);
  });

  it("should hash the password before saving it", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");
    mockUserRepository.create.mockResolvedValue({
      id: "uuid1234",
      ...userData,
      password: "hashedPassword123",
      createdAt: new Date(),
    });

    await useCase.execute(userData);

    expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
    expect(repository.create).toHaveBeenCalledWith({
      ...userData,
      password: "hashedPassword123",
    });
  });

  it("should create a user successfully", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");
    mockUserRepository.create.mockResolvedValue({
      id: "uuid1234",
      ...userData,
      createdAt: new Date(),
    });

    const userCreated = await useCase.execute(userData);

    expect(repository.create).toHaveBeenCalledWith({
      ...userData,
      password: "hashedPassword123",
    });
    expect(userCreated).toHaveProperty("email", "john@example.com");
  });

  it("should not create a user with an existing email", async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      ...userData,
      id: "uuid1234",
      createdAt: new Date(),
    });

    await expect(useCase.execute(userData)).rejects.toThrow(ConflictException);

    expect(repository.findByEmail).toHaveBeenCalledWith(userData.email);
    expect(repository.create).not.toHaveBeenCalled();
  });
});

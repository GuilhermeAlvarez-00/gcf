import { ConflictException, Injectable } from "@nestjs/common";
import { CreateUserData } from "./types";
import { UserRepository } from "../../repositories/user.repository";
import * as bcrypt from "bcrypt";

@Injectable()
export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: CreateUserData) {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictException("Email already in use");
    }

    const password = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({
      ...data,
      password,
    });

    return user;
  }
}

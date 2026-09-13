import { User } from "@/generated/prisma/client";
import { CreateUserData } from "../use-cases/create-user/types";

export abstract class UserRepository {
  abstract create(data: CreateUserData): Promise<User>;
  abstract findByEmail(email: string): Promise<User | null>;
}

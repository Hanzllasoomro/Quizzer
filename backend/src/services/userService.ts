import { config } from "../../config";
import { hashPassword } from "../utils/hash";
import { ensureAdminUser, findUserById } from "../repository/userRepository";

export const seedAdmin = async () => {
  const passwordHash = await hashPassword(config.admin.password);
  await ensureAdminUser("Admin", config.admin.email, passwordHash, "ADMIN");
};

export const getUserById = (id: string) => findUserById(id);

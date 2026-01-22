import { User, IUser, UserRole } from "../models/User";

export const createUser = (payload: Partial<IUser>) => User.create(payload);

export const findUserByEmail = (email: string) =>
  User.findOne({ email: email.toLowerCase() });

export const findUserById = (id: string) => User.findById(id);

export const ensureAdminUser = async (
  name: string,
  email: string,
  passwordHash: string,
  role: UserRole = "ADMIN"
) => {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  return User.create({ name, email, passwordHash, role, isActive: true });
};

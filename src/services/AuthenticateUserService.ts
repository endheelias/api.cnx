import { getRepository } from 'typeorm';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

import AppError from '../errors/AppError';

import User from '../models/User';

import authConfig from '../config/auth';

interface Request {
  email: string;
  password: string;
}

class AutheticateUserService {
  public async execute({
    email,
    password,
  }: Request): Promise<{ user: User; token: string }> {
    const usersRepository = getRepository(User);

    const user = await usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new AppError('E-mail ou senha estão incorretas', 401);
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError('E-mail ou senha estão incorretas', 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({ hometown: user.hometown }, secret, {
      subject: user.id,
      expiresIn,
    });

    return { user, token };
  }
}

export default AutheticateUserService;

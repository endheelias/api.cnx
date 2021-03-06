import { inject, injectable } from 'tsyringe';
import IMailProvider from '@shared/container/providers/MailProvider/models/IMailProvider';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';
import IUserTokensRepository from '../repositories/IUserTokensRepository';

interface IRequest {
  email: string;
}
@injectable()
class SendForgotPasswordEmailService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('MailProvider')
    private mailProvider: IMailProvider,

    @inject('UserTokensRepository')
    private userTokensRepository: IUserTokensRepository,
  ) {}

  public async execute({
    email,
  }: IRequest): Promise<{ message: string; token: string }> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError('User this not exists');
    }

    const { token } = await this.userTokensRepository.generate(user.id);

    if (process.env.NODE_ENV === 'development') {
      // Melhorar esse processo para o ambiente de produção.
      await this.mailProvider.sendMail(
        email,
        `Pedido de recuperação de senha recebido - ${token}`,
      );
    }

    return { message: `Pedido de recuperação de senha recebido`, token };
  }
}

export default SendForgotPasswordEmailService;

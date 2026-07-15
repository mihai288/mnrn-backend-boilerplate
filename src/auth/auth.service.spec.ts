import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(() => {
    const users: Array<any> = [];

    usersService = {
      async findByEmail(email: string) {
        return users.find((user) => user.email === email) ?? null;
      },
      async create(dto: any) {
        const user = {
          ...dto,
          _id: { toString: () => `${users.length + 1}` },
          toObject() {
            return { ...user };
          },
        };
        users.push(user);
        return user;
      },
    } as unknown as UsersService;

    authService = new AuthService(usersService, new JwtService({ secret: 'test-secret' }));
  });

  it('registers a user and hashes the password', async () => {
    const user = await authService.register({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
    });

    const storedUser = await usersService.findByEmail('jane@example.com');

    expect(user.email).toBe('jane@example.com');
    expect(storedUser?.password).not.toBe('secret123');
    expect(storedUser?.password?.startsWith('$2')).toBe(true);
  });

  it('throws on duplicate email', async () => {
    await authService.register({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
    });

    await expect(
      authService.register({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'secret123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('logs in a registered user and returns a token', async () => {
    await authService.register({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
    });

    const result = await authService.login({
      email: 'jane@example.com',
      password: 'secret123',
    });

    expect(result.access_token).toBeDefined();
    expect(result.user.email).toBe('jane@example.com');
  });

  it('rejects invalid credentials', async () => {
    await authService.register({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
    });

    await expect(
      authService.login({
        email: 'jane@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

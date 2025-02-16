import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationResolver } from './authentication.resolver';
import { AuthenticationService } from './authentication.service';
import { MailService } from '../services/mail.service';

describe('AuthenticationResolver', () => {
  let resolver: AuthenticationResolver;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    initiatePasswordReset: jest.fn(),
    resetPassword: jest.fn(),
  };

  // Mock complet pour MailService
  const mockMailService = {
    sendMail: jest.fn().mockImplementation(async (mailOptions) => {
      return Promise.resolve();
    }),
    sendPasswordResetEmail: jest.fn().mockImplementation(async (to, token) => {
      return Promise.resolve();
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationResolver,
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    resolver = module.get<AuthenticationResolver>(AuthenticationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  // Test pour la mutation de réinitialisation de mot de passe
  describe('initiatePasswordReset', () => {
    it('should call authService.initiatePasswordReset', async () => {
      const email = 'test@example.com';
      await resolver.requestReset(email);
      expect(mockAuthService.initiatePasswordReset).toHaveBeenCalledWith(email);
    });
  });
});
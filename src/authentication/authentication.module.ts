import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationResolver } from './authentication.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { UserSchema } from './schema/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from 'src/roles/roles.module';
import { RefreshToken, RefreshTokenSchema } from './schema/refreshToken.schema';
import { ResetToken, ResetTokenSchema } from './schema/resetToken.schema';
import { MailService } from 'src/services/mail.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from 'src/guards/jwtAuth.guards';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    PassportModule.register({ defaultStrategy: 'jwt' }), // Ajoutez cette ligne
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    RolesModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: RefreshToken.name,
        schema: RefreshTokenSchema,
      },
      {
        name: ResetToken.name,
        schema: ResetTokenSchema,
      },
    ]),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT, 10),
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
    }),
  ],
  providers: [ MailService,JwtStrategy, JwtAuthGuard, AuthenticationService,AuthenticationResolver],
  exports: [AuthenticationService,PassportModule,JwtModule, JwtStrategy, JwtAuthGuard],
})
export class AuthenticationModule {}

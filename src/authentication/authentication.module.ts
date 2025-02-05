import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationResolver } from './authentication.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { UserSchema } from './schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],

  providers: [AuthenticationResolver, AuthenticationService],
})
export class AuthenticationModule {}

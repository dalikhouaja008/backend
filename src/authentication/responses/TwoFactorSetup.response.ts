import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class TwoFactorSetupResponse {
  @Field()
  qrCodeUrl: string;

  @Field()
  secret: string;
}

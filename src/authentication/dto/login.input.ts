import { InputType, Field } from '@nestjs/graphql';

// Define el tipo LoginDto como un InputType (para inputs)
@InputType()
export class LoginInput {
    @Field()
    email: string;

    @Field()
    password: string;
}

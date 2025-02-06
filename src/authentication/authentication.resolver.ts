import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoginInput } from './dto/login.input';
import { RefreshTokenInput } from './dto/refreshToken.input';
import { ChangePasswordInput } from './dto/changePassword.input';
import { ForgotPasswordInput } from './dto/forgetPassword.input';
import { ResetPasswordInput } from './dto/resetPassword.input';
import { AuthenticationService } from './authentication.service';
import { UserInput } from './dto/signup.input';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { User } from './schema/user.schema';

@Resolver(() => User)
export class AuthenticationResolver {
  constructor(private readonly authService: AuthenticationService) {}

  // Mutation pour l'inscription (signup)
  @Mutation(() => User)
  async signUp(@Args('signupData') signupData: UserInput) {
    return this.authService.signup(signupData);
  }

  // Mutation pour la connexion (login)
  @Mutation(() => User)
  async login(@Args('credentials') credentials: LoginInput) {
    return this.authService.login(credentials);
  }

  // Mutation pour rafraîchir les tokens
  @Mutation(() => String)
  async refreshTokens(@Args('refreshTokenData') refreshTokenData: RefreshTokenInput) {
    return this.authService.refreshTokens(refreshTokenData.refreshToken);
  }

  // Mutation pour changer le mot de passe
  @UseGuards(AuthenticationGuard) // Protéger cette mutation avec un guard d'authentification
  @Mutation(() => String)
  async changePassword(@Args('changePasswordData') changePasswordData: ChangePasswordInput) {
    return this.authService.changePassword(
      changePasswordData.userId,
      changePasswordData.oldPassword,
      changePasswordData.newPassword,
    );
  }

  // Mutation pour demander une réinitialisation de mot de passe
  @Mutation(() => String)
  async forgotPassword(@Args('forgotPasswordData') forgotPasswordData: ForgotPasswordInput) {
    return this.authService.forgotPassword(forgotPasswordData.email);
  }

  // Mutation pour demander un code de réinitialisation
  @Mutation(() => String)
  async requestReset(@Args('email') email: string) {
    return this.authService.requestReset(email);
  }

  // Mutation pour vérifier un code de réinitialisation
  @Mutation(() => String)
  async verifyCode(@Args('email') email: string, @Args('code') code: string) {
    return this.authService.verifyCode(email, code);
  }

  // Mutation pour réinitialiser le mot de passe
  @Mutation(() => User)
  async resetPassword(@Args('resetPasswordData') resetPasswordData: ResetPasswordInput) {
    return this.authService.resetPassword(
      resetPasswordData.email,
      resetPasswordData.code,
      resetPasswordData.newPassword,
    );
  }

  // Query pour valider un utilisateur (optionnel)
  @Query(() => User)
  async validateUser(@Args('userId') userId: string) {
    return this.authService.validateUser(userId);
  }
}

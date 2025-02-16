import { BadRequestException,  UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoginInput } from './dto/login.input';
import { RefreshTokenInput } from './dto/refreshToken.input';
import { ChangePasswordInput } from './dto/changePassword.input';
import { ForgotPasswordInput } from './dto/forgetPassword.input';
import { ResetPasswordInput } from './dto/resetPassword.input';
import { AuthenticationService } from './authentication.service';
import { UserInput } from './dto/signup.input';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { User } from './schema/user.schema';
import { LoginResponse } from './responses/login.response';
import { TwoFactorAuthService } from './TwoFactorAuth.service';

@Resolver(() => User)
export class AuthenticationResolver {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) { }

  // Mutation pour l'inscription (signup)
  @Mutation(() => User)
  async signUp(@Args('signupData') signupData: UserInput) {
    return this.authService.signup(signupData);
  }

  @Mutation(() => LoginResponse)
  async login(@Args('credentials') credentials: LoginInput) {
    if (!credentials.email || !credentials.password) {
      throw new BadRequestException('Données manquantes');
    }
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

  // Query pour valider un utilisateur 
  @Query(() => User)
  async validateUser(@Args('userId') userId: string) {
    return this.authService.validateUser(userId);
  }

  //Partie 2FA
  // Mutation pour activer la 2FA
  @UseGuards(AuthenticationGuard)
  @Mutation(() => String)
  async enableTwoFactorAuth(@Context() context) {
    const req = context.req;
    const user = req.user;
  
    console.log('User from context:', user); // Voyons la structure exacte
  
    if (!user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
  
    // L'ID peut être dans différentes propriétés selon votre implementation de AuthGuard
    const userId = user.id || user._id || user.userId;
    console.log('UserId extracted:', userId);
  
    if (!userId) {
      throw new UnauthorizedException('ID utilisateur non trouvé');
    }
  
    // Générer un secret 2FA
    const secret = this.twoFactorAuthService.generateSecret();
  
    try {
      // Mettre à jour l'utilisateur avec le secret 2FA
      const updatedUser = await this.authService.updateUserTwoFactorSecret(userId, secret.secret);
      console.log('Updated user:', updatedUser);
  
      // Générer un QR code pour l'utilisateur
      const qrCodeUrl = await this.twoFactorAuthService.generateQRCode(secret.otpauthUrl);
      return qrCodeUrl;
    } catch (error) {
      throw new Error(`Erreur lors de l'activation de la 2FA: ${error.message}`);
    }
  }

  // Mutation pour valider le code OTP 
  //activation initiale de la 2FA 
  @UseGuards(AuthenticationGuard)
  @Mutation(() => Boolean)
  async verifyTwoFactorAuth(
    @Context() context: any, 
    @Args('token') token: string,
  ): Promise<boolean> {
    const req = context.req; 
    const userId = req.user.userId;

    const user = await this.authService.findUserById(userId);
  
    if (!user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
   //console.log(user);
  
    if (!user.twoFactorSecret) {
      throw new Error('2FA non activée pour cet utilisateur');
    }
  
    // Valider le code OTP
    const isValid = this.twoFactorAuthService.validateToken(user.twoFactorSecret, token);
  
    if (isValid) {
          // Activer la 2FA pour l'utilisateur
          await this.authService.enableTwoFactorAuth(userId);
        }
  
    return isValid;
  }
  

  // Mutation pour valider le code OTP après la connexion
  @UseGuards(AuthenticationGuard)
  @Mutation(() => LoginResponse)
  async verifyTwoFactorLogin(
    @Context() context: any, 
    @Args('token') token: string,
  ) {
    // Trouver l'utilisateur
    const req = context.req; 
    const userId = req.user.userId;

    const user = await this.authService.findUserById(userId);
  
    if (!user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
   //console.log(user);
  

    // Valider le code OTP
    const isValid = this.twoFactorAuthService.validateToken(user.twoFactorSecret, token);
    if (!isValid) {
      throw new UnauthorizedException('Code OTP invalide');
    }

    // Générer les tokens JWT
    const tokens = await this.authService.generateUserTokens(user._id);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user,
    };
  }

}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid/non-secure';
import { MailService } from 'src/services/mail.service';
import { RolesService } from 'src/roles/roles.service';
import { ResetToken } from './schema/resetToken.schema';
import { RefreshToken } from './schema/refreshToken.schema';
import { User } from './schema/user.schema';
import { UserInput } from './dto/signup.input';
import { Model } from 'mongoose';
import { LoginInput } from './dto/login.input';
import { TwoFactorAuthService } from './TwoFactorAuth.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetToken.name)
    private ResetTokenModel: Model<ResetToken>,
    private jwtService: JwtService,
    private mailService: MailService,
    private rolesService: RolesService,
    private twoFactorAuthService: TwoFactorAuthService,
  ) { }

  async signup(signupData: UserInput) {
    const { email, username, password, publicKey, twoFactorSecret, role, isVerified } = signupData;

    // Vérifier si l'email est déjà utilisé
    const emailInUse = await this.UserModel.findOne({ email });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur avec les champs fournis
    const newUser = await this.UserModel.create({
      username,
      email,
      password: hashedPassword,
      publicKey: publicKey || null, // Optionnel
      twoFactorSecret: twoFactorSecret || null, // Optionnel
      role: role || 'user', // Utilisez 'user' comme valeur par défaut si role n'est pas fourni
      isVerified: isVerified || false, // Optionnel, valeur par défaut
    });

    return newUser;
  }

  async login(credentials: LoginInput) {
    const { email, password } = credentials;

    console.log('Login attempt for email:', email);

    // Trouver l'utilisateur par email
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);
      throw new UnauthorizedException('Wrong credentials');
    }

    console.log('User found:', user.email);

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    // Si la 2FA est activée, retourner un indicateur pour demander le code OTP
    if (user.isTwoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        user: user,
      };
    }


    // Générer les tokens
    const tokens = await this.generateUserTokens(user._id);
    console.log('Tokens generated successfully');

    // Retourner les tokens et les informations de l'utilisateur
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user,
    };
  }

  async changePassword(userId, oldPassword: string, newPassword: string) {
    //Find the user
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found...');
    }

    //Compare the old password with the password in DB
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Change user's password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();
  }

  async forgotPassword(email: string) {
    //Check that user exists
    const user = await this.UserModel.findOne({ email });

    if (user) {
      //If user exists, generate password reset link
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const resetToken = nanoid(64);
      await this.ResetTokenModel.create({
        token: resetToken,
        userId: user._id,
        expiryDate,
        email: email
      });
      //Send the link to the user by email
      this.mailService.sendPasswordResetEmail(email, resetToken);
    }

    return { message: 'If this user exists, they will receive an email' };
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }
    return this.generateUserTokens(token.userId);
  }
  async generateUserTokens(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '10h' });
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId: string) {
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      {
        upsert: true,
      },
    );
  }

  async getUserPermissions(userId: string) {
    const user = await this.UserModel.findById(userId);

    if (!user) throw new BadRequestException();

    const role = await this.rolesService.getRoleById(user.role);
    return role.permissions;
  }


  async requestReset(email: string) {
    // 1. Trouver l'utilisateur
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // 2. Générer le token
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 15); // Expire dans 15 minutes

    // 3. Sauvegarder le token
    // Supprimer les anciens tokens non utilisés pour cet utilisateur
    await this.ResetTokenModel.deleteMany({
      userId: user._id,
      used: false
    });

    // Créer un nouveau token
    const resetToken = new this.ResetTokenModel({
      userId: user._id,
      token: token,
      expiryDate: expiryDate,
      email: email,
      used: false
    });

    await resetToken.save();

    // 4. Envoyer l'email
    await this.mailService.sendMail({
      to: email,
      subject: 'Réinitialisation de mot de passe',
      text: `Votre code de réinitialisation est: ${token}. Il expirera dans 15 minutes.`,
      html: `
        <p>Votre code de réinitialisation est: <strong>${token}</strong></p>
        <p>Ce code expirera dans 15 minutes.</p>
      `
    });

    return {
      success: true,
      message: 'Code de réinitialisation envoyé par email'
    };
  }

  async verifyCode(email: string, code: string) {
    const resetToken = await this.ResetTokenModel.findOne({
      email: email,
      token: code,
      used: false,
      expiryDate: { $gt: new Date() }
    });

    if (!resetToken) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    return {
      success: true,
      message: 'Code vérifié avec succès'
    };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const resetToken = await this.ResetTokenModel.findOne({
      email: email,
      token: code,
      used: false,
      expiryDate: { $gt: new Date() }
    });

    if (!resetToken) {
      throw new BadRequestException('Code invalide ou expiré');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await this.UserModel.findByIdAndUpdate(resetToken.userId, {
      password: hashedPassword
    });
    //chercher user
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    // Marquer le token comme utilisé
    resetToken.used = true;
    await resetToken.save();

    return {
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      user: user
    };
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.UserModel.findById(userId).exec();
    return user ? user : null;
  }

  //2FA authentication

  // Trouver un utilisateur par ID
  async findUserById(userId: string): Promise<User | null> {
    return this.UserModel.findById(userId).exec();
  }

  // Mettre à jour le secret 2FA d'un utilisateur
  async updateUserTwoFactorSecret(userId: string, secret: string): Promise<User> {
    return this.UserModel.findByIdAndUpdate(
      userId,
      { twoFactorSecret: secret },
      { new: true },
    ).exec();
  }

  // Activer la 2FA pour un utilisateur  
  async enableTwoFactorAuth(userId: string): Promise<User> {
    return this.UserModel.findByIdAndUpdate(
      userId,
      {
        isTwoFactorEnabled: true
      },
      { new: true }
    ).exec();
  }

  async disableTwoFactorAuth(userId: string): Promise<User> {
    return this.UserModel.findByIdAndUpdate(
      userId,
      {
        isTwoFactorEnabled: false,
        twoFactorSecret: null
      },
      { new: true }
    ).exec();
  }

}













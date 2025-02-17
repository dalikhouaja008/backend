import {
  BadRequestException,
  Injectable,
  Logger,
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
import { Model, Types } from 'mongoose';
import { LoginInput } from './dto/login.input';
import { TwoFactorAuthService } from './TwoFactorAuth.service';
import { LoginResponse } from './responses/login.response';
import * as crypto from 'crypto';
import { TwilioService } from 'src/services/twilio.service';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetToken.name)
    private ResetTokenModel: Model<ResetToken>,
    private jwtService: JwtService,
    private mailService: MailService,
    private twilioService: TwilioService,
    private rolesService: RolesService,
    private twoFactorAuthService: TwoFactorAuthService,
  ) { }

  async signup(signupData: UserInput) {
    const { email, username, password, publicKey, twoFactorSecret, role, isVerified, phoneNumber } = signupData;

    // Vérifier si l'email est déjà utilisé
    const emailInUse = await this.UserModel.findOne({ email });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }

    // Vérifier si le numéro de téléphone est déjà utilisé (si fourni)
    if (phoneNumber) {
      const phoneInUse = await this.UserModel.findOne({ phoneNumber });
      if (phoneInUse) {
        throw new BadRequestException('Phone number already in use');
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur avec les champs fournis
    const newUser = await this.UserModel.create({
      username,
      email,
      password: hashedPassword,
      publicKey: publicKey || null,
      twoFactorSecret: twoFactorSecret || null,
      role: role || 'user',
      isVerified: isVerified || false,
      phoneNumber: phoneNumber || null, // ✅ Add phoneNumber here!
    });

    return newUser;
}


  async login(credentials: LoginInput): Promise<LoginResponse> {
    const { email, password } = credentials;

    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    // Si 2FA est activé
    if (user.isTwoFactorEnabled) {
      // Générer un token temporaire pour la vérification 2FA
      const tempToken = this.jwtService.sign(
        { 
          userId: user._id,
          isTwoFactorAuthenticated: false,
          isTemp: true 
        },
        { expiresIn: '5m' } // Token temporaire valide 5 minutes
      );

      return {
        requiresTwoFactor: true,
        tempToken,
        user,
        accessToken: null,
        refreshToken: null
      };
    }

    // Si pas de 2FA, générer les tokens normaux
    const tokens = await this.generateUserTokens(user._id, true);
    return {
      requiresTwoFactor: false,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
      tempToken: null
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

  async forgotPassword(identifier: string): Promise<void> {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    let user;

    if (isEmail) {
        user = await this.UserModel.findOne({ email: identifier });
    } else {
        let normalizedPhone = identifier.startsWith('+216') ? identifier : `+216${identifier}`;
        user = await this.UserModel.findOne({ phoneNumber: normalizedPhone });
    }

    if (!user) {
        this.logger.warn(`User with ${isEmail ? 'email' : 'phone number'} ${identifier} not found`);
        throw new Error('User not found');  // ✅ Throw error here
    }

    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 15); 

    let resetToken: string;
    if (isEmail) {
        resetToken = nanoid(64);
    } else {
        resetToken = generateOtp();
    }

    await this.ResetTokenModel.create({
        token: resetToken,
        userId: user._id,
        expiryDate,
        email: user.email,
        phoneNumber: identifier,
    });

    if (isEmail) {
        this.logger.log(`Sending password reset email to ${identifier}`);
        await this.mailService.sendPasswordResetEmail(identifier, resetToken);
    } else {
        this.logger.log(`Sending password reset SMS to ${identifier}`);
        await this.twilioService.sendSms(identifier, `Your OTP code is: ${resetToken}`);
    }

    this.logger.log(`Password reset code sent to ${identifier}`);
}


  async resetPasswordWithToken(token: string, newPassword: string): Promise<User> {
    const resetToken = await this.ResetTokenModel.findOne({ token });

    if (!resetToken || resetToken.expiryDate < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.UserModel.findById(resetToken.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    resetToken.used = true;
    await resetToken.save();

    return user;
  }


  async refreshTokens(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }
    return this.generateUserTokens(token.userId.toString(),false);
  }
  async generateUserTokens(userId: string | Types.ObjectId, isTwoFactorAuthenticated = false) {
    const user = await this.UserModel.findById(userId);
    
    const payload = {
      userId: user._id,
      email: user.email,
      isTwoFactorAuthenticated,
    };

    const accessToken = this.jwtService.sign(payload, { 
      expiresIn: '10h',
      secret: process.env.JWT_SECRET 
    });

    const refreshToken = uuidv4();
    await this.storeRefreshToken(refreshToken, userId);

    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId: string | Types.ObjectId) {
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

  async verifyCode(identifier: string, code: string) {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    const query = isEmail 
        ? { email: identifier } 
        : { phoneNumber: identifier };

    const resetToken = await this.ResetTokenModel.findOne({
        ...query,
        token: code,
        used: false,
        expiryDate: { $gt: new Date() }
    });

    if (!resetToken) {
        this.logger.warn(`Failed OTP verification for ${identifier}`);
        throw new BadRequestException('Invalid or expired OTP code.');
    }

    resetToken.used = true;
    await resetToken.save();

    return 'Code verified successfully!';
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
    console.log('Updating 2FA secret for user:', userId, 'Secret:', secret);
    
    try {
      const updatedUser = await this.UserModel.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            twoFactorSecret: secret 
          }
        },
        { 
          new: true,
          runValidators: true
        }
      ).exec();
  
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
  
      console.log('Updated user:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating 2FA secret:', error);
      throw error;
    }
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

  async verifyTwoFactorToken(userId: string, token: string) {
    const user = await this.UserModel.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('Utilisateur non trouvé ou 2FA non activé');
    }

    const isValid = this.twoFactorAuthService.validateToken(
      user.twoFactorSecret, 
      token
    );

    if (!isValid) {
      throw new UnauthorizedException('Code 2FA invalide');
    }

    // Générer un nouveau token avec 2FA validé
    return this.generateUserTokens(userId, true);
  }

  async forgotPasswordSms(phoneNumber: string): Promise<void> {
    const user = await this.UserModel.findOne({ phoneNumber });
  
    if (user) {
      const otp = generateOtp();
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 15); // OTP valid for 10 mins
  
      await this.ResetTokenModel.create({
        token: otp,
        userId: user._id,
        expiryDate,
        email: user.email,
        phoneNumber: phoneNumber,
      });
  
      await this.twilioService.sendSms(phoneNumber, `Your OTP code is: ${otp}`);
    } else {
      this.logger.warn(`User with phone number ${phoneNumber} not found`);
    }
  }
  
  
  

}













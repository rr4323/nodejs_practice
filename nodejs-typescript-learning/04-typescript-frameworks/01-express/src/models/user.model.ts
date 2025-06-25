import { Model, DataTypes, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';

// Define user attributes
interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'publisher' | 'admin';
  resetPasswordToken?: string | null;
  resetPasswordExpire?: Date | null;
  isEmailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpire?: Date | null;
  isActive: boolean;
  lastLogin?: Date | null;
  profileImage?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
  about?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
  twoFactorRecoveryCodes?: string[] | null;
  loginAttempts: number;
  lockUntil?: Date | null;
  preferences?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Some fields are optional when creating a User
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'isEmailVerified' | 'isActive' | 'twoFactorEnabled' | 'loginAttempts' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: 'user' | 'publisher' | 'admin';
  public resetPasswordToken?: string | null;
  public resetPasswordExpire?: Date | null;
  public isEmailVerified!: boolean;
  public emailVerificationToken?: string | null;
  public emailVerificationExpire?: Date | null;
  public isActive!: boolean;
  public lastLogin?: Date | null;
  public profileImage?: string | null;
  public phoneNumber?: string | null;
  public address?: string | null;
  public city?: string | null;
  public country?: string | null;
  public postalCode?: string | null;
  public about?: string | null;
  public facebookUrl?: string | null;
  public twitterUrl?: string | null;
  public instagramUrl?: string | null;
  public linkedinUrl?: string | null;
  public githubUrl?: string | null;
  public websiteUrl?: string | null;
  public twoFactorEnabled!: boolean;
  public twoFactorSecret?: string | null;
  public twoFactorRecoveryCodes?: string[] | null;
  public loginAttempts!: number;
  public lockUntil?: Date | null;
  public preferences?: Record<string, any> | null;
  public metadata?: Record<string, any> | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  public isAccountLocked(): boolean {
    return this.lockUntil ? this.lockUntil > new Date() : false;
  }

  public async incrementLoginAttempts(): Promise<void> {
    const HOUR_IN_MS = 3600000; // 1 hour in milliseconds
    const LOCK_TIME = 24 * HOUR_IN_MS; // 24 hours
    const MAX_LOGIN_ATTEMPTS = 5;

    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < new Date()) {
      return await this.update({
        loginAttempts: 1,
        lockUntil: null,
      });
    }

    // Otherwise, increment the number of login attempts
    const updates = {
      loginAttempts: this.loginAttempts + 1,
    };

    // Lock the account if we've reached max attempts
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
      updates.lockUntil = new Date(Date.now() + LOCK_TIME);
    }

    await this.update(updates);
  }

  // Add other instance methods as needed
}

// Initialize the User model
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name is required' },
        len: { args: [2, 50], msg: 'Name must be between 2 and 50 characters' },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Please include a valid email' },
        notEmpty: { msg: 'Email is required' },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: { args: [6], msg: 'Password must be at least 6 characters' },
        notEmpty: { msg: 'Password is required' },
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'publisher', 'admin'),
      defaultValue: 'user',
      validate: {
        isIn: {
          args: [['user', 'publisher', 'admin']],
          msg: 'Invalid user role',
        },
      },
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpire: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailVerificationExpire: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: { msg: 'Profile image must be a valid URL' },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
          msg: 'Please provide a valid phone number',
        },
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    facebookUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: { msg: 'Facebook URL must be a valid URL' },
      },
    },
    twitterUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: { msg: 'Twitter URL must be a valid URL' },
      },
    },
    instagramUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: { msg: 'Instagram URL must be a valid URL' },
      },
    },
    linkedinUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: { msg: 'LinkedIn URL must be a valid URL' },
      },
    },
    githubUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: { msg: 'GitHub URL must be a valid URL' },
      },
    },
    websiteUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: { msg: 'Website URL must be a valid URL' },
      },
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    twoFactorSecret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twoFactorRecoveryCodes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
    },
  }
);

// Hash password before saving
User.beforeCreate(async (user: User) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Update password hash if password is changed
User.beforeUpdate(async (user: User) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Add instance methods
User.prototype.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.isAccountLocked = function (): boolean {
  return this.lockUntil ? this.lockUntil > new Date() : false;
};

User.prototype.incrementLoginAttempts = async function (): Promise<void> {
  const HOUR_IN_MS = 3600000; // 1 hour in milliseconds
  const LOCK_TIME = 24 * HOUR_IN_MS; // 24 hours
  const MAX_LOGIN_ATTEMPTS = 5;

  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return await this.update({
      loginAttempts: 1,
      lockUntil: null,
    });
  }

  // Otherwise, increment the number of login attempts
  const updates: any = {
    loginAttempts: this.loginAttempts + 1,
  };

  // Lock the account if we've reached max attempts
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
    updates.lockUntil = new Date(Date.now() + LOCK_TIME);
  }

  await this.update(updates);
};

export default User;

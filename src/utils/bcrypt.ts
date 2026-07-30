import bcrypt from 'bcryptjs';

export class Userhash {
  static async hashPassword(passwordOrUser: string | any): Promise<string | void> {
    if (typeof passwordOrUser === 'string') {
      if (!passwordOrUser.trim()) throw new Error('Password is empty');
      return await bcrypt.hash(passwordOrUser, 10);
    }

    if (
      passwordOrUser &&
      typeof passwordOrUser === 'object' &&
      passwordOrUser.password &&
      typeof passwordOrUser.changed === 'function' &&
      passwordOrUser.changed('password')
    ) {
      passwordOrUser.password = await bcrypt.hash(passwordOrUser.password, 10);
    }
  }

  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    if (!hashedPassword) throw new Error('Missing hashed password');
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default Userhash;

import { HttpException, Injectable, Scope } from '@nestjs/common';
import { User } from '@app/domain/user/user.entity';
import { AppContext } from '../../context/appContext.service';
import { GetOneCriteriaType } from '@app/common/types/dbInterfaces';

@Injectable({ scope: Scope.REQUEST })
export class UserRepository {
  constructor(private readonly _context: AppContext) {}

  /**
   * Create a new user
   * @param user User
   * @returns User
   */
  async createUser(user: User): Promise<User> {
    try {
      const userData = await this._context.user.create(user);
      return { ...user, ...userData?.raw[0], ...userData?.generatedMaps[0] };
    } catch (error) {
      throw new HttpException(
        `Error de DB: ${error?.message || ''}`,
        error?.status || 500,
      );
    }
  }

  /**
   * Update the password hash of a user
   * @param id User id
   * @param password Password hash
   */
  async updatePassword(id: number, password: string): Promise<void> {
    try {
      await this._context.user.getTypeOrmRepository().update(id, { password });
    } catch (error) {
      throw new HttpException(
        `Error de DB: ${error?.message || ''}`,
        error?.status || 500,
      );
    }
  }

  /**
   * Find one user
   * @param options Search options
   * @returns User
   */
  async findUser(options: GetOneCriteriaType<User>): Promise<User> {
    try {
      return await this._context.user.getOne(options);
    } catch (error) {
      throw new HttpException(
        `Error de DB: ${error?.message || ''}`,
        error?.status || 500,
      );
    }
  }

  /**
   * Update the editable fields of a user
   * @param id User id
   * @param user Fields to update
   */
  async updateUser(id: number, user: Partial<User>): Promise<void> {
    try {
      await this._context.user.getTypeOrmRepository().update(id, user);
    } catch (error) {
      throw new HttpException(
        `Error de DB: ${error?.message || ''}`,
        error?.status || 500,
      );
    }
  }

  /**
   * Soft delete a user. The email is released so it can be registered again
   * @param user User
   */
  async deleteUser(user: User): Promise<void> {
    try {
      const repository = this._context.user.getTypeOrmRepository();
      await repository.update(user.id, {
        email: `deleted-${user.id}-${Date.now()}@${user.email.split('@')[1]}`,
      });
      await repository.softDelete(user.id);
    } catch (error) {
      throw new HttpException(
        `Error de DB: ${error?.message || ''}`,
        error?.status || 500,
      );
    }
  }
}

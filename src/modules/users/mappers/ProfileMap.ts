/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { User } from '../entities/User';

export class ProfileMap {
  static toDTO({ id, name, email, created_at, updated_at }: User) {
    return {
      id,
      name,
      email,
      created_at,
      updated_at,
    };
  }
}

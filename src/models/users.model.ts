import conn from "../config/database.config";
import { User } from "../types/users.d";

export class Users {
  public static async getUsers(): Promise<User[]> {
    const [rows] = await conn.query("SELECT * FROM users");
    return rows as User[];
  }

  public static async getUserById(id: number): Promise<User | null> {
    const [rows] = await conn.query("SELECT * FROM users WHERE id = ?", [id]);
    const result = (rows as User[])[0];
    return result ?? null;
  }

  public static async getUserByEmail(email: string): Promise<User | null> {
    const [rows] = await conn.query("SELECT * FROM users WHERE email = ?", [email]);
    const result = (rows as User[])[0];
    return result ?? null;
  }

  public static async createUser(user: User): Promise<User> {
    const [result] = await conn.query(
      "INSERT INTO users (username, email, avatar) VALUES (?, ?, ?)",
      [user.username, user.email, user.avatar]
    );

    const insertResult = result as any;
    const insertedId = insertResult.insertId;

    return {
      ...user,
      id: insertedId,
      collaborators: [],
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  public static async updateUser(id: number, user: Partial<User>): Promise<boolean> {
    const setValues = Object.entries(user).map(([key, value]) => `${key} = ?`).join(', ');
    const [result] = await conn.query(
      `UPDATE users SET ${setValues} WHERE id = ?`,
      [...Object.values(user), id]
    );

    return (result as any).affectedRows > 0;
  }

  public static async deleteUser(id: number): Promise<boolean> {
    const [result] = await conn.query("DELETE FROM users WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }
}

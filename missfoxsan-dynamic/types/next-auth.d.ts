import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * 扩展Session类型，添加用户ID
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

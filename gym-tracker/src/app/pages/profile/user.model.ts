export class User {
  constructor(
    public id: string,
    public email: string,
    public fullName?: string,
    public role?: string,
    public createdAt?: string,
    public emailConfirmedAt?: string,
    public metadata?: any
  ) {}
}

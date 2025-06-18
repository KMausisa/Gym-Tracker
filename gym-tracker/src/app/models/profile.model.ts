export class Profile {
  constructor(
    public id: string,
    public full_name: string,
    public birthday: Date,
    public email: string,
    public updated_at: Date,
    public created_at: Date
  ) {}
}

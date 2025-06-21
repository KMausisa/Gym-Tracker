export class Exercise {
  constructor(
    public id: string,
    public user_id: string,
    public day_id: string,
    public name: string,
    public sets: number,
    public reps: number,
    public weight: number,
    public notes?: string
  ) {}
}

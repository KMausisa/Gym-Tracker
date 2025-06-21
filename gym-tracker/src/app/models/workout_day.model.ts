export class WorkoutDay {
  constructor(
    public id: string,
    public user_id: string,
    public plan_id: string,
    public day_of_week: number,
    public position: number
  ) {}
}

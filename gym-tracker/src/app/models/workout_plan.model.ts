export class WorkoutPlan {
  constructor(
    public id: string,
    public user_id: string,
    public title: string,
    public description: string,
    public days: string[],
    public created_at?: Date
  ) {}
}

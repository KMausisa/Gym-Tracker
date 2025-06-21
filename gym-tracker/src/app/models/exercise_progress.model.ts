export class ExerciseProgress {
  constructor(
    public id: string,
    public exercise_id: string,
    public user_id: string,
    public workout_id: string,
    public day_id: string,
    public name: string,
    public sets: number,
    public reps: number[],
    public weights: number[],
    public maxVolume: number,
    public notes?: string[],
    public created_at?: Date
  ) {}
}

import { desc, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { workoutLogs } from "../../../db/schema";

type WorkoutPayload = {
  entryDate?: string;
  weightKg?: number;
  planDay?: number;
  completed?: boolean;
  durationMinutes?: number;
};

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function errorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const cause =
    error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  if (`${message}\n${cause}`.includes("no such table")) {
    return "The private workout log is being prepared. Please try again shortly.";
  }
  return message;
}

export async function GET() {
  try {
    const db = getDb();
    const logs = await db
      .select()
      .from(workoutLogs)
      .orderBy(desc(workoutLogs.entryDate), desc(workoutLogs.id))
      .limit(90);

    return Response.json({ logs });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as WorkoutPayload;
    const entryDate = payload.entryDate?.trim() ?? "";
    const weightKg = Number(payload.weightKg);
    const planDay = Number(payload.planDay);
    const durationMinutes = Math.max(0, Math.round(Number(payload.durationMinutes) || 0));
    const completed = Boolean(payload.completed);

    if (!isDateKey(entryDate)) {
      return Response.json({ error: "A valid entry date is required." }, { status: 400 });
    }
    if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 250) {
      return Response.json({ error: "Enter a weight between 30 and 250 kg." }, { status: 400 });
    }
    if (!Number.isInteger(planDay) || planDay < 1 || planDay > 30) {
      return Response.json({ error: "Choose a plan day between 1 and 30." }, { status: 400 });
    }

    const db = getDb();
    const now = new Date().toISOString();
    const [log] = await db
      .insert(workoutLogs)
      .values({
        entryDate,
        weightKg,
        planDay,
        completed,
        durationMinutes,
        completedAt: completed ? now : null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: workoutLogs.entryDate,
        set: {
          weightKg,
          planDay,
          completed: completed ? true : sql`${workoutLogs.completed}`,
          durationMinutes: completed ? durationMinutes : sql`${workoutLogs.durationMinutes}`,
          completedAt: completed ? now : sql`${workoutLogs.completedAt}`,
          updatedAt: now,
        },
      })
      .returning();

    return Response.json({ log });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

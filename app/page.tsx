"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Exercise = {
  name: string;
  target: string;
  seconds: number;
  image: string;
  cue: string;
  kind?: "warmup" | "work" | "rest" | "cooldown";
};

type DayPlan = {
  day: number;
  phase: string;
  title: string;
  label: string;
  duration: number;
  intensity: string;
  movement: string;
  summary: string;
  structure: string[];
  template: string;
  rounds: number;
  work?: number;
  rest?: number;
};

type WorkoutLog = {
  id: number;
  entryDate: string;
  weightKg: number;
  planDay: number;
  completed: boolean;
  durationMinutes: number;
  completedAt: string | null;
};

const exerciseLibrary: Record<string, Omit<Exercise, "seconds">> = {
  march: { name: "Fast march", target: "Stay tall • drive the arms", image: "knee", cue: "Land softly, keep your ribs stacked and swing your arms with purpose." },
  armCircles: { name: "Arm circles + swings", target: "Smooth, controlled range", image: "pushup", cue: "Relax your neck and gradually make each circle larger." },
  hipCircles: { name: "Hip circles", target: "Both directions", image: "lunge", cue: "Keep your feet planted and move slowly through a comfortable range." },
  squat: { name: "Bodyweight squat", target: "12–20 reps", image: "squat", cue: "Sit your hips back, keep your chest proud and track knees over toes." },
  pushup: { name: "Push-up", target: "6–15 reps", image: "pushup", cue: "Make one long line from head to heel. Use a wall or knees if form slips." },
  lunge: { name: "Reverse lunge", target: "8–12 each side", image: "lunge", cue: "Step back quietly, keep the front foot planted and torso upright." },
  bridge: { name: "Glute bridge", target: "15–20 reps", image: "bridge", cue: "Press through your heels, brace your core and squeeze at the top." },
  deadbug: { name: "Dead bug", target: "8–12 each side", image: "deadbug", cue: "Keep your lower back gently pressed down while opposite limbs extend." },
  plank: { name: "Forearm plank", target: "20–45 sec", image: "plank", cue: "Push the floor away, squeeze glutes and keep hips level." },
  split: { name: "Split squat", target: "8–12 each side", image: "split", cue: "Drop straight down between your feet and drive through the front foot." },
  pike: { name: "Pike push-up", target: "6–12 reps", image: "pushup", cue: "Send hips high and lower your head between your hands. Use your knees if needed." },
  singleBridge: { name: "Single-leg glute bridge", target: "8–12 each side", image: "singlebridge", cue: "Keep both hip bones level and move through the heel of the working leg." },
  snowAngel: { name: "Reverse snow angel", target: "10–15 reps", image: "superman", cue: "Stay long through the spine and sweep arms slowly without shrugging." },
  birdDog: { name: "Bird dog", target: "10 each side", image: "deadbug", cue: "Reach long, keep hips square and imagine balancing a glass on your back." },
  sidePlank: { name: "Side plank", target: "15–40 sec each", image: "sideplank", cue: "Stack shoulder over elbow and lift the underside of your waist." },
  highKnees: { name: "High knees", target: "Quick, light contacts", image: "knee", cue: "Stay tall and land quietly. Switch to a fast march for low impact." },
  jacks: { name: "Step jacks", target: "Or jumping jacks", image: "knee", cue: "Step or jump wide while reaching overhead. Keep every landing soft." },
  boxing: { name: "Shadow boxing", target: "Fast hands • light feet", image: "pushup", cue: "Brace your core, rotate through the ribs and snap each hand back to guard." },
  skaters: { name: "Skater steps", target: "Or skater jumps", image: "lunge", cue: "Push side to side and keep your knee aligned. Step behind for low impact." },
  reach: { name: "Squat to overhead reach", target: "Full-body rhythm", image: "squat", cue: "Sit into the squat, then stand tall and reach through your fingertips." },
  mountain: { name: "Mountain climbers", target: "Controlled or quick", image: "mountain", cue: "Stack shoulders over wrists and draw knees forward without bouncing the hips." },
  kick: { name: "Front kicks", target: "Alternate sides", image: "kick", cue: "Stay tall, brace your core and extend only as high as you can control." },
  catcow: { name: "Cat–cow", target: "Breathe with the movement", image: "catcow", cue: "Move one vertebra at a time and never force the end range." },
  downDog: { name: "Downward-facing dog", target: "Pedal the heels", image: "hamstring", cue: "Lengthen your spine first; your heels do not need to touch the floor." },
  lowLunge: { name: "Low lunge", target: "Both sides", image: "lunge", cue: "Keep the front knee over the ankle and gently lengthen the back hip." },
  cobra: { name: "Sphinx / cobra", target: "Gentle extension", image: "superman", cue: "Keep the back of your neck long and stop before your lower back pinches." },
  childPose: { name: "Child’s pose", target: "Slow nasal breaths", image: "childpose", cue: "Let your ribs expand into your thighs and relax your shoulders." },
  hamstring: { name: "Hamstring stretch", target: "Both sides", image: "hamstring", cue: "Hinge from your hips with a long spine; stop well before sharp tension." },
};

const phaseNames = ["Foundation", "Volume increase", "Higher effort", "Peak week", "Challenge + reset"];

const dayPlans: DayPlan[] = [
  { day: 1, phase: phaseNames[0], title: "Build the base", label: "Strength A", duration: 31, intensity: "6/10", movement: "10 min march", summary: "Your first full-body strength session. Keep it crisp and conservative.", structure: ["Workout A × 2 rounds", "5 min brisk march"], template: "a", rounds: 2 },
  { day: 2, phase: phaseNames[0], title: "Find your rhythm", label: "Low-impact cardio", duration: 30, intensity: "5/10", movement: "Included", summary: "Conversational cardio that builds your engine without pounding your joints.", structure: ["7-move cardio rotation", "Continuous easy pace"], template: "cardio", rounds: 4, work: 60, rest: 0 },
  { day: 3, phase: phaseNames[0], title: "Strong from every side", label: "Strength B", duration: 32, intensity: "6/10", movement: "10 min march", summary: "Single-leg strength, shoulders, posterior chain and deep core control.", structure: ["Workout B × 2 rounds", "5 min shadow boxing"], template: "b", rounds: 2 },
  { day: 4, phase: phaseNames[0], title: "Restore + move", label: "Mobility", duration: 30, intensity: "3/10", movement: "10 min easy march", summary: "Open the hips, shoulders and spine while keeping a little easy movement.", structure: ["20 min mobility", "10 min easy march"], template: "mobility", rounds: 2 },
  { day: 5, phase: phaseNames[0], title: "First interval day", label: "Intervals", duration: 29, intensity: "8/10", movement: "10 min march", summary: "Six simple movements, equal work and rest. Finish wanting one more round.", structure: ["30 sec work / 30 sec rest", "3 rounds"], template: "interval", rounds: 3, work: 30, rest: 30 },
  { day: 6, phase: phaseNames[0], title: "Weekend total body", label: "Strength mix", duration: 34, intensity: "6/10", movement: "10 min march", summary: "Repeat Workout A, then finish with the back-and-core half of Workout B.", structure: ["Workout A × 2", "B finishers × 1"], template: "mix", rounds: 2 },
  { day: 7, phase: phaseNames[0], title: "Absorb the work", label: "Rest / gentle mobility", duration: 18, intensity: "2/10", movement: "Optional walk", summary: "Complete rest is valid. This optional flow helps you feel looser for week two.", structure: ["Gentle mobility", "Slow breathing"], template: "recovery", rounds: 1 },
  { day: 8, phase: phaseNames[1], title: "Add the round", label: "Strength A", duration: 37, intensity: "6/10", movement: "12 min march", summary: "The same patterns, now with one extra quality round.", structure: ["Workout A × 3 rounds"], template: "a", rounds: 3 },
  { day: 9, phase: phaseNames[1], title: "Longer engine", label: "Low-impact cardio", duration: 35, intensity: "5/10", movement: "Included", summary: "Five extra minutes at a pace where you can still speak in sentences.", structure: ["7-move cardio rotation", "Conversational pace"], template: "cardio", rounds: 5, work: 60, rest: 0 },
  { day: 10, phase: phaseNames[1], title: "Control the range", label: "Strength B", duration: 38, intensity: "6/10", movement: "12 min march", summary: "Three rounds of unilateral strength and trunk stability.", structure: ["Workout B × 3 rounds"], template: "b", rounds: 3 },
  { day: 11, phase: phaseNames[1], title: "Core + restore", label: "Mobility + core", duration: 32, intensity: "5/10", movement: "12 min march", summary: "A calm mobility block followed by three focused core rounds.", structure: ["20 min mobility", "Core circuit × 3"], template: "mobilityCore", rounds: 3 },
  { day: 12, phase: phaseNames[1], title: "Turn up the work", label: "Intervals", duration: 30, intensity: "8/10", movement: "12 min march", summary: "Longer efforts, shorter rests. Choose low-impact versions whenever needed.", structure: ["35 sec work / 25 sec rest", "3 rounds"], template: "interval", rounds: 3, work: 35, rest: 25 },
  { day: 13, phase: phaseNames[1], title: "The double feature", label: "Strength A + B", duration: 43, intensity: "7/10", movement: "12 min march", summary: "Two rounds from each strength template. Smooth form beats speed.", structure: ["Workout A × 2", "Workout B × 2"], template: "double", rounds: 2 },
  { day: 14, phase: phaseNames[1], title: "Full rest", label: "Rest", duration: 0, intensity: "—", movement: "Easy steps only", summary: "No structured workout today. Eat well, hydrate and let adaptation happen.", structure: ["Complete rest"], template: "rest", rounds: 0 },
  { day: 15, phase: phaseNames[2], title: "Own the lowering", label: "Tempo strength A", duration: 39, intensity: "7/10", movement: "15 min march", summary: "Use a slow three-second lowering phase on squats and push-ups.", structure: ["Workout A × 3", "3-sec lowering"], template: "aTempo", rounds: 3 },
  { day: 16, phase: phaseNames[2], title: "Forty steady", label: "Low-impact cardio", duration: 40, intensity: "5/10", movement: "Included", summary: "Your longest steady session yet. Keep your breathing controlled.", structure: ["7-move cardio rotation", "40 min continuous"], template: "cardio", rounds: 6, work: 60, rest: 0 },
  { day: 17, phase: phaseNames[2], title: "Slow is strong", label: "Tempo strength B", duration: 39, intensity: "7/10", movement: "15 min march", summary: "Controlled repetitions make bodyweight work meaningfully harder.", structure: ["Workout B × 3", "Slow controlled reps"], template: "bTempo", rounds: 3 },
  { day: 18, phase: phaseNames[2], title: "Move better", label: "Mobility + easy cardio", duration: 35, intensity: "4/10", movement: "Included", summary: "A longer mobility flow and ten minutes of easy, restorative cardio.", structure: ["25 min mobility", "10 min easy cardio"], template: "mobility", rounds: 3 },
  { day: 19, phase: phaseNames[2], title: "Four-round fire", label: "Intervals", duration: 34, intensity: "8/10", movement: "15 min march", summary: "Forty seconds on, twenty off. Your fourth round should be tough but tidy.", structure: ["40 sec work / 20 sec rest", "4 rounds"], template: "interval", rounds: 4, work: 40, rest: 20 },
  { day: 20, phase: phaseNames[2], title: "Full-body benchmark", label: "Challenge circuit", duration: 38, intensity: "8/10", movement: "15 min march", summary: "Four rounds of the essential patterns with a one-minute reset.", structure: ["6-exercise circuit", "4 rounds"], template: "challenge", rounds: 4 },
  { day: 21, phase: phaseNames[2], title: "Reset day", label: "Rest", duration: 0, intensity: "—", movement: "Gentle steps", summary: "Complete rest. Notice your energy, sleep and any joints that need attention.", structure: ["Complete rest"], template: "rest", rounds: 0 },
  { day: 22, phase: phaseNames[3], title: "Peak strength A", label: "Strength A", duration: 45, intensity: "7/10", movement: "15–20 min march", summary: "Four patient rounds. Stop the set before your technique changes.", structure: ["Workout A × 4 rounds"], template: "a", rounds: 4 },
  { day: 23, phase: phaseNames[3], title: "The long steady", label: "Low-impact cardio", duration: 45, intensity: "5/10", movement: "Included", summary: "Forty-five minutes of joint-friendly movement at conversational effort.", structure: ["7-move cardio rotation", "45 min continuous"], template: "cardio", rounds: 7, work: 60, rest: 0 },
  { day: 24, phase: phaseNames[3], title: "Peak strength B", label: "Strength B", duration: 45, intensity: "7/10", movement: "15–20 min march", summary: "Your highest-volume Workout B. Keep every rep controlled.", structure: ["Workout B × 4 rounds"], template: "b", rounds: 4 },
  { day: 25, phase: phaseNames[3], title: "Core under control", label: "Mobility + core", duration: 33, intensity: "5/10", movement: "15–20 min march", summary: "Mobility first, then a compact core circuit performed with precision.", structure: ["20 min mobility", "Core circuit × 3"], template: "mobilityCore", rounds: 3 },
  { day: 26, phase: phaseNames[3], title: "Peak intervals", label: "Intervals", duration: 34, intensity: "8/10", movement: "15–20 min march", summary: "Your longest work intervals. Step, don’t jump, if landings stop being quiet.", structure: ["45 sec work / 15 sec rest", "4 rounds"], template: "interval", rounds: 4, work: 45, rest: 15 },
  { day: 27, phase: phaseNames[3], title: "Circuit summit", label: "Challenge circuit", duration: 43, intensity: "8/10", movement: "15–20 min march", summary: "Four strong rounds; take the fifth only if form and energy are still good.", structure: ["6-exercise circuit", "4–5 rounds"], template: "challenge", rounds: 5 },
  { day: 28, phase: phaseNames[3], title: "Earned rest", label: "Rest", duration: 0, intensity: "—", movement: "Easy steps only", summary: "No workout. Let your body consolidate the peak week.", structure: ["Complete rest"], template: "rest", rounds: 0 },
  { day: 29, phase: phaseNames[4], title: "Final conditioning", label: "Final challenge", duration: 46, intensity: "8/10", movement: "15–20 min march", summary: "Five rounds. Work hard, but never race at the expense of technique.", structure: ["6-exercise final circuit", "5 rounds"], template: "final", rounds: 5 },
  { day: 30, phase: phaseNames[4], title: "Recover + retest", label: "Reassessment", duration: 35, intensity: "4/10", movement: "Included", summary: "Easy movement, mobility and a calm check of the progress you have built.", structure: ["20 min easy cardio", "15 min mobility", "Push-up + plank retest"], template: "retest", rounds: 2 },
];

const warmup = [["march", 60], ["armCircles", 60], ["hipCircles", 30], ["squat", 40], ["lunge", 40], ["catcow", 60]] as const;
const cooldown = [["march", 60], ["lowLunge", 45], ["hamstring", 45], ["childPose", 45]] as const;
const strengthA = ["squat", "pushup", "lunge", "bridge", "deadbug", "plank"];
const strengthB = ["split", "pike", "singleBridge", "snowAngel", "birdDog", "sidePlank"];
const intervals = ["highKnees", "jacks", "boxing", "skaters", "reach", "mountain"];
const cardio = ["march", "skaters", "highKnees", "boxing", "jacks", "kick", "reach"];
const mobility = ["catcow", "downDog", "lowLunge", "cobra", "childPose", "hamstring", "sidePlank"];
const challenge = ["squat", "pushup", "lunge", "bridge", "boxing", "plank"];

function makeExercise(key: string, seconds: number, kind: Exercise["kind"] = "work"): Exercise {
  return { ...exerciseLibrary[key], seconds, kind };
}

function restStep(seconds: number, label = "Reset + breathe"): Exercise {
  return { name: label, target: "Shake out • nasal breathing", seconds, image: "rest", cue: "Slow your breathing, stay loose and get ready for the next movement.", kind: "rest" };
}

function addRounds(target: Exercise[], keys: string[], rounds: number, workSeconds = 45, between = 10, roundRest = 60) {
  for (let round = 0; round < rounds; round += 1) {
    keys.forEach((key, index) => {
      target.push(makeExercise(key, workSeconds));
      if (between && index < keys.length - 1) target.push(restStep(between, "Quick transition"));
    });
    if (round < rounds - 1) target.push(restStep(roundRest, `Round ${round + 1} complete`));
  }
}

function buildSession(day: DayPlan): Exercise[] {
  if (day.template === "rest") return [];
  const session: Exercise[] = warmup.map(([key, seconds]) => makeExercise(key, seconds, "warmup"));
  if (day.template === "a" || day.template === "aTempo") addRounds(session, strengthA, day.rounds, day.template === "aTempo" ? 55 : 45, 10, 75);
  else if (day.template === "b" || day.template === "bTempo") addRounds(session, strengthB, day.rounds, day.template === "bTempo" ? 55 : 45, 10, 75);
  else if (day.template === "mix") {
    addRounds(session, strengthA, 2, 45, 10, 60);
    session.push(restStep(75, "Workout A complete"));
    addRounds(session, ["snowAngel", "birdDog", "sidePlank"], 1, 45, 10, 0);
  } else if (day.template === "double") {
    addRounds(session, strengthA, 2, 45, 8, 60);
    session.push(restStep(75, "Switch to Workout B"));
    addRounds(session, strengthB, 2, 45, 8, 60);
  } else if (day.template === "interval") {
    for (let round = 0; round < day.rounds; round += 1) {
      intervals.forEach((key) => {
        session.push(makeExercise(key, day.work ?? 30));
        session.push(restStep(day.rest ?? 30));
      });
      if (round < day.rounds - 1) session.push(restStep(60, `Round ${round + 1} complete`));
    }
  } else if (day.template === "cardio") addRounds(session, cardio, day.rounds, day.work ?? 60, 0, 30);
  else if (day.template === "mobility" || day.template === "recovery") {
    addRounds(session, mobility, day.rounds, 45, 5, 20);
    if (day.day !== 7) addRounds(session, cardio.slice(0, 5), 2, 60, 0, 20);
  } else if (day.template === "mobilityCore") {
    addRounds(session, mobility, 2, 45, 5, 20);
    session.push(restStep(45, "Core block next"));
    addRounds(session, ["deadbug", "sidePlank", "mountain", "bridge"], 3, 40, 8, 45);
  } else if (day.template === "challenge" || day.template === "final") addRounds(session, challenge, day.rounds, day.template === "final" ? 50 : 45, 8, 60);
  else if (day.template === "retest") {
    addRounds(session, cardio, 2, 60, 0, 20);
    addRounds(session, mobility, 2, 45, 5, 20);
    session.push(makeExercise("pushup", 60), restStep(60, "Record your push-up score"), makeExercise("plank", 90));
  }
  cooldown.forEach(([key, seconds]) => session.push(makeExercise(key, seconds, "cooldown")));
  return session;
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
}

function ExerciseVisual({ image, name }: { image: string; name: string }) {
  if (image === "rest") return <div className="rest-visual" aria-label="Rest and breathe"><span /><div>BREATHE</div></div>;
  return (
    <div className="exercise-visual">
      <Image className="exercise-frame frame-a" src={`/exercises/${image}-0.jpg`} alt={`${name} starting position`} fill sizes="(max-width: 800px) 92vw, 44vw" priority />
      <Image className="exercise-frame frame-b" src={`/exercises/${image}-1.jpg`} alt={`${name} finishing position`} fill sizes="(max-width: 800px) 92vw, 44vw" priority />
      <div className="visual-labels"><span>START</span><span>FINISH</span></div>
    </div>
  );
}

function WorkoutRunner({ day, onClose, onComplete }: { day: DayPlan; onClose: () => void; onComplete: () => void }) {
  const session = useMemo(() => buildSession(day), [day]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(session[0]?.seconds ?? 0);
  const [playing, setPlaying] = useState(true);
  const [finished, setFinished] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const announcedRef = useRef(-1);
  const active = session[activeIndex];

  const speak = useCallback((text: string) => {
    if (!audioOn || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 0.92;
    window.speechSynthesis.speak(utterance);
  }, [audioOn]);

  const beep = useCallback(() => {
    if (!audioOn || typeof window === "undefined") return;
    try {
      const context = new window.AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 720;
      gain.gain.setValueAtTime(0.08, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.16);
    } catch { /* The visual timer remains the source of truth. */ }
  }, [audioOn]);

  const advance = useCallback(() => {
    if (activeIndex >= session.length - 1) {
      setPlaying(false);
      setFinished(true);
      onComplete();
      speak("Workout complete. Excellent work.");
      return;
    }
    const nextIndex = activeIndex + 1;
    setActiveIndex(nextIndex);
    setSecondsLeft(session[nextIndex].seconds);
  }, [activeIndex, onComplete, session, speak]);

  useEffect(() => {
    if (!playing || finished) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          beep();
          window.setTimeout(advance, 250);
          return 0;
        }
        if (current <= 4) beep();
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [advance, beep, finished, playing]);

  useEffect(() => {
    if (!active || announcedRef.current === activeIndex) return;
    announcedRef.current = activeIndex;
    speak(`${active.kind === "rest" ? "Rest." : "Next."} ${active.name}. ${active.target}.`);
  }, [active, activeIndex, speak]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === "Space") { event.preventDefault(); setPlaying((current) => !current); }
      if (event.code === "Escape") onClose();
      if (event.code === "ArrowRight") advance();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [advance, onClose]);

  if (!session.length) return null;
  const progress = ((activeIndex + (1 - secondsLeft / active.seconds)) / session.length) * 100;
  const timerProgress = ((active.seconds - secondsLeft) / active.seconds) * 360;

  if (finished) {
    return (
      <div className="runner runner-complete" role="dialog" aria-modal="true" aria-label="Workout complete">
        <button className="runner-close" type="button" onClick={onClose} aria-label="Close workout">×</button>
        <div className="finish-mark">✓</div>
        <p className="eyebrow">DAY {day.day} · RITUAL COMPLETE</p>
        <h2>Beautiful work,<br />Somsy.</h2>
        <p>Your movement is recorded. Hydrate, breathe, and let today’s effort settle.</p>
        <div className="finish-stats">
          <span><strong>{day.duration}</strong>MIN</span>
          <span><strong>{session.filter((step) => step.kind === "work").length}</strong>SETS</span>
          <span><strong>+1</strong>DAY</span>
        </div>
        <button className="primary-button" type="button" onClick={onClose}>Return home <span>↗</span></button>
      </div>
    );
  }

  return (
    <div className={`runner runner-${active.kind}`} role="dialog" aria-modal="true" aria-label={`Day ${day.day} guided workout`}>
      <div className="runner-topbar">
        <button className="runner-close" type="button" onClick={onClose} aria-label="Close workout">×</button>
        <div className="runner-step"><span>DAY {day.day}</span><strong>{activeIndex + 1} / {session.length}</strong></div>
        <button className="audio-button" type="button" onClick={() => setAudioOn((current) => !current)} aria-pressed={audioOn}>{audioOn ? "SOUND ON" : "SOUND OFF"}</button>
      </div>
      <div className="runner-progress"><span style={{ width: `${progress}%` }} /></div>
      <div className="runner-grid" aria-live="polite">
        <div className="runner-media">
          <ExerciseVisual image={active.image} name={active.name} />
          <div className="phase-chip">{active.kind === "rest" ? "RECOVER" : active.kind?.toUpperCase()}</div>
        </div>
        <div className="runner-content">
          <p className="up-next">{activeIndex < session.length - 1 ? `NEXT: ${session[activeIndex + 1].name}` : "FINAL MOVEMENT"}</p>
          <h2>{active.name}</h2>
          <p className="runner-target">{active.target}</p>
          <div className="timer-ring" style={{ "--timer-progress": `${timerProgress}deg` } as React.CSSProperties}><div><strong>{formatTime(secondsLeft)}</strong><span>{playing ? active.kind === "rest" ? "RECOVER" : "KEEP MOVING" : "PAUSED"}</span></div></div>
          <div className="form-cue"><span>FORM CUE</span><p>{active.cue}</p></div>
          <div className={`auto-flow-banner ${playing ? "" : "paused"}`}>
            <span />
            <div><strong>{playing ? "HANDS-FREE FLOW ACTIVE" : "SESSION PAUSED"}</strong><small>{playing ? "Rest and the next movement begin automatically." : "Resume whenever you are ready."}</small></div>
          </div>
          <div className="runner-controls runner-controls-auto">
            <button className="play-button" type="button" onClick={() => setPlaying((current) => !current)}>{playing ? "PAUSE SESSION" : "RESUME SESSION"}<span>{playing ? "Ⅱ" : "▶"}</span></button>
            <button className="skip-button skip-text" type="button" onClick={advance} aria-label="Skip to next exercise">SKIP →</button>
          </div>
          <p className="keyboard-hint">No tapping needed · SPACE to pause · → to skip · ESC to close</p>
        </div>
      </div>
    </div>
  );
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function friendlyDate(dateKey: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(
    new Date(`${dateKey}T12:00:00`),
  );
}

function calculateStreak(logs: WorkoutLog[]) {
  const dates = [...new Set(logs.filter((log) => log.completed).map((log) => log.entryDate))].sort().reverse();
  if (!dates.length) return 0;
  const cursor = new Date(`${dates[0]}T12:00:00`);
  let streak = 0;
  for (const dateKey of dates) {
    if (dateKey !== localDateKey(cursor)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function WeightBars({ logs }: { logs: WorkoutLog[] }) {
  const entries = [...logs].reverse().slice(-10);
  if (!entries.length) {
    return <div className="empty-chart">Your weight story begins with today’s check-in.</div>;
  }
  const weights = entries.map((entry) => entry.weightKg);
  const minimum = Math.min(...weights);
  const maximum = Math.max(...weights);
  const range = Math.max(maximum - minimum, 1);

  return (
    <div className="weight-bars" aria-label="Recent weight trend">
      {entries.map((entry) => (
        <div className="weight-column" key={entry.entryDate}>
          <span
            className={entry.completed ? "worked" : ""}
            style={{ height: `${32 + ((entry.weightKg - minimum) / range) * 58}%` }}
            title={`${friendlyDate(entry.entryDate)}: ${entry.weightKg.toFixed(1)} kg`}
          />
        </div>
      ))}
    </div>
  );
}

function WeightCheckin({
  day,
  initialWeight,
  saving,
  error,
  onCancel,
  onSubmit,
}: {
  day: DayPlan;
  initialWeight: number | null;
  saving: boolean;
  error: string;
  onCancel: () => void;
  onSubmit: (weight: number) => void;
}) {
  const [value, setValue] = useState(initialWeight ? initialWeight.toFixed(1) : "");

  return (
    <div className="checkin-overlay" role="dialog" aria-modal="true" aria-label="Daily weight check-in">
      <div className="checkin-pattern" />
      <button className="checkin-close" type="button" onClick={onCancel} aria-label="Close check-in">×</button>
      <form
        className="checkin-card"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(Number(value));
        }}
      >
        <span className="ornament">✦</span>
        <p className="kicker">Somsy’s daily check-in · {friendlyDate(localDateKey())}</p>
        <h2>How are we<br /><em>arriving today?</em></h2>
        <p>A quiet number, not a judgement. This keeps your private progress story complete.</p>
        <label htmlFor="daily-weight">Today’s weight</label>
        <div className="weight-input">
          <input
            id="daily-weight"
            type="number"
            min="30"
            max="250"
            step="0.1"
            inputMode="decimal"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="79.8"
            autoFocus
            required
          />
          <span>KG</span>
        </div>
        <div className="checkin-session"><span>DAY {String(day.day).padStart(2, "0")}</span><strong>{day.label}</strong></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? "Saving…" : day.template === "rest" ? "Log rest day" : "Save & begin ritual"} <span>→</span>
        </button>
        <small>Saved privately to Somsy’s workout log.</small>
      </form>
    </div>
  );
}

export default function Home() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [runnerOpen, setRunnerOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [activeWeight, setActiveWeight] = useState<number | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dataError, setDataError] = useState("");
  const selectedPlan = dayPlans[selectedDay - 1];
  const completedDays = useMemo(
    () => [...new Set(logs.filter((log) => log.completed).map((log) => log.planDay))],
    [logs],
  );
  const latestWeight = logs[0]?.weightKg ?? null;
  const firstWeight = logs.length ? logs[logs.length - 1].weightKg : null;
  const weightChange = latestWeight !== null && firstWeight !== null ? latestWeight - firstWeight : null;
  const streak = calculateStreak(logs);
  const todayLog = logs.find((log) => log.entryDate === localDateKey());

  const mergeLog = useCallback((log: WorkoutLog) => {
    setLogs((current) => [log, ...current.filter((entry) => entry.entryDate !== log.entryDate)].sort(
      (a, b) => b.entryDate.localeCompare(a.entryDate),
    ));
  }, []);

  useEffect(() => {
    const savedDay = Number(window.localStorage.getItem("somsy-selected-day"));
    fetch("/api/workouts")
      .then(async (response) => {
        const payload = await response.json() as { logs?: WorkoutLog[]; error?: string };
        if (!response.ok) throw new Error(payload.error || "Could not load your log.");
        setLogs(payload.logs ?? []);
        const nextDay = Math.min(30, Math.max(0, ...(payload.logs ?? []).filter((log) => log.completed).map((log) => log.planDay)) + 1);
        setSelectedDay(savedDay >= 1 && savedDay <= 30 ? savedDay : nextDay);
      })
      .catch((error: Error) => setDataError(error.message))
      .finally(() => setLoadingLogs(false));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("somsy-selected-day", String(selectedDay));
  }, [selectedDay]);

  async function saveLog(weightKg: number, completed: boolean) {
    const response = await fetch("/api/workouts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        entryDate: localDateKey(),
        weightKg,
        planDay: selectedDay,
        completed,
        durationMinutes: completed ? selectedPlan.duration : 0,
      }),
    });
    const payload = await response.json() as { log?: WorkoutLog; error?: string };
    if (!response.ok || !payload.log) throw new Error(payload.error || "Your entry could not be saved.");
    mergeLog(payload.log);
    return payload.log;
  }

  async function submitCheckin(weightKg: number) {
    setDataError("");
    setSaving(true);
    try {
      await saveLog(weightKg, selectedPlan.template === "rest");
      setActiveWeight(weightKg);
      setCheckinOpen(false);
      if (selectedPlan.template !== "rest") setRunnerOpen(true);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Your entry could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const markComplete = useCallback(() => {
    const weight = activeWeight ?? todayLog?.weightKg ?? latestWeight;
    if (weight === null) return;
    void saveLog(weight, true).catch((error: Error) => setDataError(error.message));
  // saveLog is intentionally scoped to the selected session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWeight, latestWeight, selectedDay, selectedPlan.duration, todayLog?.weightKg]);

  const startCheckin = () => {
    setDataError("");
    setCheckinOpen(true);
  };

  return (
    <main className="somsy-shell">
      <div className="page-pattern" />
      <nav className="nav">
        <a className="brand" href="#home" aria-label="Somsy home">
          <span className="brand-seal">S</span>
          <span><strong>SOMSY</strong><small>PRIVATE MOVEMENT RITUAL</small></span>
        </a>
        <p className="nav-date">{new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</p>
        <div className="nav-progress"><span>{completedDays.length}<i>/30</i></span><small>RITUALS</small></div>
      </nav>

      <section className="sanctum" id="home">
        <div className="sanctum-art" aria-hidden="true">
          <img className="sanctum-backdrop" src="/og.png" alt="" />
        </div>
        <div className="sanctum-vignette" />
        <div className="sanctum-copy">
          <p className="kicker"><span /> Today’s private ritual</p>
          <h1 className="sr-only">Somsy’s private movement ritual</h1>
          <div className="selected-ritual">
            <div className="ritual-day"><small>DAY</small><strong>{String(selectedDay).padStart(2, "0")}</strong></div>
            <div>
              <span>{selectedPlan.phase} · {selectedPlan.label}</span>
              <h2>{selectedPlan.title}</h2>
              <p>{selectedPlan.summary}</p>
            </div>
          </div>
          <button className="primary-button" type="button" onClick={startCheckin}>
            {selectedPlan.template === "rest" ? "Check in for rest day" : "Begin hands-free workout"} <span>→</span>
          </button>
        </div>

        <aside className="private-ledger">
          <div className="ledger-heading"><span>PRIVATE LEDGER</span><i>✦</i></div>
          <div className="ledger-weight">
            <div><small>LATEST WEIGHT</small><strong>{latestWeight !== null ? latestWeight.toFixed(1) : "—"}<i> kg</i></strong></div>
            <span className={weightChange !== null && weightChange <= 0 ? "down" : ""}>
              {weightChange === null ? "No trend yet" : `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg overall`}
            </span>
          </div>
          <WeightBars logs={logs} />
          <div className="ledger-stats">
            <div><strong>{completedDays.length}</strong><span>days complete</span></div>
            <div><strong>{streak}</strong><span>day streak</span></div>
            <div><strong>{logs.length}</strong><span>weigh-ins</span></div>
          </div>
          <p className="ledger-note">{loadingLogs ? "Opening your private log…" : dataError || "Your entries remain saved between visits."}</p>
        </aside>
      </section>

      <section className="ritual-strip" aria-label="Choose a workout day">
        <div className="strip-heading"><span>YOUR 30 DAYS</span><small>Choose any day</small></div>
        <div className="day-scroll">
          {dayPlans.map((day) => {
            const complete = completedDays.includes(day.day);
            return (
              <button
                type="button"
                key={day.day}
                className={`${selectedDay === day.day ? "selected" : ""} ${complete ? "complete" : ""}`}
                onClick={() => setSelectedDay(day.day)}
                aria-label={`Select day ${day.day}: ${day.label}`}
              >
                <span>{String(day.day).padStart(2, "0")}</span>
                <small>{complete ? "✓" : day.template === "rest" ? "rest" : day.label.split(" ")[0]}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="ritual-detail">
        <div className="detail-card">
          <div className="detail-topline"><span>TODAY’S COMPOSITION</span><small>{selectedPlan.duration ? `${selectedPlan.duration} minutes` : "recovery"}</small></div>
          <div className="detail-body">
            <div>
              <h2>{selectedPlan.label}</h2>
              <div className="structure">
                {selectedPlan.structure.map((item, index) => <span key={item}><i>0{index + 1}</i>{item}</span>)}
              </div>
            </div>
            <div className="detail-metrics">
              <span><small>EFFORT</small><strong>{selectedPlan.intensity}</strong></span>
              <span><small>DAILY MOVE</small><strong>{selectedPlan.movement}</strong></span>
            </div>
          </div>
        </div>

        <div className="history-card">
          <div className="detail-topline"><span>RECENT ENTRIES</span><small>weight + movement</small></div>
          <div className="history-list">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id}>
                <span>{friendlyDate(log.entryDate)}</span>
                <strong>{log.weightKg.toFixed(1)} kg</strong>
                <small>{log.completed ? `Day ${log.planDay} complete` : `Day ${log.planDay} check-in`}</small>
                <i className={log.completed ? "done" : ""}>{log.completed ? "✓" : "·"}</i>
              </div>
            ))}
            {!logs.length && <p>No entries yet. Begin with today’s ritual.</p>}
          </div>
        </div>
      </section>

      <footer><span>Somsy’s private space</span><i>✦</i><span>Move gently. Grow steadily.</span></footer>

      {checkinOpen && (
        <WeightCheckin
          day={selectedPlan}
          initialWeight={todayLog?.weightKg ?? latestWeight}
          saving={saving}
          error={dataError}
          onCancel={() => setCheckinOpen(false)}
          onSubmit={submitCheckin}
        />
      )}
      {runnerOpen && (
        <WorkoutRunner
          day={selectedPlan}
          onClose={() => setRunnerOpen(false)}
          onComplete={markComplete}
        />
      )}
    </main>
  );
}

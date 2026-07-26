import React from "react";
import { createRoot } from "react-dom/client";
import SomsyWorkout from "../../app/page";
import "../../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SomsyWorkout />
  </React.StrictMode>,
);

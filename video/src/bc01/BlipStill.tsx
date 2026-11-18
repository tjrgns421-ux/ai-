import React from "react";
import { AbsoluteFill } from "remotion";
import { PeupeuStage, PeupeuPose } from "../mascot/Prompt";

// Transparent Blip pose for pre-rendering to PNG (keeps 3D out of long renders).
export const BlipStill: React.FC<{ pose: PeupeuPose }> = ({ pose }) => (
  <AbsoluteFill>
    <PeupeuStage width={800} height={800} pose={pose} />
  </AbsoluteFill>
);

import React from "react";
import { AbsoluteFill } from "remotion";
import { HighwayCam, HighwayScene } from "./Highway3D";
export const CmHighwayTest: React.FC<{ cam: HighwayCam; ai: boolean; from: number }> = ({ cam, ai, from }) => (
  <AbsoluteFill>
    <HighwayScene cam={cam} ai={ai} from={from} />
  </AbsoluteFill>
);

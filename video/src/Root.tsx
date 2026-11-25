import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import { StyleFrame } from "./StyleFrames";
import { Ep01Opening, OPENING_DURATION } from "./ep01/Opening";
import { Ep01Full, EP01_DURATION } from "./ep01/Ep01";
import { Ep02Full, EP02_DURATION } from "./ep02/Ep02";
import { En01Full, EN01_DURATION } from "./en01/En01";
import { BlipAvatar, BlipAvatarKR, BlipBanner, BlipBannerKR } from "./brand/Brand";
import { CuriousStill, SproutStill } from "./mascot/Curious";
import { CmAvatar, CmBanner } from "./curious/Brand";
import { CM01_FRAMES, Cm01Full } from "./curious/Cm01";
import { CmEp01Thumb } from "./curious/Ep01Thumb";
import { CmRingPreview, RING_PREVIEW_FRAMES } from "./curious/RingSim";
import { CmRing3D, RING3D_FRAMES } from "./curious/Ring3D";
import { CALM3D_FRAMES, CmCalmRing3D } from "./curious/CalmRing3D";
import { CmHighwayTest } from "./curious/HighwayTest";
import { AMPLIFY_FRAMES, AmplifyScene, REACTION_FRAMES, ReactionScene } from "./curious/Closeups";
import { Bc01Board } from "./bc01/Board";
import { BlipStill } from "./bc01/BlipStill";
import { Bc01Full, BC01_DURATION } from "./bc01/Bc01";
import { Bc01Thumb } from "./bc01/Thumb";
import { Bc01ThumbV } from "./bc01/Thumbs2";
import { Sn01Full, SN01_DURATION } from "./sn01/Sn01";
import { Sn01Short, SN01S_DURATION } from "./sn01/Sn01Short";
import { Sn01Thumb } from "./sn01/Thumb";
import { Sn02Full, SN02_DURATION } from "./sn02/Sn02";
import { Sn02Short, SN02S_DURATION } from "./sn02/Sn02Short";
import { CmShort1, CMS1_FRAMES } from "./curious/CmShort1";
import { Cm02Test } from "./curious/Cm02Test";
import { Cm02Full, CM02_FRAMES } from "./curious/Cm02";
import { CmEp02Thumb } from "./curious/Ep02Thumb";
import { CmShort2, CMS2_FRAMES } from "./curious/CmShort2";
import { CmShort4, CMS4_FRAMES } from "./curious/CmShort4";
import { Cm03Test } from "./curious/Cm03Test";
import { Cm03Full, CM03_FRAMES } from "./curious/Cm03";
import { CmEp03Thumb } from "./curious/Ep03Thumb";
import { Cm04Test } from "./curious/Cm04Test";
import { Cm04Full, CM04_FRAMES } from "./curious/Cm04";
import { Cm05Full, CM05_FRAMES } from "./curious/Cm05";
import { CmEp04Thumb } from "./curious/Ep04Thumb";
import { CmEp05Thumb } from "./curious/Ep05Thumb";
import { Sn02Cover, Sn02Thumb } from "./sn02/Thumb";
import { Bc01Short, BC01S_DURATION } from "./bc01/Short";
import { Ci01Full, CI01_FRAMES } from "./ConfidenceInterval/ep01/Ep01";
import { Ci01Thumb } from "./ConfidenceInterval/ep01/Thumb";
import { MascotSheet } from "./mascot/Mascots";
import { PromptMascot } from "./mascot/Prompt";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="ConfidenceInterval">
        <Composition id="Ci01Full" component={Ci01Full} durationInFrames={CI01_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="Ci01Thumb" component={Ci01Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
      </Folder>
      <Folder name="Mascot">
        <Composition
          id="PromptMascot"
          component={PromptMascot}
          durationInFrames={90}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ variant: "terminal" as const, face: "prompt" as const, label: true }}
        />
        <Composition
          id="MascotSheet"
          component={MascotSheet}
          durationInFrames={60}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ concept: "cursor" as const, mood: "happy" as const }}
        />
      </Folder>
      <Folder name="Sn02">
        <Composition id="Sn02Thumb" component={Sn02Thumb} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{ v: "B" as const }} />
        <Composition id="Sn02Cover" component={Sn02Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="CmEp04Thumb" component={CmEp04Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
        <Composition id="CmEp05Thumb" component={CmEp05Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
        <Composition id="Cm04Full" component={Cm04Full} durationInFrames={CM04_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="Cm05Full" component={Cm05Full} durationInFrames={CM05_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="Cm04Test" component={Cm04Test} durationInFrames={40} fps={30} width={1920} height={1080} />
        <Composition id="CmEp03Thumb" component={CmEp03Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
        <Composition id="Cm03Full" component={Cm03Full} durationInFrames={CM03_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="Cm03Test" component={Cm03Test} durationInFrames={440} fps={30} width={1920} height={1080} />
        <Composition id="CmShort2" component={CmShort2} durationInFrames={CMS2_FRAMES} fps={30} width={1080} height={1920} />
        <Composition id="CmShort4" component={CmShort4} durationInFrames={CMS4_FRAMES} fps={30} width={1080} height={1920} />
        <Composition id="CmEp02Thumb" component={CmEp02Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
        <Composition id="Cm02Full" component={Cm02Full} durationInFrames={CM02_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="Cm02Test" component={Cm02Test} durationInFrames={40} fps={30} width={1920} height={1080} />
        <Composition id="CmShort1" component={CmShort1} durationInFrames={CMS1_FRAMES} fps={30} width={1080} height={1920} />
        <Composition id="Sn02Short" component={Sn02Short} durationInFrames={SN02S_DURATION} fps={30} width={1080} height={1920} />
        <Composition id="Sn02Full" component={Sn02Full} durationInFrames={SN02_DURATION} fps={30} width={1920} height={1080} />
      </Folder>
      <Folder name="Sn01">
        <Composition id="Sn01Thumb" component={Sn01Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
        <Composition id="Sn01Short" component={Sn01Short} durationInFrames={SN01S_DURATION} fps={30} width={1080} height={1920} />
        <Composition id="Sn01Full" component={Sn01Full} durationInFrames={SN01_DURATION} fps={30} width={1920} height={1080} />
      </Folder>
      <Folder name="Bc01">
        <Composition id="Bc01ThumbV" component={Bc01ThumbV} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{ v: "A" as const }} />
        <Composition id="Bc01Short" component={Bc01Short} durationInFrames={BC01S_DURATION} fps={30} width={1080} height={1920} />
        <Composition id="Bc01Thumb" component={Bc01Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
        <Composition id="Bc01Full" component={Bc01Full} durationInFrames={BC01_DURATION} fps={30} width={1920} height={1080} />
        <Composition id="Bc01Board" component={Bc01Board} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ frame: 1 }} />
        <Composition id="BlipStill" component={BlipStill} durationInFrames={1} fps={30} width={800} height={800} defaultProps={{ pose: { face: "prompt" as const } }} />
      </Folder>
      <Folder name="Brand">
        <Composition id="CmAmplify" component={AmplifyScene} durationInFrames={AMPLIFY_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="CmReaction" component={ReactionScene} durationInFrames={REACTION_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="CmHighwayTest" component={CmHighwayTest} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ cam: "dolly" as const, ai: false, from: 40 }} />
        <Composition id="CmCalmRing3D" component={CmCalmRing3D} durationInFrames={CALM3D_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="CmRing3D" component={CmRing3D} durationInFrames={RING3D_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="CmRingPreview" component={CmRingPreview} durationInFrames={RING_PREVIEW_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="CmEp01Thumb" component={CmEp01Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
        <Composition id="SproutStill" component={SproutStill} durationInFrames={1} fps={30} width={800} height={800} defaultProps={{ pose: { face: "happy" as const } }} />
        <Composition id="CuriousStill" component={CuriousStill} durationInFrames={1} fps={30} width={800} height={800} defaultProps={{ v: "orbi" as const }} />
        <Composition id="Cm01Full" component={Cm01Full} durationInFrames={CM01_FRAMES} fps={30} width={1920} height={1080} />
        <Composition id="CmAvatar" component={CmAvatar} durationInFrames={1} fps={30} width={800} height={800} />
        <Composition id="CmBanner" component={CmBanner} durationInFrames={1} fps={30} width={2560} height={1440} />
        <Composition id="BlipAvatar" component={BlipAvatar} durationInFrames={1} fps={30} width={800} height={800} />
        <Composition id="BlipAvatarKR" component={BlipAvatarKR} durationInFrames={1} fps={30} width={800} height={800} defaultProps={{ v: "A" as const }} />
        <Composition id="BlipBannerKR" component={BlipBannerKR} durationInFrames={1} fps={30} width={2560} height={1440} />
        <Composition id="BlipBanner" component={BlipBanner} durationInFrames={1} fps={30} width={2560} height={1440} />
      </Folder>
      <Folder name="En01">
        <Composition id="En01Full" component={En01Full} durationInFrames={EN01_DURATION} fps={30} width={1080} height={1920} />
      </Folder>
      <Folder name="Ep02">
        <Composition id="Ep02Full" component={Ep02Full} durationInFrames={EP02_DURATION} fps={30} width={1080} height={1920} />
      </Folder>
      <Folder name="Ep01">
        <Composition
          id="Ep01Full"
          component={Ep01Full}
          durationInFrames={EP01_DURATION}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="Ep01Opening"
          component={Ep01Opening}
          durationInFrames={OPENING_DURATION}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="StyleFrame"
          component={StyleFrame}
          durationInFrames={1}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ look: "editorial" as const, scene: "hook" as const }}
        />
      </Folder>
      <Folder name="Elements">
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
      <Composition
        // You can take the "id" to render a video:
        // bunx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
        }}
      />

    </>
  );
};

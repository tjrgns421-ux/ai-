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
import { CuriousStill } from "./mascot/Curious";
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
import { Sn02Cover, Sn02Thumb } from "./sn02/Thumb";
import { Bc01Short, BC01S_DURATION } from "./bc01/Short";
import { MascotSheet } from "./mascot/Mascots";
import { PromptMascot } from "./mascot/Prompt";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
        <Composition id="CuriousStill" component={CuriousStill} durationInFrames={1} fps={30} width={800} height={800} defaultProps={{ v: "orbi" as const }} />
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

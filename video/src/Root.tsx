import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import { StyleFrame } from "./StyleFrames";
import { Ep01Opening, OPENING_DURATION } from "./ep01/Opening";
import { Ep01Full, EP01_DURATION } from "./ep01/Ep01";
import { Ep02Full, EP02_DURATION } from "./ep02/Ep02";
import { En01Full, EN01_DURATION } from "./en01/En01";
import { BlipAvatar, BlipBanner } from "./brand/Brand";
import { Bc01Board } from "./bc01/Board";
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
      <Folder name="Bc01">
        <Composition id="Bc01Board" component={Bc01Board} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ frame: 1 }} />
      </Folder>
      <Folder name="Brand">
        <Composition id="BlipAvatar" component={BlipAvatar} durationInFrames={1} fps={30} width={800} height={800} />
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

import DefaultCircleLoader from "@/components/Utilities/Loaders/DefaultCircleLoader";
import dynamic from "next/dynamic";
import Head from "next/head";
const Render3DScene = dynamic(
  () => import("@/components/Babylonjs/Render3DScene"),
  {
    ssr: false,
    loading: () => <DefaultCircleLoader />,
  }
);

export default function Home() {
  return (
    <>
      <Head>
        <title>3D Renderer</title>
      </Head>
      <Render3DScene />;
    </>
  );
}

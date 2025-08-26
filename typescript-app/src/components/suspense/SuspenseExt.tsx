import { Suspense, ReactNode } from "react";
import Loading from "../Loading";

interface SuspenseExtProps {
  body: ReactNode;
}

const SuspenseExt = ({ body }: SuspenseExtProps) => {
  return <Suspense fallback={<Loading />}>{body}</Suspense>;
};

export default SuspenseExt;

import { useContext } from "react";

import { SocketContext, SocketContextValue, HilmaSocket } from "../";

const useSocket = (): HilmaSocket => useContext<SocketContextValue>(SocketContext)!;

export default useSocket;
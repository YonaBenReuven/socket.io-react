import { useContext } from "react";
import { SocketContext } from "../";
import { SocketContextValue, ExtendedSocket } from "../SocketProvider";

const useSocket = (): ExtendedSocket => useContext<SocketContextValue>(SocketContext)!;

export default useSocket;
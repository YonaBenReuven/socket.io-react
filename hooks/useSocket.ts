import { useContext } from "react";
import { SocketContext } from "../";
import { SocketContextValue } from "../SocketProvider";

const useSocket = (): SocketIOClient.Socket => useContext<SocketContextValue>(SocketContext)!;

export default useSocket;
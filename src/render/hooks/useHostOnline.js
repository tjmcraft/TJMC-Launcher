import useGlobal from "./useGlobal";

const useHostOnline = () => useGlobal(global => global.hostConnectionState == "connectionStateReady");

export default useHostOnline;
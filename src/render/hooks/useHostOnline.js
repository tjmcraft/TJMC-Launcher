import useGlobal from "./useGlobal";

const useHostOnline = () => {
	return useGlobal(global => global.hostConnectionState) == "connectionStateReady";
};

export default useHostOnline;
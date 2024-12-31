import { create } from "zustand";

interface WebSocketStore {
  connected: boolean;
  setConnected: (connected: boolean) => void;
  uuid: string | null;
  setUuid: (uuid: string | null) => void;
  targetPeerId: string | null;
  setTargetPeerId: (targetPeerId: string | null) => void;
  wsRef: React.RefObject<WebSocket | null>;
  setWsRef: (wsRef: WebSocket | null) => void;
  pcRef: React.RefObject<RTCPeerConnection | null>;
  setPcRef: (pcRef: RTCPeerConnection | null) => void;
  dataChannelRef: React.RefObject<RTCDataChannel | null>;
  setDataChannelRef: (dataChannelRef: RTCDataChannel | null) => void;
}

export const useWebSocketStore = create<WebSocketStore>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),
  uuid: null,
  setUuid: (uuid) => set({ uuid }),
  targetPeerId: null,
  setTargetPeerId: (targetPeerId) => set({ targetPeerId }),
  wsRef: { current: null },
  setWsRef: (wsRef) => set({ wsRef: { current: wsRef } }),
  pcRef: { current: null },
  setPcRef: (pcRef) => set({ pcRef: { current: pcRef } }),
  dataChannelRef: { current: null },
  setDataChannelRef: (dataChannelRef) =>
    set({ dataChannelRef: { current: dataChannelRef } }),
}));

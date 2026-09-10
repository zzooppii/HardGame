import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';

export interface LobbyPlayer {
  peerId: string;
  name: string;
  isHost: boolean;
  assignedPlayerId: string;
}

export type NetworkMessageType = 
  | 'JOIN_REQUEST'
  | 'LOBBY_UPDATE'
  | 'START_GAME'
  | 'GAME_ACTION'
  | 'STATE_SYNC'
  | 'CHAT_MESSAGE';

export interface NetworkMessage {
  type: NetworkMessageType;
  payload: any;
  senderId: string;
}

class PeerNetworkManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  public isHost: boolean = false;
  public roomCode: string | null = null;
  public myPeerId: string | null = null;
  public myName: string = '플레이어';

  // 콜백 핸들러들
  public onLobbyUpdate?: (players: LobbyPlayer[], roomCode: string) => void;
  public onGameStart?: (initialState: any, myAssignedPlayerId: string) => void;
  public onActionReceived?: (actionName: string, payload: any, senderPlayerId: string) => void;
  public onStateSync?: (syncedState: any) => void;
  public onPlayerDisconnected?: (peerId: string) => void;

  /**
   * 6자리 방 코드 생성
   */
  generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * 호스트: 방 생성
   */
  createRoom(hostName: string, onReady: (roomCode: string) => void, onError: (err: any) => void) {
    this.isHost = true;
    this.myName = hostName;
    const code = this.generateRoomCode();
    this.roomCode = code;
    const peerId = `euromaster-pr-${code.toLowerCase()}`;

    if (this.peer) {
      this.peer.destroy();
    }

    this.peer = new Peer(peerId, {
      debug: 1
    });

    this.peer.on('open', (id) => {
      this.myPeerId = id;
      onReady(code);
    });

    this.peer.on('connection', (conn) => {
      this.handleIncomingConnection(conn);
    });

    this.peer.on('error', (err) => {
      console.error('PeerJS Host Error:', err);
      onError(err);
    });
  }

  /**
   * 게스트: 방 참가
   */
  joinRoom(roomCode: string, guestName: string, onConnected: () => void, onError: (err: any) => void) {
    this.isHost = false;
    this.myName = guestName;
    this.roomCode = roomCode.toUpperCase().trim();
    const targetHostPeerId = `euromaster-pr-${this.roomCode.toLowerCase()}`;

    if (this.peer) {
      this.peer.destroy();
    }

    this.peer = new Peer({
      debug: 1
    });

    this.peer.on('open', (myId) => {
      this.myPeerId = myId;
      if (!this.peer) return;

      const conn = this.peer.connect(targetHostPeerId, {
        reliable: true
      });

      conn.on('open', () => {
        this.hostConnection = conn;
        this.setupConnectionListeners(conn);
        // 호스트에게 참가 요청 전송
        this.sendToHost({
          type: 'JOIN_REQUEST',
          payload: { name: this.myName, peerId: myId },
          senderId: myId
        });
        onConnected();
      });

      conn.on('error', (err) => {
        console.error('PeerJS Connection Error:', err);
        onError(err);
      });
    });

    this.peer.on('error', (err) => {
      console.error('PeerJS Guest Error:', err);
      onError(err);
    });
  }

  /**
   * 호스트: 새 게스트 연결 처리
   */
  private handleIncomingConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      this.setupConnectionListeners(conn);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      if (this.onPlayerDisconnected) {
        this.onPlayerDisconnected(conn.peer);
      }
    });
  }

  /**
   * 메시지 수신 리스너 등록
   */
  private setupConnectionListeners(conn: DataConnection) {
    conn.on('data', (data: any) => {
      const msg = data as NetworkMessage;
      this.handleMessage(msg, conn);
    });
  }

  /**
   * 메시지 라우팅 처리
   */
  private handleMessage(msg: NetworkMessage, _conn: DataConnection) {
    switch (msg.type) {
      case 'JOIN_REQUEST':
        if (this.isHost && this.onActionReceived) {
          // 호스트가 참가자 처리
          this.onActionReceived('JOIN_REQUEST', msg.payload, msg.senderId);
        }
        break;

      case 'LOBBY_UPDATE':
        if (this.onLobbyUpdate) {
          this.onLobbyUpdate(msg.payload.players, msg.payload.roomCode);
        }
        break;

      case 'START_GAME':
        if (this.onGameStart) {
          this.onGameStart(msg.payload.initialState, msg.payload.myAssignedPlayerId);
        }
        break;

      case 'GAME_ACTION':
        if (this.isHost && this.onActionReceived) {
          // 호스트가 게스트의 액션을 받아서 게임 스토어에 반영 후 브로드캐스트
          this.onActionReceived(msg.payload.actionName, msg.payload.args, msg.payload.senderPlayerId);
        }
        break;

      case 'STATE_SYNC':
        if (this.onStateSync) {
          this.onStateSync(msg.payload.gameState);
        }
        break;
    }
  }

  /**
   * 호스트 -> 전체 참가자에게 브로드캐스트
   */
  broadcast(msg: NetworkMessage) {
    this.connections.forEach(conn => {
      if (conn.open) {
        conn.send(msg);
      }
    });
  }

  /**
   * 특정 클라이언트에게 전송
   */
  sendToClient(peerId: string, msg: NetworkMessage) {
    const conn = this.connections.get(peerId);
    if (conn && conn.open) {
      conn.send(msg);
    }
  }

  /**
   * 게스트 -> 호스트에게 메시지 전송
   */
  sendToHost(msg: NetworkMessage) {
    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(msg);
    }
  }

  /**
   * 게임 상태 전체 동기화 (호스트 전용)
   */
  broadcastStateSync(gameState: any) {
    if (!this.isHost) return;
    this.broadcast({
      type: 'STATE_SYNC',
      payload: { gameState },
      senderId: this.myPeerId || 'host'
    });
  }

  /**
   * 게스트가 호스트에게 액션 요청 전송
   */
  sendActionToHost(actionName: string, args: any, senderPlayerId: string) {
    if (this.isHost) {
      // 호스트 자신이면 바로 로컬 처리
      return;
    }
    this.sendToHost({
      type: 'GAME_ACTION',
      payload: { actionName, args, senderPlayerId },
      senderId: this.myPeerId || 'guest'
    });
  }

  /**
   * 방 나가기 / 연결 해제
   */
  leaveRoom() {
    this.connections.forEach(c => c.close());
    this.connections.clear();
    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.roomCode = null;
    this.isHost = false;
  }
}

export const peerManager = new PeerNetworkManager();

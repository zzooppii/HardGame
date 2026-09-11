import React, { useState, useEffect } from 'react';
import { peerManager } from '../network/peerManager';
import type { LobbyPlayer } from '../network/peerManager';
import { usePuertoRicoStore, getSerializableGameState } from '../../games/puerto-rico/store/usePuertoRicoStore';
import { useBurgundyStore, getSerializableBurgundyState } from '../../games/burgundy/store/useBurgundyStore';
import { useLeHavreStore, getSerializableLeHavreState } from '../../games/le-havre/store/useLeHavreStore';
import { useCavernaStore } from '../../games/caverna/store/useCavernaStore';
import { Users, Bot, Globe, Copy, Check, Play, UserCheck, Loader2 } from 'lucide-react';

interface GameSetupModalProps {
  gameTitle: string;
  onClose: () => void;
  onStartGame: () => void;
}

export const GameSetupModal: React.FC<GameSetupModalProps> = ({
  gameTitle,
  onClose,
  onStartGame
}) => {
  const { initGame, initOnlineGame, syncRemoteState } = usePuertoRicoStore();
  const [activeTab, setActiveTab] = useState<'solo' | 'local' | 'online'>('solo');

  // 솔로 / 로컬 모드 옵션
  const [playerCount, setPlayerCount] = useState<number>(
    gameTitle === '버건디의 성' || gameTitle === '르아브르' ? 2 : 3
  );

  // 온라인 모드 옵션
  const [onlineSubTab, setOnlineSubTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState<string>(
    gameTitle.includes('카베르나')
      ? '드워프 족장'
      : (gameTitle === '르아브르' 
          ? '노르망디 선주' 
          : (gameTitle === '버건디의 성' ? '버건디 영주' : '카리브 모험가'))
  );
  const [inputRoomCode, setInputRoomCode] = useState<string>('');
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [isInWaitingRoom, setIsInWaitingRoom] = useState<boolean>(false);

  // URL 파라미터에서 방 코드 감지
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl) {
      setActiveTab('online');
      setOnlineSubTab('join');
      setInputRoomCode(roomFromUrl.toUpperCase());
    }
  }, []);

  // 네트워크 이벤트 리스너 설정
  useEffect(() => {
    peerManager.onLobbyUpdate = (players, code) => {
      setLobbyPlayers(players);
      setCreatedRoomCode(code);
    };

    peerManager.onGameStart = (initialState, myAssignedPlayerId) => {
      if (gameTitle === '르아브르') {
        useLeHavreStore.getState().syncRemoteState(initialState);
        useLeHavreStore.setState({
          playMode: 'online',
          myPlayerId: myAssignedPlayerId,
          isHost: false,
          roomCode: createdRoomCode || inputRoomCode
        });
        onStartGame();
        return;
      }

      if (gameTitle === '버건디의 성') {
        useBurgundyStore.getState().syncRemoteState(initialState);
        useBurgundyStore.setState({
          playMode: 'online',
          myPlayerId: myAssignedPlayerId,
          isHost: false,
          roomCode: createdRoomCode || inputRoomCode
        });
        onStartGame();
        return;
      }

      syncRemoteState(initialState);
      usePuertoRicoStore.setState({
        playMode: 'online',
        myPlayerId: myAssignedPlayerId,
        isHost: false,
        roomCode: createdRoomCode || inputRoomCode
      });
      onStartGame();
    };

    peerManager.onActionReceived = (actionName, payload, _senderPlayerId) => {
      if (!peerManager.isHost) return;

      if (actionName === 'JOIN_REQUEST') {
        const currentLobby = [...lobbyPlayers];
        if (currentLobby.length < playerCount) {
          const newPlayer: LobbyPlayer = {
            peerId: payload.peerId,
            name: payload.name || `플레이어 ${currentLobby.length + 1}`,
            isHost: false,
            assignedPlayerId: `p-${currentLobby.length}`
          };
          const updatedLobby = [...currentLobby, newPlayer];
          setLobbyPlayers(updatedLobby);
          peerManager.broadcast({
            type: 'LOBBY_UPDATE',
            payload: { players: updatedLobby, roomCode: createdRoomCode },
            senderId: peerManager.myPeerId || 'host'
          });
        }
        return;
      }

      // 르아브르 게스트 액션 수신 처리
      if (gameTitle === '르아브르') {
        const store = useLeHavreStore.getState();
        const actionFn = (store as any)[actionName];
        if (typeof actionFn === 'function') {
          if (actionName === 'takeDockAction') {
            actionFn(payload.dockId);
          } else if (actionName === 'enterBuildingAction') {
            actionFn(payload.buildingId, payload.actionDetail);
          } else if (actionName === 'buyBuildingWithCash') {
            actionFn(payload.buildingId);
          } else if (actionName === 'repayLoanAction') {
            actionFn();
          } else {
            actionFn();
          }
        }
        return;
      }

      // 버건디의 성 게스트 액션 수신 처리
      if (gameTitle === '버건디의 성') {
        const store = useBurgundyStore.getState();
        const actionFn = (store as any)[actionName];
        if (typeof actionFn === 'function') {
          if (actionName === 'takeTileFromDepot') {
            if (payload.selectedDieIndex !== undefined) store.selectDie(payload.selectedDieIndex);
            actionFn(payload.depotNumber, payload.tileId);
          } else if (actionName === 'placeTileFromStorage') {
            if (payload.selectedDieIndex !== undefined) store.selectDie(payload.selectedDieIndex);
            if (payload.selectedKeySlotIndex !== undefined) store.selectKeySlot(payload.selectedKeySlotIndex);
            actionFn(payload.slotId);
          } else if (actionName === 'sellGoodsAction') {
            if (payload.selectedDieIndex !== undefined) store.selectDie(payload.selectedDieIndex);
            actionFn(payload.goodsDieNumber);
          } else if (actionName === 'takeWorkersAction') {
            if (payload.selectedDieIndex !== undefined) store.selectDie(payload.selectedDieIndex);
            actionFn();
          } else if (actionName === 'buyFromBlackMarket') {
            actionFn(payload.tileId);
          } else if (actionName === 'adjustDieWithWorker') {
            actionFn(payload.dieIndex, payload.delta);
          } else {
            actionFn();
          }
        }
        return;
      }

      // 푸에르토리코 게스트 액션 수신 처리
      const store = usePuertoRicoStore.getState();
      const actionFn = (store as any)[actionName];
      if (typeof actionFn === 'function') {
        if (payload.role !== undefined) actionFn(payload.role);
        else if (payload.plantationType !== undefined) actionFn(payload.plantationType);
        else if (payload.assignments !== undefined) actionFn(payload.assignments);
        else if (payload.buildingId !== undefined) actionFn(payload.buildingId);
        else if (payload.bonusGood !== undefined) actionFn(payload.bonusGood);
        else if (payload.goodType !== undefined && payload.shipIndex === undefined) actionFn(payload.goodType);
        else if (payload.shipIndex !== undefined) actionFn(payload.shipIndex, payload.goodType);
        else actionFn();
      }
    };

    peerManager.onStateSync = (syncedState) => {
      if (gameTitle === '르아브르') {
        useLeHavreStore.getState().syncRemoteState(syncedState);
        return;
      }
      if (gameTitle === '버건디의 성') {
        useBurgundyStore.getState().syncRemoteState(syncedState);
        return;
      }
      syncRemoteState(syncedState);
    };

    return () => {
      // 컴포넌트 언마운트 시 콜백 정리
    };
  }, [lobbyPlayers, playerCount, createdRoomCode, inputRoomCode, gameTitle]);

  // 호스트: 방 만들기 실행
  const handleCreateRoom = () => {
    setIsConnecting(true);
    setOnlineError(null);

    const gamePrefix = gameTitle === '르아브르' ? 'lehavre' : (gameTitle === '버건디의 성' ? 'burgundy' : 'pr');

    peerManager.createRoom(
      playerName,
      (code) => {
        setIsConnecting(false);
        setCreatedRoomCode(code);
        setIsInWaitingRoom(true);
        const hostPlayer: LobbyPlayer = {
          peerId: peerManager.myPeerId || 'host',
          name: playerName,
          isHost: true,
          assignedPlayerId: 'p-0'
        };
        setLobbyPlayers([hostPlayer]);
      },
      (err) => {
        setIsConnecting(false);
        setOnlineError('방 생성에 실패했습니다: ' + (err.message || '네트워크 오류'));
      },
      gamePrefix
    );
  };

  // 게스트: 방 참가하기 실행
  const handleJoinRoom = () => {
    if (!inputRoomCode.trim()) {
      setOnlineError('방 코드를 입력해주세요.');
      return;
    }

    setIsConnecting(true);
    setOnlineError(null);

    const gamePrefix = gameTitle === '르아브르' ? 'lehavre' : (gameTitle === '버건디의 성' ? 'burgundy' : 'pr');

    peerManager.joinRoom(
      inputRoomCode,
      playerName,
      () => {
        setIsConnecting(false);
        setIsInWaitingRoom(true);
      },
      (_err) => {
        setIsConnecting(false);
        setOnlineError('방 참가에 실패했습니다. 방 코드를 확인해주세요.');
      },
      gamePrefix
    );
  };

  // 호스트: 온라인 게임 시작
  const handleStartOnlineGame = () => {
    try {
      const roomCode = createdRoomCode || inputRoomCode;
      if (!roomCode) {
        console.error('방 코드가 존재하지 않습니다.');
        return;
      }

      const humanPlayers = lobbyPlayers.map(p => ({
        name: p.name,
        peerId: p.peerId
      }));

      if (gameTitle === '르아브르') {
        useLeHavreStore.getState().initOnlineGame(playerCount, humanPlayers, roomCode, 'p-0', true);
        const pureInitialState = getSerializableLeHavreState(useLeHavreStore.getState());

        peerManager.broadcast({
          type: 'START_GAME',
          payload: {
            initialState: pureInitialState,
            playerMappings: lobbyPlayers.map(p => ({
              peerId: p.peerId,
              assignedPlayerId: p.assignedPlayerId
            }))
          },
          senderId: peerManager.myPeerId || 'host'
        });

        onStartGame();
        return;
      }

      if (gameTitle === '버건디의 성') {
        useBurgundyStore.getState().initOnlineGame(playerCount, humanPlayers, roomCode, 'p-0', true);
        const pureInitialState = getSerializableBurgundyState(useBurgundyStore.getState());

        peerManager.broadcast({
          type: 'START_GAME',
          payload: {
            initialState: pureInitialState,
            playerMappings: lobbyPlayers.map(p => ({
              peerId: p.peerId,
              assignedPlayerId: p.assignedPlayerId
            }))
          },
          senderId: peerManager.myPeerId || 'host'
        });

        onStartGame();
        return;
      }

      initOnlineGame(playerCount, humanPlayers, roomCode, 'p-0', true);

      // WebRTC로 전송 가능한 순수 JSON 상태 추출 (함수 제외)
      const pureInitialState = getSerializableGameState(usePuertoRicoStore.getState());

      // 전체 참가자들에게 시작 알림 및 초기 상태 전송
      peerManager.broadcast({
        type: 'START_GAME',
        payload: {
          initialState: pureInitialState,
          playerMappings: lobbyPlayers.map(p => ({
            peerId: p.peerId,
            assignedPlayerId: p.assignedPlayerId
          }))
        },
        senderId: peerManager.myPeerId || 'host'
      });

      onStartGame();
    } catch (err) {
      console.error('온라인 게임 시작 중 오류:', err);
      // 오류가 발생하더라도 호스트 화면은 진입
      onStartGame();
    }
  };

  // 링크 복사 (localhost인 경우 실제 접속 가능한 로컬 네트워크 IP 반영)
  const getShareableUrl = (code: string) => {
    let host = window.location.host;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // 로컬 네트워크 IP 우선 반영 (현재 공유기 할당 IP: 192.168.0.18)
      host = `192.168.0.18:${window.location.port || '5173'}`;
    }
    return `${window.location.protocol}//${host}${window.location.pathname}?room=${code}`;
  };

  const handleCopyLink = () => {
    const code = createdRoomCode || inputRoomCode;
    const url = getShareableUrl(code);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const handleCopyCodeOnly = () => {
    const code = createdRoomCode || inputRoomCode;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // 솔로 / 로컬 시작
  const handleStartSoloOrLocal = () => {
    if (gameTitle.includes('카베르나')) {
      useCavernaStore.getState().initGame(playerCount, activeTab === 'solo');
    } else if (gameTitle === '르아브르') {
      useLeHavreStore.getState().initGame(playerCount, activeTab === 'solo');
    } else if (gameTitle === '버건디의 성') {
      useBurgundyStore.getState().initGame(playerCount, activeTab === 'solo');
    } else {
      initGame(playerCount, activeTab === 'solo');
    }
    onStartGame();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 250,
      padding: '20px'
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '640px',
          padding: '28px',
          background: 'linear-gradient(145deg, #192132 0%, #0d1422 100%)',
          border: '1.5px solid var(--amber-border-bright)'
        }}
      >
        {/* 모달 상단 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--gold-secondary)', fontWeight: 600 }}>게임 모드 선택</span>
            <h2 className="font-serif text-gold-gradient" style={{ margin: '4px 0 0 0', fontSize: '1.5rem' }}>
              {gameTitle} 플레이 설정
            </h2>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '6px 12px' }}>
            ✕
          </button>
        </div>

        {/* 대기실 상태가 아닐 때: 모드 선택 탭 */}
        {!isInWaitingRoom ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
              <button
                onClick={() => setActiveTab('solo')}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: activeTab === 'solo' ? 'rgba(229, 169, 60, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: activeTab === 'solo' ? '1.5px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                  color: activeTab === 'solo' ? '#f8fafc' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Bot size={22} color={activeTab === 'solo' ? 'var(--gold-secondary)' : '#94a3b8'} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>솔로 vs AI</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>혼자서 봇들과 대전</span>
              </button>

              <button
                onClick={() => setActiveTab('local')}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: activeTab === 'local' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: activeTab === 'local' ? '1.5px solid #38bdf8' : '1px solid var(--border-subtle)',
                  color: activeTab === 'local' ? '#f8fafc' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Users size={22} color={activeTab === 'local' ? '#38bdf8' : '#94a3b8'} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>로컬 다인</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>한 화면에서 교대</span>
              </button>

              <button
                onClick={() => setActiveTab('online')}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: activeTab === 'online' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: activeTab === 'online' ? '1.5px solid #c084fc' : '1px solid var(--border-subtle)',
                  color: activeTab === 'online' ? '#f8fafc' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Globe size={22} color={activeTab === 'online' ? '#c084fc' : '#94a3b8'} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>온라인 멀티</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>링크/방 코드로 대전</span>
              </button>
            </div>

            {/* 1) 솔로 또는 로컬 탭 내용 */}
            {(activeTab === 'solo' || activeTab === 'local') && (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    플레이 인원 수 선택
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[2, 3, 4].map(count => (
                      <button
                        key={count}
                        onClick={() => setPlayerCount(count)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '8px',
                          background: playerCount === count ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.05)',
                          color: playerCount === count ? '#1a1003' : '#f8fafc',
                          border: playerCount === count ? '1px solid var(--gold-secondary)' : '1px solid var(--border-subtle)',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {count}인 플레이
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
                  <button className="btn-gold" onClick={handleStartSoloOrLocal} style={{ width: '100%', padding: '14px' }}>
                    <Play size={18} fill="#1a1003" /> {activeTab === 'solo' ? '솔로 게임 시작' : '로컬 다인 게임 시작'}
                  </button>
                </div>
              </div>
            )}

            {/* 2) 온라인 실시간 멀티 탭 내용 */}
            {activeTab === 'online' && (
              <div>
                {/* 닉네임 입력 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    나의 닉네임
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="닉네임 입력"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* 방 만들기 vs 방 참가하기 서브 탭 */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button
                    onClick={() => setOnlineSubTab('create')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      background: onlineSubTab === 'create' ? '#7c3aed' : 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    방 만들기 (Host)
                  </button>
                  <button
                    onClick={() => setOnlineSubTab('join')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      background: onlineSubTab === 'join' ? '#2563eb' : 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    방 참가하기 (Join)
                  </button>
                </div>

                {onlineSubTab === 'create' ? (
                  <div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        목표 인원수
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[2, 3, 4].map(c => (
                          <button
                            key={c}
                            onClick={() => setPlayerCount(c)}
                            style={{
                              flex: 1,
                              padding: '8px',
                              borderRadius: '6px',
                              background: playerCount === c ? '#a855f7' : 'rgba(255,255,255,0.05)',
                              color: '#fff',
                              border: '1px solid rgba(255,255,255,0.1)',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            {c}인
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      className="btn-gold"
                      onClick={handleCreateRoom}
                      disabled={isConnecting}
                      style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                    >
                      {isConnecting ? <Loader2 className="animate-spin" size={18} /> : <Globe size={18} />}
                      방 개설하기
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        방 코드 (5자리 영숫자)
                      </label>
                      <input
                        type="text"
                        value={inputRoomCode}
                        onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                        placeholder="예: PR-7A3F"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          letterSpacing: '2px',
                          textTransform: 'uppercase'
                        }}
                      />
                    </div>

                    <button
                      className="btn-gold"
                      onClick={handleJoinRoom}
                      disabled={isConnecting || !inputRoomCode.trim()}
                      style={{ width: '100%', padding: '12px' }}
                    >
                      {isConnecting ? <Loader2 className="animate-spin" size={18} /> : <UserCheck size={18} />}
                      방 참가하기
                    </button>
                  </div>
                )}

                {onlineError && (
                  <div style={{ marginTop: '12px', color: '#f87171', fontSize: '0.82rem', textAlign: 'center' }}>
                    {onlineError}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* 온라인 대기실 뷰 (Waiting Room) */
          <div>
            <div style={{
              background: 'rgba(0,0,0,0.35)',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid var(--amber-border)',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>방 코드</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-secondary)', letterSpacing: '3px', margin: '4px 0' }}>
                {createdRoomCode || inputRoomCode}
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                <button
                  className="btn-secondary"
                  onClick={handleCopyCodeOnly}
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  {copiedCode ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                  {copiedCode ? '방 코드 복사됨!' : '방 코드만 복사'}
                </button>
                <button
                  className="btn-gold"
                  onClick={handleCopyLink}
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  {copiedLink ? <Check size={14} color="#166534" /> : <Copy size={14} />}
                  {copiedLink ? '링크 복사됨!' : '초대 링크 복사'}
                </button>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                💡 같은 Wi-Fi에 연결된 스마트폰이나 PC에서 링크를 열면 즉시 접속됩니다!
              </div>
            </div>

            {/* 현재 참가자 목록 */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>
                  참가자 목록 ({lobbyPlayers.length}/{playerCount}명)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {peerManager.isHost ? '방장' : '참가자'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lobbyPlayers.map((lp, idx) => (
                  <div
                    key={lp.peerId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: idx === 0 ? 'var(--gold-primary)' : '#38bdf8' }}>
                        P{idx + 1}
                      </span>
                      <span style={{ fontWeight: 600 }}>{lp.name}</span>
                    </div>
                    {lp.isHost && (
                      <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>방장 (Host)</span>
                    )}
                  </div>
                ))}

                {/* 빈 슬롯 표시 */}
                {Array.from({ length: Math.max(0, playerCount - lobbyPlayers.length) }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px dashed rgba(255,255,255,0.15)',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>빈 슬롯 (플레이어 대기 중...)</span>
                    <span style={{ fontSize: '0.75rem' }}>시작 시 AI로 대체 가능</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 하단 시작 버튼 (호스트만 가능) */}
            {peerManager.isHost ? (
              <button
                className="btn-gold"
                onClick={handleStartOnlineGame}
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              >
                <Play size={18} fill="#1a1003" /> 멀티플레이 대전 시작하기
              </button>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                방장이 게임을 시작할 때까지 대기 중입니다...
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

type FeedbackListener = (item: { id: string; text: string; x: number; y: number }) => void;

let listeners: FeedbackListener[] = [];

export const subscribeFeedback = (listener: FeedbackListener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

export const showFeedback = (text: string, x?: number, y?: number) => {
  const defaultX = typeof window !== 'undefined' ? window.innerWidth / 2 : 300;
  const defaultY = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;
  const item = {
    id: Math.random().toString(36).substring(2, 9),
    text,
    x: x ?? defaultX,
    y: y ?? defaultY
  };
  listeners.forEach(l => l(item));
};

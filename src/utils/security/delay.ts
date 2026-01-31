export const addRandomDelay = async (minMs: number = 1000, maxMs: number = 5000): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

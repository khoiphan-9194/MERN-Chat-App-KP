export const isSameSender = (messages, currentMessage, index, userId) => {
  if (index >= messages.length - 1) return false;

  const nextSenderId = messages[index + 1]?.sender?._id;
  const currentSenderId = currentMessage?.sender?._id;

  return nextSenderId !== currentSenderId && nextSenderId !== undefined;
};

export const isLastMessage = (messages, index, userId) => {
  if (index !== messages.length - 1) return false;

  const lastSenderId = messages[messages.length - 1]?.sender?._id;

  return lastSenderId !== userId && lastSenderId !== undefined;
};

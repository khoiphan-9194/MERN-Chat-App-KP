export const isSameSender = (messages, currentMessage, index) => {
  if (index >= messages.length - 1) return false;

  const nextSenderId = messages[index + 1]?.message_sender?._id;
  const currentSenderId = currentMessage?.message_sender?._id;

  return nextSenderId !== currentSenderId && nextSenderId !== undefined;
};

export const isLastMessage = (messages, index, userId) => {
  if (index !== messages.length - 1) return false;

  const lastSenderId = messages[messages.length - 1]?.message_sender?._id;

  return lastSenderId !== userId && lastSenderId !== undefined;
};

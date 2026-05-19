import React, { useEffect, useState } from "react";

export default function TypingStatus({ provider, editorRef }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!provider) return;

    const update = () => {
      const states = Array.from(provider.awareness.getStates().entries());

      const otherUsers = states
        .filter(([clientId]) => clientId !== provider.awareness.clientID)
        .map(([clientId, state]) => ({
          clientId,
          user: state.user,
          typing: state.typing,
        }))
        .filter((item) => item.typing?.isTyping);

      setUsers(otherUsers);
    };

    provider.awareness.on("change", update);
    update();

    return () => {
      provider.awareness.off("change", update);
    };
  }, [provider]);

  return (
    <>
      {users.map((item) => (
        <div
          key={item.clientId}
          className="typing-label"
          style={{
            left: item.typing.x,
            top: item.typing.y,
          }}
        >
          {item.user?.name || "user"} 작성중...
        </div>
      ))}
    </>
  );
}
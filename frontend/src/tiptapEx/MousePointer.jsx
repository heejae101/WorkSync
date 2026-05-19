import React, { useEffect, useState } from "react";

export default function MousePointer({ provider }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!provider) return;

    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().entries());

      const otherUsers = states
        .filter(([clientId]) => clientId !== provider.awareness.clientID)
        .map(([clientId, state]) => ({
          clientId,
          user: state.user,
          mouse: state.mouse,
        }))
        .filter((item) => item.mouse);

      setUsers(otherUsers);
    };

    provider.awareness.on("change", updateUsers);
    updateUsers();

    return () => {
      provider.awareness.off("change", updateUsers);
    };
  }, [provider]);

  return (
        <>
            {users.map((item) => (
            <div
                key={item.clientId}
                className="mouse-pointer-wrap"
                style={{
                left: item.mouse.x,
                top: item.mouse.y,
                }}
            >
                <div
                className="mouse-cursor-icon"
                style={{
                    color: item.user?.color || "#2563eb",
                }}
                >
                ▶
                </div>

                <div
                className="mouse-pointer-name"
                style={{
                    backgroundColor: item.user?.color || "#2563eb",
                }}
                >
                {item.user?.name || "user"}
                </div>
            </div>
            ))}
        </>
    );
}
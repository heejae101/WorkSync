import React, { useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import Toolbar from "./toolbar";
import { WebsocketProvider } from "y-websocket";

// 협업 커서
import TypingStatus from "./TypingStatus";
// 마우스 포인터
import MousePointer from "./MousePointer";

// css
import "./editor.css";

export default function EditorPage() {
  const roomId = useMemo(() => {
    return prompt("room id 입력") || "1";
  }, []);

  const ydoc = useMemo(() => new Y.Doc(), []);

  // 로컬 방 구분
  const provider = useMemo(() => {
    return new WebsocketProvider(
      "ws://localhost:1234",
      roomId,
      ydoc
    );
  }, [roomId, ydoc]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        undoRedo: false,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
    ],
  });

    // 마우스 커서 공유
    useEffect(() => {
        const handleMouseMove = (e) => {
            provider.awareness.setLocalStateField("mouse", {
            x: e.clientX,
            y: e.clientY,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    // ~~~ 작성중...
    const editorWrapRef = useRef(null);

    useEffect(() => {
        if (!editor) return;

        let timer;

        const sendTypingPosition = () => {
            const { from } = editor.state.selection;
            const coords = editor.view.coordsAtPos(from);
            const wrapRect = editorWrapRef.current.getBoundingClientRect();

            provider.awareness.setLocalStateField("typing", {
            isTyping: true,
            x: coords.left - wrapRect.left,
            y: coords.top - wrapRect.top - 24,
            });

            clearTimeout(timer);

            timer = setTimeout(() => {
            provider.awareness.setLocalStateField("typing", {
                isTyping: false,
            });
            }, 1200);
        };

        editor.on("update", sendTypingPosition);
        editor.on("selectionUpdate", sendTypingPosition);

        return () => {
            editor.off("update", sendTypingPosition);
            editor.off("selectionUpdate", sendTypingPosition);
            clearTimeout(timer);
        };
    }, [editor]);

    // 버튼 클릭 이벤트 처리
    useEffect(() => {
        const handleClick = (e) => {
            if (!e.target.classList.contains("copy-code-btn")) return;

            const pre = e.target.closest("pre");
            const code = pre?.querySelector("code")?.innerText;

            if (!code) return;

            navigator.clipboard.writeText(code);
            e.target.innerText = "복사됨";

            setTimeout(() => {
            e.target.innerText = "복사";
            }, 1000);
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);

    // 실제 버튼 생성
    useEffect(() => {
        if (!editor) return;

        const addCopyButtons = () => {
            const blocks = document.querySelectorAll("pre");

            blocks.forEach((block) => {
            if (block.dataset.copyReady === "true") return;

            block.dataset.copyReady = "true";

            const button = document.createElement("button");

            button.innerText = "복사";
            button.className = "copy-code-btn";

            button.onclick = () => {
                const code = block.querySelector("code")?.innerText || "";

                navigator.clipboard.writeText(code);

                button.innerText = "복사됨";

                setTimeout(() => {
                button.innerText = "복사";
                }, 1000);
            };

            block.prepend(button);
            });
        };

        setTimeout(addCopyButtons, 300);

        editor.on("update", addCopyButtons);

        return () => {
            editor.off("update", addCopyButtons);
        };
    }, [editor]);

  return (
    <>
        <MousePointer provider={provider} />
        <div className="editor-wrap" ref={editorWrapRef}>
            <p>현재 방: {roomId}</p>
            <Toolbar editor={editor} />
            <TypingStatus provider={provider} editorRef={editorWrapRef} />
            <EditorContent editor={editor} />    
        </div>
    </>
    
  );
}
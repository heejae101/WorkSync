import React from "react";
export default function Toolbar({ editor }) {
  if (!editor) return null;

  return (
    <div className="toolbar">
      <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()}>S</button>

      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>

      <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>

      <button onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Code</button>

      <button onClick={() => editor.chain().focus().undo().run()}>Undo</button>
      <button onClick={() => editor.chain().focus().redo().run()}>Redo</button>

      <button onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
        Clear
      </button>
    </div>
  );
}
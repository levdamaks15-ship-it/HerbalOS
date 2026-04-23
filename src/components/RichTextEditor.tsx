"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Undo,
  Redo,
  Type
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Начните писать здесь..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-2xl max-w-full h-auto my-4 shadow-lg",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg focus:outline-none max-w-none min-h-[200px] font-medium text-graphite/80",
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Введите URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Введите URL изображения");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="w-full border border-graphite/5 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm focus-within:ring-4 focus-within:ring-primary/5 transition-all">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-graphite/5 bg-graphite/2">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          active={editor.isActive("bold")}
          icon={<Bold size={18} />}
          title="Жирный"
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          active={editor.isActive("italic")}
          icon={<Italic size={18} />}
          title="Курсив"
        />
        <div className="w-[1px] h-6 bg-graphite/10 mx-1" />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          active={editor.isActive("heading", { level: 1 })}
          icon={<Heading1 size={18} />}
          title="Заголовок 1"
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          active={editor.isActive("heading", { level: 2 })}
          icon={<Heading2 size={18} />}
          title="Заголовок 2"
        />
        <div className="w-[1px] h-6 bg-graphite/10 mx-1" />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          active={editor.isActive("bulletList")}
          icon={<List size={18} />}
          title="Список"
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          active={editor.isActive("orderedList")}
          icon={<ListOrdered size={18} />}
          title="Нумерованный список"
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          active={editor.isActive("blockquote")}
          icon={<Quote size={18} />}
          title="Цитата"
        />
        <div className="w-[1px] h-6 bg-graphite/10 mx-1" />
        <ToolbarButton 
          onClick={addLink} 
          active={editor.isActive("link")}
          icon={<LinkIcon size={18} />}
          title="Ссылка"
        />
        <ToolbarButton 
          onClick={addImage} 
          icon={<ImageIcon size={18} />}
          title="Изображение"
        />
        <div className="ml-auto flex items-center gap-1">
          <ToolbarButton 
            onClick={() => editor.chain().focus().undo().run()} 
            icon={<Undo size={18} />}
            title="Отменить"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().redo().run()} 
            icon={<Redo size={18} />}
            title="Повторить"
          />
        </div>
      </div>
      <div className="p-6">
        <EditorContent editor={editor} />
      </div>
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror {
          outline: none !important;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #D5FF3F;
          padding-left: 1rem;
          font-style: italic;
          color: #4A4A4A;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  );
}

function ToolbarButton({ onClick, active, icon, title }: { onClick: () => void, active?: boolean, icon: React.ReactNode, title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded-xl transition-all flex items-center justify-center",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "text-graphite/40 hover:bg-white hover:text-primary"
      )}
    >
      {icon}
    </button>
  );
}

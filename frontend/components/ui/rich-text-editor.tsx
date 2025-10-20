// components/ui/rich-text-editor.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Download,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Type,
  Minus,
  Highlighter,
  Superscript,
  Subscript,
  Strikethrough,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onDownload?: () => void;
  senderAddress?: string;
  toAddress?: string;
}

const FONT_FAMILIES = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Calibri", value: "Calibri, sans-serif" },
];

const FONT_SIZES = [
  "8",
  "9",
  "10",
  "11",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28",
  "36",
  "48",
  "72",
];

const LINE_HEIGHTS = ["1", "1.15", "1.5", "1.75", "2", "2.5", "3"];

const COLORS = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#b7b7b7",
  "#cccccc",
  "#d9d9d9",
  "#efefef",
  "#f3f3f3",
  "#ffffff",
  "#980000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#4a86e8",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
  "#e6b8af",
  "#f4cccc",
  "#fce5cd",
  "#fff2cc",
  "#d9ead3",
  "#d0e0e3",
  "#c9daf8",
  "#cfe2f3",
  "#d9d2e9",
  "#ead1dc",
];

const HIGHLIGHT_COLORS = [
  "#ffff00",
  "#ff9900",
  "#00ff00",
  "#00ffff",
  "#4a86e8",
  "#ff00ff",
  "#ffcccc",
  "#ccffcc",
  "#ccccff",
  "#ffffcc",
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start typing your letter...",
  className = "",
  onDownload,
  senderAddress = "",
  toAddress = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastSelectionRef = useRef<Range | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showLineHeightPicker, setShowLineHeightPicker] = useState(false);

  // Save selection when user interacts with editor
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      lastSelectionRef.current = selection.getRangeAt(0);
    }
  };

  // Restore selection
  const restoreSelection = () => {
    if (lastSelectionRef.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(lastSelectionRef.current);
    }
  };

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const executeCommand = (command: string, value?: string) => {
    saveSelection();
    document.execCommand(command, false, value);
    updateContent();
    restoreSelection();
    editorRef.current?.focus();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    saveSelection();
    updateContent();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    saveSelection();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    updateContent();
  };

  const handleMouseUp = () => {
    saveSelection();
  };

  const handleKeyUp = () => {
    saveSelection();
  };

  const setFontFamily = (fontFamily: string) => {
    executeCommand("fontName", fontFamily);
    setShowFontPicker(false);
  };

  const setFontSize = (fontSize: string) => {
    executeCommand("fontSize", fontSize);
    setShowSizePicker(false);
  };

  const setLineHeight = (lineHeight: string) => {
    if (editorRef.current) {
      editorRef.current.style.lineHeight = lineHeight;
      updateContent();
    }
    setShowLineHeightPicker(false);
  };

  const setTextColor = (color: string) => {
    executeCommand("foreColor", color);
    setShowColorPicker(false);
  };

  const setHighlightColor = (color: string) => {
    executeCommand("hiliteColor", color);
    setShowHighlightPicker(false);
  };

  const setAlignment = (alignment: string) => {
    executeCommand(alignment);
  };

  const insertHorizontalRule = () => {
    executeCommand("insertHorizontalRule");
  };

  const htmlToText = (html: string): string => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const createDocxDocument = async () => {
    const plainTextContent = htmlToText(value);
    const contentParagraphs = plainTextContent
      .split("\n")
      .filter((line) => line.trim() !== "");

    const sections = [
      new Paragraph({
        children: [
          new TextRun({
            text: "FROM:",
            bold: true,
            size: 24,
          }),
        ],
      }),
      ...senderAddress.split("\n").map(
        (line) =>
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          })
      ),

      new Paragraph({ text: "" }),

      new Paragraph({
        children: [
          new TextRun({
            text: "TO:",
            bold: true,
            size: 24,
          }),
        ],
      }),
      ...toAddress.split("\n").map(
        (line) =>
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          })
      ),

      new Paragraph({ text: "" }),
      new Paragraph({ text: "" }),

      ...contentParagraphs.map(
        (paragraph) =>
          new Paragraph({
            children: [
              new TextRun({
                text: paragraph,
                size: 22,
              }),
            ],
            spacing: { after: 200, before: 200 },
          })
      ),
    ];

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    });

    return doc;
  };

  const handleDownloadClick = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    try {
      const doc = await createDocxDocument();
      const blob = await Packer.toBlob(doc);
      const fileName = `dispute-letter-${
        new Date().toISOString().split("T")[0]
      }.docx`;

      const file = new File([blob], fileName, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error generating DOCX:", error);
      downloadFallbackText();
    }
  };

  const downloadFallbackText = () => {
    const content = `FROM:\n${senderAddress}\n\nTO:\n${toAddress}\n\n${htmlToText(
      value
    )}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dispute-letter-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${className}`}>
      <div className="rounded-xl border border-[#E5E7EB] bg-white">
        {/* Enhanced Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b">
          {/* Font Family */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFontPicker(!showFontPicker)}
              className="h-8 px-3 text-xs gap-2"
            >
              <Type className="h-3 w-3" />
              Font
            </Button>
            {showFontPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 w-48 max-h-60 overflow-y-auto">
                {FONT_FAMILIES.map((font) => (
                  <button
                    key={font.value}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-xs"
                    onClick={() => setFontFamily(font.value)}
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSizePicker(!showSizePicker)}
              className="h-8 px-3 text-xs gap-2"
            >
              Size
            </Button>
            {showSizePicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 w-20 max-h-60 overflow-y-auto">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-xs"
                    onClick={() => setFontSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Line Height */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowLineHeightPicker(!showLineHeightPicker)}
              className="h-8 px-3 text-xs gap-2"
            >
              Line Height
            </Button>
            {showLineHeightPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 w-20 max-h-60 overflow-y-auto">
                {LINE_HEIGHTS.map((height) => (
                  <button
                    key={height}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-xs"
                    onClick={() => setLineHeight(height)}
                  >
                    {height}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Text Formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand("bold")}
            className="h-8 w-8 p-0"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand("italic")}
            className="h-8 w-8 p-0"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand("underline")}
            className="h-8 w-8 p-0"
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand("strikeThrough")}
            className="h-8 w-8 p-0"
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Superscript/Subscript */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand("superscript")}
            className="h-8 w-8 p-0"
            title="Superscript"
          >
            <Superscript className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand("subscript")}
            className="h-8 w-8 p-0"
            title="Subscript"
          >
            <Subscript className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Text Color */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="h-8 w-8 p-0"
              title="Text Color"
            >
              <Palette className="h-4 w-4" />
            </Button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 p-2 w-32 grid grid-cols-5 gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    onClick={() => setTextColor(color)}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight Color */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowHighlightPicker(!showHighlightPicker)}
              className="h-8 w-8 p-0"
              title="Highlight Color"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
            {showHighlightPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 p-2 w-32 grid grid-cols-5 gap-1">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    onClick={() => setHighlightColor(color)}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Lists */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand("insertUnorderedList")}
            className="h-8 w-8 p-0"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeCommand("insertOrderedList")}
            className="h-8 w-8 p-0"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Alignment */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAlignment("justifyLeft")}
            className="h-8 w-8 p-0"
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAlignment("justifyCenter")}
            className="h-8 w-8 p-0"
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAlignment("justifyRight")}
            className="h-8 w-8 p-0"
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAlignment("justifyFull")}
            className="h-8 w-8 p-0"
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Horizontal Rule */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertHorizontalRule}
            className="h-8 w-8 p-0"
            title="Insert Horizontal Line"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* Second Toolbar Row - Download Button */}
        <div className="flex items-center justify-between p-2 bg-gray-50">
          <div className="text-xs text-gray-500">
            Professional Document Editor
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadClick}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download DOCX
          </Button>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onMouseUp={handleMouseUp}
          onKeyUp={handleKeyUp}
          className="min-h-[360px] p-6 outline-none prose prose-lg max-w-none"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        />

        {!value && (
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            style={{ marginTop: "180px" }}
          >
            {placeholder}
          </div>
        )}
      </div>

      {/* Close pickers when clicking outside */}
      {(showColorPicker ||
        showHighlightPicker ||
        showFontPicker ||
        showSizePicker ||
        showLineHeightPicker) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowColorPicker(false);
            setShowHighlightPicker(false);
            setShowFontPicker(false);
            setShowSizePicker(false);
            setShowLineHeightPicker(false);
          }}
        />
      )}
    </div>
  );
};

export default RichTextEditor;

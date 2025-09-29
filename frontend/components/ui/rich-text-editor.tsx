// components/ui/rich-text-editor.tsx
"use client";

import React, { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Download,
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

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
    editorRef.current?.focus();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    updateContent();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const htmlToText = (html: string): string => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const createDocxDocument = async () => {
    // Extract plain text from HTML content
    const plainTextContent = htmlToText(value);

    // Split content into paragraphs
    const contentParagraphs = plainTextContent
      .split("\n")
      .filter((line) => line.trim() !== "");

    // Create document sections
    const sections = [
      // Sender section
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

      // Empty line
      new Paragraph({ text: "" }),

      // Recipient section
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

      // Empty line before content
      new Paragraph({ text: "" }),
      new Paragraph({ text: "" }),

      // Main content
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

      // Generate the blob correctly with docx MIME type
      const blob = await Packer.toBlob(doc);
      const fileName = `dispute-letter-${
        new Date().toISOString().split("T")[0]
      }.docx`;

      // Wrap blob in a File object with correct type
      const file = new File([blob], fileName, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Create a temporary download link
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
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
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 ">
          <div className="flex items-center gap-2 text-[#6B7280]">
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
            <div className="w-px h-6 bg-gray-300 mx-1" />
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
          className="min-h-[360px] p-4 outline-none prose prose-sm max-w-none"
          style={{
            fontFamily: "inherit",
            fontSize: "inherit",
            lineHeight: "1.5",
          }}
          dangerouslySetInnerHTML={{ __html: value }}
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
    </div>
  );
};

export default RichTextEditor;

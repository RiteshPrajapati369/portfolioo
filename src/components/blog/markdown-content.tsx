"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, Copy, ExternalLink, ZoomIn } from "lucide-react";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [modalImage, setModalImage] = useState<{ url: string; alt: string } | null>(null);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content into logical blocks (code blocks, images, headings, paragraphs)
  const renderBlocks = () => {
    if (!content) return null;

    // Split on code blocks first
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let blockCounter = 0;

    const processTextChunk = (text: string, keyPrefix: string) => {
      const paragraphs = text.split(/\n\s*\n/);
      return paragraphs.map((para, pIndex) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        const uniqueKey = `${keyPrefix}-p-${pIndex}`;

        // 1. Markdown Image: ![alt](url)
        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
          const alt = imgMatch[1] || "Proof of Concept Screenshot";
          const src = imgMatch[2];
          return (
            <figure key={uniqueKey} className="my-6 space-y-2">
              <div
                onClick={() => setModalImage({ url: src, alt })}
                className="relative group cursor-pointer overflow-hidden rounded-xl border border-border bg-card/80 hover:border-primary/60 transition-all shadow-md"
              >
                <div className="relative w-full aspect-video sm:aspect-[16/9] max-h-[500px]">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-contain group-hover:scale-[1.01] transition-transform duration-200"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border text-[11px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shadow-xs">
                  <ZoomIn className="w-3.5 h-3.5 text-primary" />
                  <span>Click to expand PoC</span>
                </div>
              </div>
              {alt && alt !== "Proof of Concept Screenshot" && (
                <figcaption className="text-center text-xs text-muted-foreground font-mono italic">
                  Figure: {alt}
                </figcaption>
              )}
            </figure>
          );
        }

        // 2. Headings
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={uniqueKey} className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground pt-6 pb-2 border-b border-border/80">
              {trimmed.replace("# ", "")}
            </h1>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={uniqueKey} className="text-xl sm:text-2xl font-bold tracking-tight text-foreground pt-5 pb-1.5 border-b border-border/60">
              {trimmed.replace("## ", "")}
            </h2>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={uniqueKey} className="text-lg sm:text-xl font-bold text-foreground pt-4 pb-1">
              {trimmed.replace("### ", "")}
            </h3>
          );
        }
        if (trimmed.startsWith("#### ")) {
          return (
            <h4 key={uniqueKey} className="text-base sm:text-lg font-bold text-foreground pt-3">
              {trimmed.replace("#### ", "")}
            </h4>
          );
        }

        // 3. Blockquote
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote key={uniqueKey} className="border-l-2 border-primary/70 pl-4 py-2 italic text-muted-foreground bg-primary/5 rounded-r-lg text-sm sm:text-base my-4">
              {trimmed.replace(/^>\s*/, "")}
            </blockquote>
          );
        }

        // 4. Bullet list
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const lines = trimmed.split("\n").filter((l) => l.trim().length > 0);
          return (
            <ul key={uniqueKey} className="space-y-2 my-4 pl-2">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-foreground/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>{formatInlineStyles(line.replace(/^[-*]\s*/, ""))}</span>
                </li>
              ))}
            </ul>
          );
        }

        // 5. Numbered list (Steps like in Bugcrowd: 1. Navigate... 2. Intercept...)
        if (/^\d+\.\s/.test(trimmed)) {
          const lines = trimmed.split("\n").filter((l) => l.trim().length > 0);
          return (
            <ol key={uniqueKey} className="space-y-2 my-4 pl-2">
              {lines.map((line, lIdx) => {
                const stepNum = line.match(/^(\d+)\.\s/)?.[1] || `${lIdx + 1}`;
                const textOnly = line.replace(/^\d+\.\s*/, "");
                return (
                  <li key={lIdx} className="flex items-start gap-3 text-sm sm:text-base text-foreground/90">
                    <span className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {stepNum}
                    </span>
                    <span className="pt-0.5">{formatInlineStyles(textOnly)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // 6. Regular paragraph (may contain inline images mixed with text)
        // Check if paragraph contains any inline markdown images
        const inlineImgRegex = /!\[(.*?)\]\((.*?)\)/g;
        if (inlineImgRegex.test(trimmed)) {
          const segments = trimmed.split(/(!\[.*?\]\(.*?\))/g);
          return (
            <div key={uniqueKey} className="space-y-4 my-4">
              {segments.map((seg, sIdx) => {
                const subImgMatch = seg.match(/^!\[(.*?)\]\((.*?)\)$/);
                if (subImgMatch) {
                  const alt = subImgMatch[1] || "Proof of Concept Screenshot";
                  const src = subImgMatch[2];
                  return (
                    <div
                      key={sIdx}
                      onClick={() => setModalImage({ url: src, alt })}
                      className="cursor-pointer overflow-hidden rounded-xl border border-border bg-card/80 my-3"
                    >
                      <div className="relative w-full aspect-video max-h-[480px]">
                        <Image src={src} alt={alt} fill className="object-contain" sizes="100vw" />
                      </div>
                    </div>
                  );
                }
                const segTrimmed = seg.trim();
                return segTrimmed ? (
                  <p key={sIdx} className="text-foreground/90 leading-relaxed text-sm sm:text-base">
                    {formatInlineStyles(segTrimmed)}
                  </p>
                ) : null;
              })}
            </div>
          );
        }

        return (
          <p key={uniqueKey} className="text-foreground/90 leading-relaxed text-sm sm:text-base font-normal my-4">
            {formatInlineStyles(trimmed)}
          </p>
        );
      });
    };

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textChunk = content.substring(lastIndex, match.index);
        parts.push(...processTextChunk(textChunk, `chunk-${blockCounter++}`));
      }

      const language = match[1] || "bash";
      const code = match[2];
      const codeIndex = blockCounter++;

      parts.push(
        <div key={`code-${codeIndex}`} className="my-6 rounded-xl border border-border bg-[#0d1117] overflow-hidden shadow-md">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 text-xs font-mono text-zinc-400">
            <span className="uppercase text-[11px] font-semibold tracking-wider text-primary">{language}</span>
            <button
              type="button"
              onClick={() => copyCode(code, codeIndex)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-zinc-300 text-xs transition-colors"
            >
              {copiedIndex === codeIndex ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-zinc-200 leading-relaxed whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      const remaining = content.substring(lastIndex);
      parts.push(...processTextChunk(remaining, `chunk-${blockCounter++}`));
    }

    return parts;
  };

  return (
    <div className={`prose-headings:font-bold ${className}`}>
      {renderBlocks()}

      {/* Lightbox Modal for Full-Resolution PoC Screenshot Inspection */}
      {modalImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setModalImage(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center bg-card border border-border rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between w-full border-b border-border pb-3">
              <span className="text-xs font-mono text-foreground font-semibold truncate max-w-[80%]">
                {modalImage.alt}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={modalImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-border hover:bg-background text-muted-foreground hover:text-foreground text-xs inline-flex items-center gap-1 font-mono"
                  title="Open image in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Original</span>
                </a>
                <button
                  type="button"
                  onClick={() => setModalImage(null)}
                  className="px-3 py-1 rounded-lg border border-border hover:bg-background text-xs font-mono text-foreground"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="relative w-full h-[65vh] sm:h-[75vh]">
              <Image
                src={modalImage.url}
                alt={modalImage.alt}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Parses bold, inline code, and URLs within paragraph text
 */
function formatInlineStyles(text: string): React.ReactNode {
  // First split by inline code `code`
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-card border border-border font-mono text-xs text-primary font-medium"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Next handle **bold**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith("**") && bPart.endsWith("**")) {
        return (
          <strong key={`${i}-${bIdx}`} className="font-bold text-foreground">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  });
}

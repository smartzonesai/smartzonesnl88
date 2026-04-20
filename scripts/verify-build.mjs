#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

// ── Config ──────────────────────────────────────────────────────────────────

const ROOT = path.resolve(process.cwd());
const SCAN_DIRS = ["app", "components", "lib", "hooks"];
const EXTENSIONS = new Set([".ts", ".tsx"]);

// ── Helpers ─────────────────────────────────────────────────────────────────

function walkDir(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

function relativePath(filePath) {
  return path.relative(ROOT, filePath);
}

// ── Issue collection ────────────────────────────────────────────────────────

const issues = {
  CRITICAL: [],
  ERROR: [],
  WARNING: [],
};

function add(severity, file, line, description) {
  issues[severity].push({
    file: relativePath(file),
    line,
    description,
  });
}

// ── Checkers ────────────────────────────────────────────────────────────────

function checkSplitTextSpacing(filePath, lines) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/\.split\(\s*['"`]\s+['"`]\s*\)\s*\.map/.test(line)) {
      // Look ahead up to 10 lines for the wrapping element
      const chunk = lines.slice(i, i + 10).join("\n");
      if (
        !chunk.includes("mr-[0.25em]") &&
        !chunk.includes("{' '}") &&
        !chunk.includes("{\u0027 \u0027}") &&
        !chunk.includes('{"  "}') &&
        !chunk.includes("gap-") &&
        !chunk.includes("space-x-")
      ) {
        add(
          "CRITICAL",
          filePath,
          i + 1,
          "split(' ').map without word spacing (missing mr-[0.25em], {' '}, or gap utility)",
        );
      }
    }
  }
}

function checkUseClient(filePath, content, lines) {
  const clientHooks = [
    "useState",
    "useEffect",
    "useRef",
    "useCallback",
    "useContext",
  ];
  const needsClient =
    clientHooks.some((hook) => {
      const importRe = new RegExp(
        `import\\s+.*\\b${hook}\\b.*from\\s+['"]react['"]`,
      );
      return importRe.test(content);
    }) ||
    /import\s+.*from\s+['"]gsap['"]/.test(content) ||
    /import\s+.*from\s+['"]@gsap/.test(content);

  if (!needsClient) return;

  const firstLine = content.trimStart();
  if (
    !firstLine.startsWith("'use client'") &&
    !firstLine.startsWith('"use client"')
  ) {
    add(
      "ERROR",
      filePath,
      1,
      "Missing 'use client' directive (file imports client-side hooks or gsap)",
    );
  }
}

function checkGsapCleanup(filePath, lines) {
  // Simple heuristic: find useEffect blocks that use gsap but lack cleanup
  const content = lines.join("\n");
  const useEffectRe = /useEffect\s*\(\s*\(\)\s*=>\s*\{/g;
  let match;

  while ((match = useEffectRe.exec(content)) !== null) {
    // Find the matching closing brace by counting braces
    let depth = 0;
    let start = match.index + match[0].length - 1; // position of opening {
    let end = start;
    for (let i = start; i < content.length; i++) {
      if (content[i] === "{") depth++;
      if (content[i] === "}") depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }

    const block = content.slice(start, end + 1);
    if (
      /gsap\./.test(block) &&
      !/ctx\.revert\(\)/.test(block) &&
      !/context/.test(block) &&
      !/\.kill\(\)/.test(block)
    ) {
      // Find line number of the useEffect
      const lineNum =
        content.slice(0, match.index).split("\n").length;
      add(
        "ERROR",
        filePath,
        lineNum,
        "GSAP used inside useEffect without ctx.revert() or gsap.context() cleanup",
      );
    }
  }
}

function checkGenericCTA(filePath, lines) {
  const genericTexts = [
    "Learn More",
    "Submit",
    "Click Here",
    "Read More",
    "Get Started",
  ];
  const ctaRe =
    /<(?:button|a|Button|Link)\b[^>]*>([^<]*)<\/(?:button|a|Button|Link)>/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;
    ctaRe.lastIndex = 0;
    while ((m = ctaRe.exec(line)) !== null) {
      const text = m[1].trim();
      for (const generic of genericTexts) {
        if (text.toLowerCase() === generic.toLowerCase()) {
          add(
            "ERROR",
            filePath,
            i + 1,
            `Generic CTA text "${text}" — use specific, action-oriented text`,
          );
        }
      }
    }
    // Also check for string children on their own line
    for (const generic of genericTexts) {
      const trimmed = line.trim();
      if (
        trimmed === generic &&
        i > 0 &&
        /<(?:button|a|Button|Link)\b/.test(lines[i - 1])
      ) {
        add(
          "ERROR",
          filePath,
          i + 1,
          `Generic CTA text "${generic}" — use specific, action-oriented text`,
        );
      }
    }
  }
}

function checkButtonPadding(filePath, lines) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/(?:onClick|role=["']button["'])/.test(line)) {
      // Collect the full element (may span multiple lines)
      const chunk = lines.slice(i, Math.min(i + 5, lines.length)).join(" ");
      const closingIdx = chunk.indexOf(">");
      const elementStr = closingIdx !== -1 ? chunk.slice(0, closingIdx + 1) : chunk;

      if (
        !/(p[xy]?-|padding)/.test(elementStr) &&
        !/className/.test(elementStr) === false
      ) {
        // Only flag if there's a className but it lacks padding
        if (/className/.test(elementStr) && !/(p[xy]?-\d|p-\d|padding)/.test(elementStr)) {
          add(
            "ERROR",
            filePath,
            i + 1,
            "Interactive element with className but no padding (px-/py-/p-)",
          );
        }
      }
    }
  }
}

function checkButtonHover(filePath, lines) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match <button or <a with className
    if (
      /^[^/]*<(?:button|a)\s/.test(line) &&
      /className/.test(line)
    ) {
      const chunk = lines.slice(i, Math.min(i + 5, lines.length)).join(" ");
      const closingIdx = chunk.indexOf(">");
      const elementStr = closingIdx !== -1 ? chunk.slice(0, closingIdx + 1) : chunk;

      if (
        /className/.test(elementStr) &&
        !/hover:|group-hover:/.test(elementStr)
      ) {
        add(
          "ERROR",
          filePath,
          i + 1,
          "Button/link element missing hover: or group-hover: state",
        );
      }
    }
  }
}

function checkRawImg(filePath, lines) {
  for (let i = 0; i < lines.length; i++) {
    if (/<img\s/.test(lines[i]) && !/{\s*\/\*/.test(lines[i])) {
      add(
        "WARNING",
        filePath,
        i + 1,
        "Raw <img> tag — use next/image <Image> component instead",
      );
    }
  }
}

function checkMissingAlt(filePath, lines) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/<(?:Image|img)\s/.test(line)) {
      const chunk = lines.slice(i, Math.min(i + 5, lines.length)).join(" ");
      const closingIdx = chunk.search(/\/?>/) ;
      const elementStr =
        closingIdx !== -1 ? chunk.slice(0, closingIdx + 1) : chunk;

      if (!/alt\s*=/.test(elementStr)) {
        add(
          "WARNING",
          filePath,
          i + 1,
          "Image element missing alt prop",
        );
      }
    }
  }
}

function checkWindowOutsideEffect(filePath, lines) {
  let inUseEffect = false;
  let effectDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track useEffect blocks
    if (/useEffect\s*\(/.test(line)) {
      inUseEffect = true;
      effectDepth = 0;
    }
    if (inUseEffect) {
      effectDepth += (line.match(/\{/g) || []).length;
      effectDepth -= (line.match(/\}/g) || []).length;
      if (effectDepth <= 0 && i > 0) {
        inUseEffect = false;
      }
    }

    if (!inUseEffect && /(?:window\.|document\.)/.test(line)) {
      // Skip typeof guards
      if (/typeof\s+(?:window|document)/.test(line)) continue;
      // Skip comments
      if (/^\s*(?:\/\/|\*)/.test(line)) continue;
      // Skip imports
      if (/^\s*import\s/.test(line)) continue;

      add(
        "WARNING",
        filePath,
        i + 1,
        "window/document access outside useEffect without typeof guard",
      );
    }
  }
}

function checkHardcodedFontSizes(filePath, lines) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/text-\[\d+(?:rem|px|em)\]/.test(line)) {
      if (!/clamp\(/.test(line) && !/var\(/.test(line)) {
        add(
          "WARNING",
          filePath,
          i + 1,
          "Hardcoded font size (use clamp() or CSS variable for responsive sizing)",
        );
      }
    }
  }
}

function checkMissingFocusStates(filePath, lines) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      /^[^/]*<(?:button|a|input|select|textarea)\s/.test(line) &&
      /className/.test(line)
    ) {
      const chunk = lines.slice(i, Math.min(i + 5, lines.length)).join(" ");
      const closingIdx = chunk.indexOf(">");
      const elementStr = closingIdx !== -1 ? chunk.slice(0, closingIdx + 1) : chunk;

      if (/className/.test(elementStr) && !/focus-visible:|focus:/.test(elementStr)) {
        add(
          "WARNING",
          filePath,
          i + 1,
          "Interactive element missing focus-visible: class for keyboard accessibility",
        );
      }
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  const files = SCAN_DIRS.flatMap((dir) => walkDir(path.join(ROOT, dir)));

  if (files.length === 0) {
    console.log("No .ts/.tsx files found in scanned directories.");
    process.exit(0);
  }

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    // CRITICAL
    checkSplitTextSpacing(filePath, lines);

    // ERROR
    checkUseClient(filePath, content, lines);
    checkGsapCleanup(filePath, lines);
    checkGenericCTA(filePath, lines);
    checkButtonPadding(filePath, lines);
    checkButtonHover(filePath, lines);

    // WARNING
    checkRawImg(filePath, lines);
    checkMissingAlt(filePath, lines);
    checkWindowOutsideEffect(filePath, lines);
    checkHardcodedFontSizes(filePath, lines);
    checkMissingFocusStates(filePath, lines);
  }

  // ── Output ──────────────────────────────────────────────────────────────

  console.log("");
  console.log("=== SMART ZONES BUILD VERIFICATION ===");
  console.log("");

  for (const severity of ["CRITICAL", "ERROR", "WARNING"]) {
    const list = issues[severity];
    console.log(`${severity}: ${list.length} issue${list.length !== 1 ? "s" : ""}`);
    for (const issue of list) {
      console.log(`  ${issue.file}:${issue.line}  ${issue.description}`);
    }
    console.log("");
  }

  const hasFailing = issues.CRITICAL.length > 0 || issues.ERROR.length > 0;
  const result = hasFailing ? "FAIL" : "PASS";
  console.log(`=== RESULT: ${result} ===`);
  console.log("");

  process.exit(hasFailing ? 1 : 0);
}

main();

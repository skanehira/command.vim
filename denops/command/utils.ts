import * as path from "https://deno.land/std/path/mod.ts";

const home = Deno.env.get("HOME") as string;

const historyFile = {
  zsh: path.join(home, ".zsh_history"),
  bash: path.join(home, ".bash_history"),
  fish: path.join(home, ".local/share/fish/fish_history"),
} as Record<string, string>;

// TODO: write command to history file
export function updateShellHistory(cmd: string): string {
  return cmd;
}

export async function getShellHistory(shell: string): Promise<string[]> {
  if (historyFile[shell] === undefined) {
    throw new Error(`unsupported shell: ${shell}`);
  }
  const file = historyFile[shell];

  const text = await Deno.readTextFile(file);

  if (shell === "fish") {
    return formatFishHistory(text);
  } else if (shell === "zsh") {
    return formatZshHistory(text);
  }

  return text.split("\n");
}

export function formatZshHistory(history: string): string[] {
  const lines = history.split("\n");
  const histories: string[] = [];
  const tmpLine: string[] = [];
  for (const line of lines) {
    if (line.endsWith(`\\`)) {
      tmpLine.push(line.replaceAll(`\\`, ""));
    } else {
      if (tmpLine.length) {
        tmpLine.push(line);
        histories.push(tmpLine.join(" "));
        tmpLine.splice(0, tmpLine.length);
      } else {
        histories.push(line);
      }
    }
  }
  return histories;
}

// fish history's format is different to zsh and bash
// This function converts to zsh and bash history formats
//
// fish history example
// - cmd: echo 1 \\\n2
//   when: 1611401590
export function formatFishHistory(history: string): string[] {
  const lines: string[] = [];
  for (const line of history.split("\n")) {
    if (line.includes("-")) {
      const tmp = line.substring(7);
      const cmd = tmp.replace(`\\\\`, "").replace(`\\n`, "");
      lines.push(cmd);
    }
  }

  return lines;
}

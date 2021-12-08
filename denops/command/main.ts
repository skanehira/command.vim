import { Denops, ensureString, path } from "./deps.ts";
import * as utils from "./utils.ts";

export async function main(denops: Denops): Promise<void> {
  await denops.cmd(
    `command! CommandBufferOpen call denops#notify("${denops.name}", "openExecuteBuffer", [])`,
  );

  await denops.cmd(
    `nnoremap <silent> <Plug>(command_buffer_open) :CommandBufferOpen<CR>`,
  );

  denops.dispatcher = {
    async getShellHistory(arg: unknown): Promise<string[]> {
      ensureString(arg);
      if (!arg.length) {
        console.error("shell is empty, please set your shell to option");
        return [];
      }
      const shell = path.basename(arg);

      try {
        const history = await utils.getShellHistory(shell);
        return history;
      } catch (e) {
        console.error(e);
      }
      return [];
    },
    // open buffer for execute shell command
    async openExecuteBuffer() {
      // NOTE: using feedkeys because :startinsert doesn't work well in vim
      await denops.cmd(`botright 1new | call feedkeys("i")`);
      await denops.cmd(
        `setlocal buftype=nofile bufhidden=hide noswapfile nonumber nowrap ft=sh`,
      );
      await denops.cmd(
        `inoremap <silent> <buffer> <CR> <Esc>:call denops#notify("${denops.name}", "executeShellCommand", [&shell])<CR>`,
      );
      await denops.cmd(`nnoremap <silent> <buffer> <C-c> :bw!<CR>`);
      await denops.cmd(`inoremap <silent> <buffer> <C-c> <Esc>:bw!<CR>`);
      await denops.call(`command#complete#enable`);
    },

    // execute shell command throgh shell
    async executeShellCommand(arg: unknown): Promise<void> {
      ensureString(arg);
      const shell = path.basename(arg);
      // get inputed command
      const line = await denops.eval(`getbufline(bufnr(), 1)`) as string[];
      const cmd = line[0];
      if (!cmd) {
        console.log("please input shell command");
        await denops.call("feedkeys", "i");
        return;
      }

      // open terminal with inputed command
      await denops.cmd(`bw!`);
      if (await denops.call(`has`, "nvim")) {
        await denops.cmd(`new`);
        await denops.call(`termopen`, cmd);
      } else {
        await denops.cmd(`terminal ++shell ${cmd}`);
        await denops.cmd(`nnoremap <buffer> <silent> <CR> :bw<CR>`);
      }

      // save history to shell history file
      await utils.updateShellHistory(shell, cmd);
    },
  };
}

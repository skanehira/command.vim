import {
  ensureString,
  main,
} from "https://deno.land/x/denops_std@v0.10/mod.ts";
import * as utils from "./utils.ts";
import * as path from "https://deno.land/std/path/mod.ts";

main(async ({ vim }) => {
  await vim.cmd(
    `nnoremap <silent> <Plug>(command_buffer_open) :call denops#notify("${vim.name}", "openExecuteBuffer", [])<CR>`,
  );
  await vim.cmd(
    `command! CommandBufferOpen call denops#notify("${vim.name}", "openExecuteBuffer", [])`,
  );

  vim.register({
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
      await vim.cmd(`botright 1new | call feedkeys("i")`);
      await vim.cmd(
        `setlocal buftype=nofile bufhidden=hide noswapfile nonumber nowrap ft=sh`,
      );
      await vim.cmd(
        `inoremap <silent> <buffer> <CR> <Esc>:call denops#notify("${vim.name}", "executeShellCommand", [&shell])<CR>`,
      );
      await vim.cmd(`nnoremap <silent> <buffer> <C-c> :bw!<CR>`);
      await vim.cmd(`inoremap <silent> <buffer> <C-c> <Esc>:bw!<CR>`);
      await vim.call(`command#complete#enable`);
    },

    // execute shell command throgh shell
    async executeShellCommand(arg: unknown): Promise<void> {
      ensureString(arg);
      const shell = path.basename(arg);
      // get inputed command
      const line = await vim.eval(`getbufline(bufnr(), 1)`) as string[];
      const cmd = line[0];
      if (!cmd) {
        console.log("please input shell command");
        await vim.call("feedkeys", "i");
        return;
      }

      // open terminal with inputed command
      await vim.cmd(`bw!`);
      if (await vim.call(`has`, "nvim")) {
        await vim.cmd(`new`);
        await vim.call(`termopen`, cmd);
      } else {
        await vim.call(`term_start`, cmd);
        await vim.cmd(`nnoremap <buffer> <silent> <CR> :bw<CR>`);
      }

      // save history to shell history file
      await utils.updateShellHistory(shell, cmd);
    },
  });
});

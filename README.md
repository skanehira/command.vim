# command.vim
Execute shell commands in terminal

![](https://i.gyazo.com/3b703f3d888526e282693d386051f59e.gif)

## Required
- [denops.vim](https://github.com/vim-denops/denops.vim)
- [deno](https://github.com/denoland/deno)

## Supported Environments
- OS
  - Linux
  - Mac
- shell
  - bash
  - zsh
  - fish

## Usage
Open buffer for execute shel command.
The buffer is enable autocomepletetion for shell history.

```
:CommandBufferOpen
```

## Keymap

| keymap                        | description         |
|-------------------------------|---------------------|
| `<Plug>(command_buffer_open)` | open command buffer |

## Author
skanehira

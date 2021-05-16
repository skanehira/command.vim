" complete
" Author: skanehira
" License: MIT

let s:line = ""

fun! command#complete#shell_history(findstart, base)
  if a:findstart
    let s:line = getline('.')
    return 0
  else
    let res = []
    for history in b:histories
      if history =~ "^" .. s:line
        call add(res, history)
      endif
    endfor
    return res
  endif
endfun

fun! s:complete() abort
  call feedkeys("\<C-x>\<C-u>")
endfun

fun! s:wipe_buffer() abort
  " restore completeopt
  exe "set completeopt=" .. s:old_completeopt

  " remove autocmd
  augroup denops-command-complete
    autocmd!
  augroup END
  augroup! denops-command-complete
endfun

fun! command#complete#enable() abort
  let b:histories = denops#request("command", "getShellHistory", [&shell])
  if empty(b:histories)
    return
  endif

  setlocal completefunc=command#complete#shell_history

  let s:old_completeopt = &completeopt
  set completeopt+=noinsert,menuone,noselect

  augroup denops-command-complete
    autocmd!
    autocmd InsertCharPre <buffer> call s:complete()
    autocmd BufWipeout <buffer> call s:wipe_buffer()
  augroup END
endfun

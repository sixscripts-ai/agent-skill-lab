import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { skillLabApi } from '~/features/skill-lab/api'
import type { CliResponse } from '~/features/skill-lab/types'
import {
  SectionCard,
  CommandButton,
  TerminalPanel,
} from '~/features/skill-lab/components/primitives'

export const Route = createFileRoute('/cli')({
  component: CliOverview,
})

function CliOverview() {
  const [cliInput, setCliInput] = useState('aiskill doctor')
  const [cliLines, setCliLines] = useState<Array<string>>([
    '$ aiskill doctor',
    '[api] Terminal initialized.',
  ])
  const [isBusy, setIsBusy] = useState(false)

  const appendCommandResult = (result: CliResponse) => {
    const lines = [
      `$ ${result.command}`,
      ...(result.stdout ? result.stdout.trim().split('\n').filter(Boolean) : []),
      ...(result.stderr ? result.stderr.trim().split('\n').filter(Boolean) : []),
      `[exitCode=${result.exitCode}] [duration=${result.durationMs}ms]`,
    ]
    setCliLines((prev) => [...prev, ...lines])
  }

  const execute = async (command: string) => {
    if (isBusy) return
    setIsBusy(true)
    const result = await skillLabApi.runCli(command)
    appendCommandResult(result)
    setIsBusy(false)
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Terminal Emulator" subtitle="Direct access to aiskill commands">
        <TerminalPanel lines={cliLines} />

        <div className="mt-6 border-t border-white/5 pt-6">
          <form
            className="flex gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              if (!cliInput.trim()) return
              void execute(cliInput)
            }}
          >
            <input
              value={cliInput}
              onChange={(event) => setCliInput(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-4 py-3 font-mono text-sm text-cyan-400 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 shadow-inner"
              placeholder="Enter aiskill command..."
            />
            <CommandButton tone="primary" disabled={isBusy}>Execute</CommandButton>
          </form>
        </div>
      </SectionCard>

      <SectionCard title="Quick Commands" subtitle="Common control tower operations">
        <div className="flex flex-wrap gap-3">
          <CommandButton onClick={() => void execute('aiskill doctor')} disabled={isBusy}>
            doctor
          </CommandButton>
          <CommandButton onClick={() => void execute('aiskill list')} disabled={isBusy}>
            list
          </CommandButton>
          <CommandButton onClick={() => void execute('aiskill sync all')} disabled={isBusy}>
            sync all
          </CommandButton>
          <CommandButton onClick={() => void execute('aiskill eval')} disabled={isBusy}>
            eval
          </CommandButton>
          <CommandButton onClick={() => void execute('aiskill gate "ls -la"')} disabled={isBusy}>
            gate ls
          </CommandButton>
        </div>
      </SectionCard>
    </div>
  )
}

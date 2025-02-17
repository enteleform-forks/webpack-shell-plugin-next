/**
 * @class WebpackShellPluginNext
 * @extends Object
 * Run shell commands before and after webpack builds
 */

import { spawn, exec, spawnSync, execSync, ChildProcess, ExecException } from 'child_process'
import { Options, Script, Tasks, Task, TasksWithErrors, FunctionWithErrors, OnError } from './types'
import * as webpack from 'webpack'
import { Readable } from 'stream'

const defaultTask: Tasks = {
  scripts: [],
  blocking: false,
  parallel: false
}

export default class WebpackShellPlugin {
  private onBeforeNormalRun: Tasks
  private onBeforeBuild: Tasks
  private onBuildStart: Tasks
  private onBuildEnd: Tasks
  private onBuildExit: TasksWithErrors
  private onBuildError: TasksWithErrors
  private onWatchRun: Tasks
  private onDoneWatch: Tasks
  private onAfterDone: TasksWithErrors
  private env: any = {}
  private dev = true
  private safe = false
  private logging = true
  private swallowError = false
  private buildErrors: webpack.WebpackError[] | undefined

  private validateEvent (tasks: Tasks | string | Function | undefined | null): Tasks {
    if (!tasks) {
      return JSON.parse(JSON.stringify(defaultTask))
    }
    if (typeof tasks === 'string') {
      return { scripts: tasks.split('&&'), blocking: false, parallel: false }
    } else if (typeof tasks === 'function') {
      return { scripts: [tasks], blocking: false, parallel: false }
    }

    return tasks
  }

  private validateEventWithErrors (tasks: TasksWithErrors | string | FunctionWithErrors | undefined | null, onError: OnError): TasksWithErrors {
    const validated = this.validateEvent(tasks) as TasksWithErrors
    if (typeof tasks === 'object') {
      validated.onError = tasks?.onError
    }
    validated.onError ??= onError
    return validated
  }

  constructor (options: Options) {
    if (options.verbose) {
      this.warn(`WebpackShellPlugin [${new Date()}]: Verbose is being deprecated, please remove.`)
    }

    this.onBeforeBuild = this.validateEvent(options.onBeforeBuild)
    this.onBeforeNormalRun = this.validateEvent(options.onBeforeNormalRun)
    this.onBuildStart = this.validateEvent(options.onBuildStart)
    this.onBuildEnd = this.validateEvent(options.onBuildEnd)
    this.onBuildExit = this.validateEventWithErrors(options.onBuildExit, 'skip')
    this.onBuildError = this.validateEventWithErrors(options.onBuildError, 'execute')
    this.onWatchRun = this.validateEvent(options.onWatchRun)
    this.onDoneWatch = this.validateEvent(options.onDoneWatch)
    this.onAfterDone = this.validateEventWithErrors(options.onAfterDone, 'skip')

    if (options.env !== undefined) {
      this.env = options.env
    }
    if (options.dev !== undefined) {
      this.dev = options.dev
    }
    if (options.safe !== undefined) {
      this.safe = options.safe
    }
    if (options.logging !== undefined) {
      this.logging = options.logging
    }
    if (options.swallowError !== undefined) {
      this.swallowError = options.swallowError
    }

    this.onCompilation = this.onCompilation.bind(this)
    this.onBeforeRun = this.onBeforeRun.bind(this)
    this.onAfterEmit = this.onAfterEmit.bind(this)
    this.onDone = this.onDone.bind(this)
    this.afterDone = this.afterDone.bind(this)
    this.onInvalid = this.onInvalid.bind(this)
    this.putsAsync = this.putsAsync.bind(this)
    this.puts = this.puts.bind(this)
  }

  private putsAsync (resolve: (val: any) => void) {
    return (error: ExecException | null, stdout: string, stderr: string) => {
      if (error && !this.swallowError) {
        throw error
      }
      resolve(error)
    }
  }

  private puts (error: Error, stdout: Readable, stderr: Readable) {
    if (error && !this.swallowError) {
      throw error
    }
  }

  private spreadStdoutAndStdErr (proc: ChildProcess) {
    if (!proc.stdout || !proc.stderr) return
    proc.stdout.pipe(process.stdout)
    proc.stderr.pipe(process.stdout)
  }

  private serializeScript (script: string | Script): Script {
    if (typeof script === 'string') {
      const [command, ...args] = script.split(' ')
      return { command, args }
    }
    const { command, args } = script
    return { command, args }
  }

  private async handleFunction (script: Function | FunctionWithErrors, blocking: boolean, onError: OnError | null) {
    const arg = (onError === null) ? [] : [this.buildErrors]
    if (blocking) {
      await script(...arg)
    } else {
      script(...arg)
    }
  }

  private handleScript (script: string) {
    if (this.safe) {
      return execSync(script, { maxBuffer: Number.MAX_SAFE_INTEGER, stdio: this.logging ? [0, 1, 2] : undefined })
    }

    const { command, args } = this.serializeScript(script)
    let env = Object.create(global.process.env)
    env = Object.assign(env, this.env)
    return spawnSync(command, args, { stdio: this.logging ? 'inherit' : undefined, env })
  }

  private handleScriptAsync (script: string) {
    if (this.safe) {
      return new Promise((resolve) => {
        this.spreadStdoutAndStdErr(exec(script, this.putsAsync(resolve)))
      })
    }

    const { command, args } = this.serializeScript(script)
    const proc = spawn(command, args, { stdio: 'inherit' })
    return new Promise((resolve) => proc.on('close', this.putsAsync(resolve)))
  }

  private async executeScripts (scripts: Task[], parallel = false, blocking = false, onError = null as OnError | null) {
    if (!scripts || scripts.length <= 0) {
      return
    }
    if (onError === 'skip' && this.buildErrors?.length) {
      return
    }

    if (blocking && parallel) {
      throw new Error(`WebpackShellPlugin [${new Date()}]: Not supported`)
    }

    for (let i = 0; i < scripts.length; i++) {
      const script: Task = scripts[i]
      if (typeof script === 'function') {
        await this.handleFunction(script, blocking, onError)
        continue
      }
      if (blocking) {
        this.handleScript(script)
      } else if (!blocking) {
        if (parallel) this.handleScriptAsync(script); else await this.handleScriptAsync(script)
      }
    }
  }

  apply (compiler: webpack.Compiler): void {
    compiler.hooks.beforeRun.tapAsync('webpack-shell-plugin-next', this.onBeforeRun)
    compiler.hooks.invalid.tap('webpack-shell-plugin-next', this.onInvalid)
    compiler.hooks.compilation.tap('webpack-shell-plugin-next', this.onCompilation)
    compiler.hooks.afterEmit.tapAsync('webpack-shell-plugin-next', this.onAfterEmit)
    compiler.hooks.done.tapAsync('webpack-shell-plugin-next', this.onDone)
    compiler.hooks.afterCompile.tapAsync('webpack-shell-plugin-next', this.afterCompile)
    compiler.hooks.afterDone.tap('webpack-shell-plugin-next', this.afterDone)
    compiler.hooks.watchRun.tapAsync('webpack-shell-plugin-next', this.watchRun)
  }

  private readonly onBeforeRun = async (compiler: webpack.Compiler, callback?: Function): Promise<void> => {
    const onBeforeNormalRun = this.onBeforeNormalRun
    if (onBeforeNormalRun.scripts && onBeforeNormalRun.scripts.length > 0) {
      this.log('Executing pre-run scripts')
      await this.executeScripts(onBeforeNormalRun.scripts, onBeforeNormalRun.parallel, onBeforeNormalRun.blocking)
      if (this.dev) {
        this.onDoneWatch = JSON.parse(JSON.stringify(defaultTask))
      }
    }
    if (callback) {
      callback()
    }
  }

  private readonly afterDone = async (): Promise<void> => {
    const onAfterDone = this.onAfterDone
    if (onAfterDone.scripts && onAfterDone.scripts.length > 0) {
      this.log('Executing additional scripts before exit')
      await this.executeScripts(onAfterDone.scripts, onAfterDone.parallel, onAfterDone.blocking, onAfterDone.onError)
      if (this.dev) {
        this.onBuildExit = JSON.parse(JSON.stringify(defaultTask))
      }
    }
    this.buildErrors = undefined
  }

  private readonly afterCompile = async (compilation: webpack.Compilation, callback?: Function): Promise<void> => {
    const onDoneWatch = this.onDoneWatch
    if (onDoneWatch.scripts && onDoneWatch.scripts.length > 0) {
      this.log('Executing additional scripts before exit')
      await this.executeScripts(onDoneWatch.scripts, onDoneWatch.parallel, onDoneWatch.blocking)
      if (this.dev) {
        this.onBuildExit = JSON.parse(JSON.stringify(defaultTask))
      }
    }
    if (callback) {
      callback()
    }
  };

  private readonly onInvalid = async (compilation: string): Promise<void> => {
    const onBeforeBuild = this.onBeforeBuild
    if (onBeforeBuild.scripts && onBeforeBuild.scripts.length) {
      this.log('Executing before build scripts')
      await this.executeScripts(onBeforeBuild.scripts, onBeforeBuild.parallel, onBeforeBuild.blocking)
      if (this.dev) {
        this.onBeforeBuild = JSON.parse(JSON.stringify(defaultTask))
      }
    }
  };

  private readonly onCompilation = async (compilation: webpack.Compilation): Promise<void> => {
    const onBuildStartOption = this.onBuildStart
    if (onBuildStartOption.scripts && onBuildStartOption.scripts.length > 0) {
      this.log('Executing pre-build scripts')
      await this.executeScripts(onBuildStartOption.scripts, onBuildStartOption.parallel, onBuildStartOption.blocking)
      if (this.dev) {
        this.onBuildStart = JSON.parse(JSON.stringify(defaultTask))
      }
    }
  };

  private readonly onAfterEmit = async (compilation: webpack.Compilation, callback?: Function): Promise<void> => {
    const onBuildEndOption = this.onBuildEnd
    if (onBuildEndOption.scripts && onBuildEndOption.scripts.length > 0) {
      this.log('Executing post-build scripts')
      await this.executeScripts(onBuildEndOption.scripts, onBuildEndOption.parallel, onBuildEndOption.blocking)
      if (this.dev) {
        this.onBuildEnd = JSON.parse(JSON.stringify(defaultTask))
      }
    }
    if (callback) {
      callback()
    }
  };

  private readonly onDone = async (stats: webpack.Stats, callback?: Function): Promise<void> => {
    if (stats.hasErrors()) {
      this.buildErrors = stats.compilation.errors
      const onBuildError = this.onBuildError
      if (onBuildError.scripts && onBuildError.scripts.length > 0) {
        this.warn('Executing error scripts before exit')
        await this.executeScripts(onBuildError.scripts, onBuildError.parallel, onBuildError.blocking, onBuildError.onError)
        if (this.dev) {
          this.onBuildError = JSON.parse(JSON.stringify(defaultTask))
        }
      }
    }
    const onBuildExit = this.onBuildExit
    if (onBuildExit.scripts && onBuildExit.scripts.length > 0) {
      this.log('Executing additional scripts before exit')
      await this.executeScripts(onBuildExit.scripts, onBuildExit.parallel, onBuildExit.blocking, onBuildExit.onError)
      if (this.dev) {
        this.onBuildExit = JSON.parse(JSON.stringify(defaultTask))
      }
    }
    if (callback) {
      callback()
    }
  };

  private readonly watchRun = async (compiler: webpack.Compiler, callback?: Function): Promise<void> => {
    const onWatchRun = this.onWatchRun
    if (onWatchRun.scripts && onWatchRun.scripts.length) {
      this.log('Executing onWatchRun build scripts')
      await this.executeScripts(onWatchRun.scripts, onWatchRun.parallel, onWatchRun.blocking)
      if (this.dev) {
        this.onWatchRun = JSON.parse(JSON.stringify(defaultTask))
      }
    }

    if (callback) {
      callback()
    }
  };

  private log (text: string) {
    if (this.logging) {
      console.log(text)
    }
  }

  private warn (text: string) {
    if (this.logging) {
      console.warn(text)
    }
  }
}

module.exports = WebpackShellPlugin

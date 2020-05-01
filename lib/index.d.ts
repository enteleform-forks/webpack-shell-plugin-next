/**
 * @class WebpackShellPluginNext
 * @extends Object
 * Run shell commands before and after webpack builds
 */
import { Options } from './types';
import * as webpack from 'webpack';
export default class WebpackShellPlugin {
    private onBeforeNormalRun;
    private onBeforeBuild;
    private onBuildStart;
    private onBuildEnd;
    private onBuildExit;
    private onBuildError;
    private onWatchRun;
    private onDoneWatch;
    private env;
    private dev;
    private safe;
    private logging;
    private swallowError;
    private validateEvent;
    constructor(options: Options);
    private putsAsync;
    private puts;
    private spreadStdoutAndStdErr;
    private serializeScript;
    private handleScript;
    private handleScriptAsync;
    private executeScripts;
    apply(compiler: webpack.Compiler): void;
    private readonly onBeforeRun;
    private readonly afterCompile;
    private readonly onInvalid;
    private readonly onCompilation;
    private readonly onAfterEmit;
    private readonly onDone;
    private readonly watchRun;
    private log;
    private warn;
}

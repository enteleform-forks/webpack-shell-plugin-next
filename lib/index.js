"use strict";
/**
 * @class WebpackShellPluginNext
 * @extends Object
 * Run shell commands before and after webpack builds
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var defaultTask = {
    scripts: [],
    blocking: false,
    parallel: false
};
var WebpackShellPlugin = /** @class */ (function () {
    function WebpackShellPlugin(options) {
        var _this = this;
        this.env = {};
        this.dev = true;
        this.safe = false;
        this.logging = true;
        this.swallowError = false;
        this.onBeforeRun = function (compiler, callback) { return __awaiter(_this, void 0, void 0, function () {
            var onBeforeNormalRun;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onBeforeNormalRun = this.onBeforeNormalRun;
                        if (!(onBeforeNormalRun.scripts && onBeforeNormalRun.scripts.length > 0)) return [3 /*break*/, 2];
                        this.log('Executing pre-run scripts');
                        return [4 /*yield*/, this.executeScripts(onBeforeNormalRun.scripts, onBeforeNormalRun.parallel, onBeforeNormalRun.blocking)];
                    case 1:
                        _a.sent();
                        if (this.dev) {
                            this.onDoneWatch = JSON.parse(JSON.stringify(defaultTask));
                        }
                        _a.label = 2;
                    case 2:
                        if (callback) {
                            callback();
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.afterDone = function () { return __awaiter(_this, void 0, void 0, function () {
            var onAfterDone;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onAfterDone = this.onAfterDone;
                        if (!(onAfterDone.scripts && onAfterDone.scripts.length > 0)) return [3 /*break*/, 2];
                        this.log('Executing additional scripts before exit');
                        return [4 /*yield*/, this.executeScripts(onAfterDone.scripts, onAfterDone.parallel, onAfterDone.blocking, onAfterDone.onError)];
                    case 1:
                        _a.sent();
                        if (this.dev) {
                            this.onBuildExit = JSON.parse(JSON.stringify(defaultTask));
                        }
                        _a.label = 2;
                    case 2:
                        this.buildErrors = undefined;
                        return [2 /*return*/];
                }
            });
        }); };
        this.afterCompile = function (compilation, callback) { return __awaiter(_this, void 0, void 0, function () {
            var onDoneWatch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onDoneWatch = this.onDoneWatch;
                        if (!(onDoneWatch.scripts && onDoneWatch.scripts.length > 0)) return [3 /*break*/, 2];
                        this.log('Executing additional scripts before exit');
                        return [4 /*yield*/, this.executeScripts(onDoneWatch.scripts, onDoneWatch.parallel, onDoneWatch.blocking)];
                    case 1:
                        _a.sent();
                        if (this.dev) {
                            this.onBuildExit = JSON.parse(JSON.stringify(defaultTask));
                        }
                        _a.label = 2;
                    case 2:
                        if (callback) {
                            callback();
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.onInvalid = function (compilation) { return __awaiter(_this, void 0, void 0, function () {
            var onBeforeBuild;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onBeforeBuild = this.onBeforeBuild;
                        if (!(onBeforeBuild.scripts && onBeforeBuild.scripts.length)) return [3 /*break*/, 2];
                        this.log('Executing before build scripts');
                        return [4 /*yield*/, this.executeScripts(onBeforeBuild.scripts, onBeforeBuild.parallel, onBeforeBuild.blocking)];
                    case 1:
                        _a.sent();
                        if (this.dev) {
                            this.onBeforeBuild = JSON.parse(JSON.stringify(defaultTask));
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        this.onCompilation = function (compilation) { return __awaiter(_this, void 0, void 0, function () {
            var onBuildStartOption;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onBuildStartOption = this.onBuildStart;
                        if (!(onBuildStartOption.scripts && onBuildStartOption.scripts.length > 0)) return [3 /*break*/, 2];
                        this.log('Executing pre-build scripts');
                        return [4 /*yield*/, this.executeScripts(onBuildStartOption.scripts, onBuildStartOption.parallel, onBuildStartOption.blocking)];
                    case 1:
                        _a.sent();
                        if (this.dev) {
                            this.onBuildStart = JSON.parse(JSON.stringify(defaultTask));
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        this.onAfterEmit = function (compilation, callback) { return __awaiter(_this, void 0, void 0, function () {
            var onBuildEndOption;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onBuildEndOption = this.onBuildEnd;
                        if (!(onBuildEndOption.scripts && onBuildEndOption.scripts.length > 0)) return [3 /*break*/, 2];
                        this.log('Executing post-build scripts');
                        return [4 /*yield*/, this.executeScripts(onBuildEndOption.scripts, onBuildEndOption.parallel, onBuildEndOption.blocking)];
                    case 1:
                        _a.sent();
                        if (this.dev) {
                            this.onBuildEnd = JSON.parse(JSON.stringify(defaultTask));
                        }
                        _a.label = 2;
                    case 2:
                        if (callback) {
                            callback();
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.onDone = function (stats, callback) { return __awaiter(_this, void 0, void 0, function () {
            var onBuildError, onBuildExit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!stats.hasErrors()) return [3 /*break*/, 2];
                        this.buildErrors = stats.compilation.errors;
                        onBuildError = this.onBuildError;
                        if (!(onBuildError.scripts && onBuildError.scripts.length > 0)) return [3 /*break*/, 2];
                        this.warn('Executing error scripts before exit');
                        return [4 /*yield*/, this.executeScripts(onBuildError.scripts, onBuildError.parallel, onBuildError.blocking, onBuildError.onError)];
                    case 1:
                        _a.sent();
                        if (this.dev) {
                            this.onBuildError = JSON.parse(JSON.stringify(defaultTask));
                        }
                        _a.label = 2;
                    case 2:
                        onBuildExit = this.onBuildExit;
                        if (!(onBuildExit.scripts && onBuildExit.scripts.length > 0)) return [3 /*break*/, 4];
                        this.log('Executing additional scripts before exit');
                        return [4 /*yield*/, this.executeScripts(onBuildExit.scripts, onBuildExit.parallel, onBuildExit.blocking, onBuildExit.onError)];
                    case 3:
                        _a.sent();
                        if (this.dev) {
                            this.onBuildExit = JSON.parse(JSON.stringify(defaultTask));
                        }
                        _a.label = 4;
                    case 4:
                        if (callback) {
                            callback();
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.watchRun = function (compiler, callback) { return __awaiter(_this, void 0, void 0, function () {
            var onWatchRun;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onWatchRun = this.onWatchRun;
                        if (!(onWatchRun.scripts && onWatchRun.scripts.length)) return [3 /*break*/, 2];
                        this.log('Executing onWatchRun build scripts');
                        return [4 /*yield*/, this.executeScripts(onWatchRun.scripts, onWatchRun.parallel, onWatchRun.blocking)];
                    case 1:
                        _a.sent();
                        if (this.dev) {
                            this.onWatchRun = JSON.parse(JSON.stringify(defaultTask));
                        }
                        _a.label = 2;
                    case 2:
                        if (callback) {
                            callback();
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        if (options.verbose) {
            this.warn("WebpackShellPlugin [" + new Date() + "]: Verbose is being deprecated, please remove.");
        }
        this.onBeforeBuild = this.validateEvent(options.onBeforeBuild);
        this.onBeforeNormalRun = this.validateEvent(options.onBeforeNormalRun);
        this.onBuildStart = this.validateEvent(options.onBuildStart);
        this.onBuildEnd = this.validateEvent(options.onBuildEnd);
        this.onBuildExit = this.validateEventWithErrors(options.onBuildExit, 'skip');
        this.onBuildError = this.validateEventWithErrors(options.onBuildError, 'execute');
        this.onWatchRun = this.validateEvent(options.onWatchRun);
        this.onDoneWatch = this.validateEvent(options.onDoneWatch);
        this.onAfterDone = this.validateEventWithErrors(options.onAfterDone, 'skip');
        if (options.env !== undefined) {
            this.env = options.env;
        }
        if (options.dev !== undefined) {
            this.dev = options.dev;
        }
        if (options.safe !== undefined) {
            this.safe = options.safe;
        }
        if (options.logging !== undefined) {
            this.logging = options.logging;
        }
        if (options.swallowError !== undefined) {
            this.swallowError = options.swallowError;
        }
        this.onCompilation = this.onCompilation.bind(this);
        this.onBeforeRun = this.onBeforeRun.bind(this);
        this.onAfterEmit = this.onAfterEmit.bind(this);
        this.onDone = this.onDone.bind(this);
        this.afterDone = this.afterDone.bind(this);
        this.onInvalid = this.onInvalid.bind(this);
        this.putsAsync = this.putsAsync.bind(this);
        this.puts = this.puts.bind(this);
    }
    WebpackShellPlugin.prototype.validateEvent = function (tasks) {
        if (!tasks) {
            return JSON.parse(JSON.stringify(defaultTask));
        }
        if (typeof tasks === 'string') {
            return { scripts: tasks.split('&&'), blocking: false, parallel: false };
        }
        else if (typeof tasks === 'function') {
            return { scripts: [tasks], blocking: false, parallel: false };
        }
        return tasks;
    };
    WebpackShellPlugin.prototype.validateEventWithErrors = function (tasks, onError) {
        var _a;
        var validated = this.validateEvent(tasks);
        if (typeof tasks === 'object') {
            validated.onError = tasks === null || tasks === void 0 ? void 0 : tasks.onError;
        }
        (_a = validated.onError) !== null && _a !== void 0 ? _a : (validated.onError = onError);
        return validated;
    };
    WebpackShellPlugin.prototype.putsAsync = function (resolve) {
        var _this = this;
        return function (error, stdout, stderr) {
            if (error && !_this.swallowError) {
                throw error;
            }
            resolve(error);
        };
    };
    WebpackShellPlugin.prototype.puts = function (error, stdout, stderr) {
        if (error && !this.swallowError) {
            throw error;
        }
    };
    WebpackShellPlugin.prototype.spreadStdoutAndStdErr = function (proc) {
        if (!proc.stdout || !proc.stderr)
            return;
        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stdout);
    };
    WebpackShellPlugin.prototype.serializeScript = function (script) {
        if (typeof script === 'string') {
            var _a = script.split(' '), command_1 = _a[0], args_1 = _a.slice(1);
            return { command: command_1, args: args_1 };
        }
        var command = script.command, args = script.args;
        return { command: command, args: args };
    };
    WebpackShellPlugin.prototype.handleFunction = function (script, blocking, onError) {
        return __awaiter(this, void 0, void 0, function () {
            var arg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        arg = (onError === null) ? [] : [this.buildErrors];
                        if (!blocking) return [3 /*break*/, 2];
                        return [4 /*yield*/, script.apply(void 0, arg)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        script.apply(void 0, arg);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WebpackShellPlugin.prototype.handleScript = function (script) {
        if (this.safe) {
            return child_process_1.execSync(script, { maxBuffer: Number.MAX_SAFE_INTEGER, stdio: this.logging ? [0, 1, 2] : undefined });
        }
        var _a = this.serializeScript(script), command = _a.command, args = _a.args;
        var env = Object.create(global.process.env);
        env = Object.assign(env, this.env);
        return child_process_1.spawnSync(command, args, { stdio: this.logging ? 'inherit' : undefined, env: env });
    };
    WebpackShellPlugin.prototype.handleScriptAsync = function (script) {
        var _this = this;
        if (this.safe) {
            return new Promise(function (resolve) {
                _this.spreadStdoutAndStdErr(child_process_1.exec(script, _this.putsAsync(resolve)));
            });
        }
        var _a = this.serializeScript(script), command = _a.command, args = _a.args;
        var proc = child_process_1.spawn(command, args, { stdio: 'inherit' });
        return new Promise(function (resolve) { return proc.on('close', _this.putsAsync(resolve)); });
    };
    WebpackShellPlugin.prototype.executeScripts = function (scripts, parallel, blocking, onError) {
        var _a;
        if (parallel === void 0) { parallel = false; }
        if (blocking === void 0) { blocking = false; }
        if (onError === void 0) { onError = null; }
        return __awaiter(this, void 0, void 0, function () {
            var i, script;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!scripts || scripts.length <= 0) {
                            return [2 /*return*/];
                        }
                        if (onError === 'skip' && ((_a = this.buildErrors) === null || _a === void 0 ? void 0 : _a.length) && this.buildErrors.length > 0) {
                            return [2 /*return*/];
                        }
                        if (blocking && parallel) {
                            throw new Error("WebpackShellPlugin [" + new Date() + "]: Not supported");
                        }
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < scripts.length)) return [3 /*break*/, 8];
                        script = scripts[i];
                        if (!(typeof script === 'function')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.handleFunction(script, blocking, onError)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 3:
                        if (!blocking) return [3 /*break*/, 4];
                        this.handleScript(script);
                        return [3 /*break*/, 7];
                    case 4:
                        if (!!blocking) return [3 /*break*/, 7];
                        if (!parallel) return [3 /*break*/, 5];
                        this.handleScriptAsync(script);
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.handleScriptAsync(script)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    WebpackShellPlugin.prototype.apply = function (compiler) {
        compiler.hooks.beforeRun.tapAsync('webpack-shell-plugin-next', this.onBeforeRun);
        compiler.hooks.invalid.tap('webpack-shell-plugin-next', this.onInvalid);
        compiler.hooks.compilation.tap('webpack-shell-plugin-next', this.onCompilation);
        compiler.hooks.afterEmit.tapAsync('webpack-shell-plugin-next', this.onAfterEmit);
        compiler.hooks.done.tapAsync('webpack-shell-plugin-next', this.onDone);
        compiler.hooks.afterCompile.tapAsync('webpack-shell-plugin-next', this.afterCompile);
        compiler.hooks.afterDone.tap('webpack-shell-plugin-next', this.afterDone);
        compiler.hooks.watchRun.tapAsync('webpack-shell-plugin-next', this.watchRun);
    };
    WebpackShellPlugin.prototype.log = function (text) {
        if (this.logging) {
            console.log(text);
        }
    };
    WebpackShellPlugin.prototype.warn = function (text) {
        if (this.logging) {
            console.warn(text);
        }
    };
    return WebpackShellPlugin;
}());
exports.default = WebpackShellPlugin;
module.exports = WebpackShellPlugin;

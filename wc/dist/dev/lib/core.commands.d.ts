/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
/** @module "core.commands" */
import * as lang from "lib/core.lang";
import * as Menu from "lib/ui/menu/Menu";
export interface ICommand {
    canExecute(): boolean;
    execute(...args: any[]): any;
}
export interface ICommandSpec {
    canExecute?: (() => boolean) | boolean;
    execute?: (...args: any[]) => any;
    name?: string;
    params?: any;
    debounce?: number;
}
export interface IBoundCommandSpec extends ICommandSpec {
    canExecute?: () => boolean;
}
export interface ICommandFactory extends lang.Factory<ICommand> {
}
export interface ICommandMap extends lang.Map<ICommand> {
}
export interface ICommandLazyMap extends lang.Map<lang.Lazy<ICommand>> {
}
export interface CommandArgs {
    name?: string;
    result?: any;
}
export declare class Command extends lang.Observable implements ICommand {
    name: string;
    params: any;
    /**
     * @constructs Command
     * @extends Observable
     */
    constructor();
    protected _prepareExecuteArgs(args: any[]): CommandArgs[];
    protected _enrichWithResult(args: CommandArgs[], result: any): CommandArgs[];
}
export interface Command {
    canExecute(): boolean;
    canExecute(v: boolean): void;
    execute(...args: any[]): any;
}
export declare namespace Command {
}
export declare function createCommand(execute: executeFn): Command;
export declare function createCommand(execute: executeFn, canExecute: canExecuteFn): Command;
export declare function createCommand(spec: ICommandSpec): Command;
export interface executeFn {
    (v: any): any;
}
export interface canExecuteFn {
    (): boolean;
}
export declare class BoundCommand extends Command {
    private _execute;
    private _canExecute;
    constructor(execute: executeFn, ctx: Object);
    constructor(execute: executeFn, canExecute: canExecuteFn, ctx: Object);
    constructor(spec: IBoundCommandSpec, ctx: Object);
    private _context;
    /**
     * @observable-property {BoundCommand#context}
     * @description Command context
     */
    context: lang.ObservableProperty<any>;
    /**
     * @override
     * @returns {boolean}
     */
    canExecute(): boolean;
    /**
     * @override
     * @returns {*}
     */
    execute(...args: any[]): any;
}
export declare function createBoundCommand(execute: executeFn, ctx: Object): BoundCommand;
export declare function createBoundCommand(execute: executeFn, canExecute: canExecuteFn, ctx: Object): BoundCommand;
export declare function createBoundCommand(spec: IBoundCommandSpec, ctx: Object): BoundCommand;
/**
 * Gets name of a command from the attribute 'data-command-name' (or 'data-cmd-name')
 * @param $element jQuery set
 * @returns {String}
 * @static
 */
export declare function dataCommandName($element: JQuery): string;
/**
 * Gets parameters for a command from the attribute 'data-command-params' (or 'data-cmd-params')
 * @param $element jQuery set
 * @returns {Object}
 * @static
 */
export declare function dataCommandParams($element: JQuery): any;
/**
 * Extracts command name/params from HTMLElement and executes menu item for the command.
 * @param $element
 * @param {Menu} menu
 * @param {Object} [args]
 * @return {boolean} true if a command was executed
 */
export declare function tryToExecuteHtmlCommand($element: JQuery, menu: Menu, args?: any): boolean;
/**
 * Creates commands instances if they are specified as factory functions.
 * @param {ICommandLazyMap} commands
 * @param ctx
 * @returns {ICommandMap}
 */
export declare function unlazyCommands(commands: ICommandLazyMap, ctx?: any): ICommandMap;

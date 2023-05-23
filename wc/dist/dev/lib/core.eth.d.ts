/// <reference path=".ambient.d.ts" />
/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import { InteropError, OptimisticConcurrencyException } from "interop/.interop";
/**
 * Error Types and Handlers.
 */
export interface CanceledError extends Error {
    isCanceled?: boolean;
}
export interface UnknownPartError extends Error {
    isUnknownPart?: boolean;
}
/**
 * Creates "Operation was canceled" error.
 * @returns {Error}
 */
export declare function canceled(): CanceledError;
/**
 * Checks error whether it's a "canceled" error.
 * @param {Error} error
 * @returns {boolean}
 */
export declare function isCanceled(error: any): boolean;
/**
 * Checks if an error isn't an infrastructure failure.
 * @param {Error} error
 * @returns {boolean}
 */
export declare function isUnrecoverableError(error: InteropError): boolean;
export declare function isObjectNotFound(error: InteropError): boolean;
export declare function isOptimisticConcurrency(error: any): error is OptimisticConcurrencyException;
export declare function unknownPart(partName: string): UnknownPartError;
export declare function isUnknownPart(error: any): boolean;

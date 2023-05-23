/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
export declare const automation: {
    setValue: (partName: string, expr: any, value: any) => void;
    getValue: (partName: string, expr: any) => any;
    exec: (partName: string, expr: any, data: any) => any;
    execAsync: (partName: string, expr: any, done: any, data: any) => void;
};
export interface AutomationEventArgs {
    cmd: "exec" | "getValue" | "setValue";
    expr: string | Function;
    part: string;
    result?: any;
    data?: any;
    done?: Function;
}
declare global  {
    interface Window {
        automation: typeof automation;
    }
}

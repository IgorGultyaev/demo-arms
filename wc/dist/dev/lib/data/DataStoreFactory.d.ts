/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import lang = require("lib/core.lang");
import DataStoreBase = require("./DataStoreBase");
import domain = require("lib/domain/.domain");
import ModelMeta = domain.metadata.ModelMeta;
export declare function create(name: string, version: number, domainModelMeta: ModelMeta, options?: DataStoreBase.Options): lang.Promise<DataStoreBase>;

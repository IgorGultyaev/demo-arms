/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
import * as lang from "lib/core.lang";
import { IDomainModel, metadata } from "./domain/.domain";
import ModelMeta = metadata.ModelMeta;
import ModelMetaSpec = metadata.ModelMetaSpec;
/**
 * Builds runtime domain model.
 * @param {Object} rawMetadata Json metadata
 * @returns {IDomainModel}
 */
export declare function buildModel(rawMetadata: ModelMetaSpec): IDomainModel;
export declare function localize(meta: ModelMeta, resources: lang.Map<string>): void;

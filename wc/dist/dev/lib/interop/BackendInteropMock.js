/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40
 * @author CROC Inc. <dev_rnd@croc.ru>
 * @version 1.39.5
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru>
 * @license Private: software can be used only with written authorization from CROC Inc.
 */
define(["require", "exports", "jquery", "core", "lib/interop/BackendInteropReal", "vendor/jquery.mockjax"], function (require, exports, $, core, BackendInterop) {
    "use strict";
    var lang = core.lang;
    var BackendInteropMock = /** @class */ (function (_super) {
        __extends(BackendInteropMock, _super);
        function BackendInteropMock(xconfig, model) {
            var _this = _super.call(this, xconfig) || this;
            _this.db = {};
            _this.model = model;
            _this.mockServer(model.meta);
            return _this;
        }
        BackendInteropMock.prototype.getObjects = function (type, options) {
            var entity = this.model.meta.entities[type];
            //let result = [];
            var result = (new Array(10));
            var objects = (this.db[type] || {});
            var ids = Object.keys(objects);
            for (var i = 0; i < result.length; i++) {
                result[i] = this.getObject(type, i + 1, options);
            }
            return result;
        };
        BackendInteropMock.prototype.getObject = function (type, id, options) {
            var json;
            if (!options || !options.nocache) {
                json = (this.db[type] || {})[id];
                if (json) {
                    return json;
                }
            }
            json = this.getRandomObject(type, id);
            if (!options || !options.nocache) {
                var typeObjects = this.db[type] || {};
                typeObjects[json.id] = json;
                this.db[type] = typeObjects;
            }
            return json;
        };
        BackendInteropMock.prototype.getRandomObject = function (type, id) {
            var entity = this.model.meta.entities[type];
            var obj = this.model.factory.createObject(this.model, type, id);
            for (var name_1 in entity.props) {
                var prop = entity.props[name_1];
                switch (prop.vt) {
                    case "i2":
                    case "i4":
                    case "i8":
                    case "ui1":
                    case "float":
                    case "double":
                        obj.set(prop.name, Math.random() * 10);
                        break;
                    case "date":
                    case "time":
                    case "dateTime":
                        obj.set(prop.name, new Date());
                        break;
                    case "string":
                    case "text":
                        obj.set(prop.name, name_1 + "_" + id);
                        break;
                    case "object":
                        obj.set(prop.name, prop.many ? [] : null);
                        break;
                }
            }
            return obj.toJson();
        };
        BackendInteropMock.prototype.getPlainData = function (source, params) {
            return [];
        };
        BackendInteropMock.prototype.getTreeData = function (treeName, data) {
            if (!data.node) {
                // get root
                return [];
            }
        };
        BackendInteropMock.prototype.save = function (objects, options) {
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                var type = obj.__metadata.type;
                var typeObjects = this.db[type] || {};
                typeObjects[obj.id] = lang.extend(typeObjects[obj.id] || {}, obj);
                this.db[type] = typeObjects;
            }
            return lang.resolved();
        };
        BackendInteropMock.prototype.checkConnection = function (httpMethod) {
            var defer = lang.Deferred();
            defer.resolve({ networkOnline: true, serverOnline: true });
            return defer.promise();
        };
        BackendInteropMock.prototype.getCurrentUser = function () {
            return {
                "__metadata": {
                    "type": "User",
                    "ts": 1
                },
                "id": "45d29642-5afa-e511-8a10-70f3950b67b3"
            };
        };
        BackendInteropMock.prototype.createAjaxSettings = function (query) {
            var settings = _super.prototype.createAjaxSettings.call(this, query);
            settings.data = settings.data || {};
            settings.data["__query"] = query;
            return settings;
        };
        BackendInteropMock.prototype.mockServer = function (model) {
            var that = this;
            $.ajaxSettings.dataType = "json";
            $.mockjaxSettings.contentType = "application/json";
            $.mockjaxSettings.responseText = null;
            var apiroot = this.config.apiroot;
            for (var name_2 in model.entities) {
                var entity = model.entities[name_2];
                // GetObject: api/{type}({id})
                $.mockjax({
                    url: apiroot + "api/" + name_2 + "(*)?*",
                    response: function (request) {
                        var match = /api\/(.+)\((.+)\)\?/.exec(request.url);
                        var type = match[1];
                        var id = match[2];
                        this.responseText = {
                            result: that.getObject(type, id)
                        };
                    },
                    responseTime: 1
                });
                // GetObjects: api/{type}
                $.mockjax({
                    url: apiroot + "api/" + name_2 + "?*",
                    response: function (request) {
                        var match = /api\/(.+)\?/.exec(request.url);
                        var type = match[1];
                        this.responseText = {
                            result: that.getObjects(type)
                        };
                    },
                    responseTime: 1
                });
                // GetProp: api/{type}({id})/{prop}
                $.mockjax({
                    url: apiroot + "api/" + name_2 + "(*)/*",
                    response: function (request) {
                        // TODO:
                        this.responseText = {
                            result: []
                        };
                    },
                    responseTime: 1
                });
                // LoadMany: api/_load
            }
            // PlainData: /api/_plain/{name}"
            $.mockjax({
                url: apiroot + "api/_plain/*",
                response: function (request) {
                    var query = JSON.parse(request.data["__query"]);
                    this.responseText = {
                        result: that.getPlainData(query.source, query.params)
                    };
                },
                responseTime: 1
            });
            // Tree: api/_tree/{treename}?node=UsersFolder
            $.mockjax({
                url: new RegExp(apiroot + "api/_tree/([wd]+)\\??"),
                response: function (request) {
                    var match = /api\/_tree\/([\w\d]+)\??/.exec(request.url);
                    //let type = match[1];
                    this.responseText = {
                        result: that.getTreeData(match[1], request.data)
                    };
                },
                responseTime: 1
            });
            // Cancel: api/_cancel?$opId=
            $.mockjax({
                url: apiroot + "api/_cancel?*",
                response: function () {
                }
            });
            // File.Upload: api/_file/upload
            $.mockjax({
                url: apiroot + "api/_file/Upload*",
                response: function () {
                    this.responseText = {
                        "resourceId": "ejlmz5os"
                    };
                }
            });
            // File.GetResource: api/_file/resource?resourceId=&fileName=
            $.mockjax({
                url: apiroot + "api/_file/resource?resourceId=*",
                response: function () {
                    // TODO: надо вернуть картинку (Content-Type:image/jpeg)
                    //this.responseText = "";
                }
            });
            // File.GetBinaryPropValue: api/_file/binaryPropValue?type=&id=&prop=&fileName=
            $.mockjax({
                url: apiroot + "api/_file/binaryPropValue?*",
                response: function () {
                    // type=&id=&prop=&fileName=
                    // TODO: надо вернуть картинку (Content-Type:image/jpeg)
                    //this.responseText = "";
                }
            });
            // File.DeleteResource: api/_file/resource/delete?resourceId=xafzwu4t
            $.mockjax({
                url: apiroot + "api/_file/resource/delete?resourceId=*",
                response: function () {
                    //this.responseText = "";
                }
            });
            // security
            $.mockjax({
                url: apiroot + "api/_security/currentUser*",
                responseText: {
                    "result": that.getCurrentUser()
                }
            });
            // transfer:
            $.mockjax({
                url: apiroot + "api/_transfer/list*",
                responseText: {
                    "operations": []
                }
            });
            // GetObjects with custom data source name: api/{somename}?
            $.mockjax({
                //`${apiroot}api/{type}?*`
                url: new RegExp(apiroot + "api/([^\_][^/]+)\\??"),
                response: function (request) {
                    var match = /api\/(.+)\?/.exec(request.url);
                    //let type = match[1];
                    var query = JSON.parse(request.data["__query"]);
                    var type = query.type;
                    this.responseText = {
                        "result": that.getObjects(type)
                    };
                },
                responseTime: 1
            });
        };
        BackendInteropMock.prototype._downloadFile = function (ajaxSettings, options, deferred) {
            var error = new Error(); //TODO: new BackendInterop.InteropError();
            error.action = "downloadFile";
            deferred.reject(error);
        };
        return BackendInteropMock;
    }(BackendInterop));
    core.interop = core.interop || {};
    return BackendInteropMock;
});
//# sourceMappingURL=BackendInteropMock.js.map
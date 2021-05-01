/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots.river || ($protobuf.roots.river = {});

$root.river = (function() {

    /**
     * Namespace river.
     * @exports river
     * @namespace
     */
    var river = {};

    river.River = (function() {

        /**
         * Constructs a new River service.
         * @memberof river
         * @classdesc Represents a River
         * @extends $protobuf.rpc.Service
         * @constructor
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         */
        function River(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
        }

        (River.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = River;

        /**
         * Creates new River service using the specified rpc implementation.
         * @function create
         * @memberof river.River
         * @static
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         * @returns {River} RPC service. Useful where requests and/or responses are streamed.
         */
        River.create = function create(rpcImpl, requestDelimited, responseDelimited) {
            return new this(rpcImpl, requestDelimited, responseDelimited);
        };

        /**
         * Callback as used by {@link river.River#judge}.
         * @memberof river.River
         * @typedef JudgeCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {river.JudgeResponse} [response] JudgeResponse
         */

        /**
         * Calls Judge.
         * @function judge
         * @memberof river.River
         * @instance
         * @param {river.IJudgeRequest} request JudgeRequest message or plain object
         * @param {river.River.JudgeCallback} callback Node-style callback called with the error, if any, and JudgeResponse
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(River.prototype.judge = function judge(request, callback) {
            return this.rpcCall(judge, $root.river.JudgeRequest, $root.river.JudgeResponse, request, callback);
        }, "name", { value: "Judge" });

        /**
         * Calls Judge.
         * @function judge
         * @memberof river.River
         * @instance
         * @param {river.IJudgeRequest} request JudgeRequest message or plain object
         * @returns {Promise<river.JudgeResponse>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link river.River#languageConfig}.
         * @memberof river.River
         * @typedef LanguageConfigCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {river.LanguageConfigResponse} [response] LanguageConfigResponse
         */

        /**
         * Calls LanguageConfig.
         * @function languageConfig
         * @memberof river.River
         * @instance
         * @param {river.IEmpty} request Empty message or plain object
         * @param {river.River.LanguageConfigCallback} callback Node-style callback called with the error, if any, and LanguageConfigResponse
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(River.prototype.languageConfig = function languageConfig(request, callback) {
            return this.rpcCall(languageConfig, $root.river.Empty, $root.river.LanguageConfigResponse, request, callback);
        }, "name", { value: "LanguageConfig" });

        /**
         * Calls LanguageConfig.
         * @function languageConfig
         * @memberof river.River
         * @instance
         * @param {river.IEmpty} request Empty message or plain object
         * @returns {Promise<river.LanguageConfigResponse>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link river.River#ls}.
         * @memberof river.River
         * @typedef LsCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {river.LsResponse} [response] LsResponse
         */

        /**
         * Calls Ls.
         * @function ls
         * @memberof river.River
         * @instance
         * @param {river.ILsRequest} request LsRequest message or plain object
         * @param {river.River.LsCallback} callback Node-style callback called with the error, if any, and LsResponse
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(River.prototype.ls = function ls(request, callback) {
            return this.rpcCall(ls, $root.river.LsRequest, $root.river.LsResponse, request, callback);
        }, "name", { value: "Ls" });

        /**
         * Calls Ls.
         * @function ls
         * @memberof river.River
         * @instance
         * @param {river.ILsRequest} request LsRequest message or plain object
         * @returns {Promise<river.LsResponse>} Promise
         * @variation 2
         */

        return River;
    })();

    river.LsCase = (function() {

        /**
         * Properties of a LsCase.
         * @memberof river
         * @interface ILsCase
         * @property {string|null} ["in"] LsCase in
         * @property {string|null} [out] LsCase out
         */

        /**
         * Constructs a new LsCase.
         * @memberof river
         * @classdesc Represents a LsCase.
         * @implements ILsCase
         * @constructor
         * @param {river.ILsCase=} [properties] Properties to set
         */
        function LsCase(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LsCase in.
         * @member {string} in
         * @memberof river.LsCase
         * @instance
         */
        LsCase.prototype["in"] = "";

        /**
         * LsCase out.
         * @member {string} out
         * @memberof river.LsCase
         * @instance
         */
        LsCase.prototype.out = "";

        /**
         * Creates a new LsCase instance using the specified properties.
         * @function create
         * @memberof river.LsCase
         * @static
         * @param {river.ILsCase=} [properties] Properties to set
         * @returns {river.LsCase} LsCase instance
         */
        LsCase.create = function create(properties) {
            return new LsCase(properties);
        };

        /**
         * Encodes the specified LsCase message. Does not implicitly {@link river.LsCase.verify|verify} messages.
         * @function encode
         * @memberof river.LsCase
         * @static
         * @param {river.ILsCase} message LsCase message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LsCase.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message["in"] != null && Object.hasOwnProperty.call(message, "in"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message["in"]);
            if (message.out != null && Object.hasOwnProperty.call(message, "out"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.out);
            return writer;
        };

        /**
         * Encodes the specified LsCase message, length delimited. Does not implicitly {@link river.LsCase.verify|verify} messages.
         * @function encodeDelimited
         * @memberof river.LsCase
         * @static
         * @param {river.ILsCase} message LsCase message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LsCase.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LsCase message from the specified reader or buffer.
         * @function decode
         * @memberof river.LsCase
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {river.LsCase} LsCase
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LsCase.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.river.LsCase();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message["in"] = reader.string();
                    break;
                case 2:
                    message.out = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LsCase message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof river.LsCase
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {river.LsCase} LsCase
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LsCase.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LsCase message.
         * @function verify
         * @memberof river.LsCase
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LsCase.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message["in"] != null && message.hasOwnProperty("in"))
                if (!$util.isString(message["in"]))
                    return "in: string expected";
            if (message.out != null && message.hasOwnProperty("out"))
                if (!$util.isString(message.out))
                    return "out: string expected";
            return null;
        };

        /**
         * Creates a LsCase message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof river.LsCase
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {river.LsCase} LsCase
         */
        LsCase.fromObject = function fromObject(object) {
            if (object instanceof $root.river.LsCase)
                return object;
            var message = new $root.river.LsCase();
            if (object["in"] != null)
                message["in"] = String(object["in"]);
            if (object.out != null)
                message.out = String(object.out);
            return message;
        };

        /**
         * Creates a plain object from a LsCase message. Also converts values to other types if specified.
         * @function toObject
         * @memberof river.LsCase
         * @static
         * @param {river.LsCase} message LsCase
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LsCase.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object["in"] = "";
                object.out = "";
            }
            if (message["in"] != null && message.hasOwnProperty("in"))
                object["in"] = message["in"];
            if (message.out != null && message.hasOwnProperty("out"))
                object.out = message.out;
            return object;
        };

        /**
         * Converts this LsCase to JSON.
         * @function toJSON
         * @memberof river.LsCase
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LsCase.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return LsCase;
    })();

    river.LsRequest = (function() {

        /**
         * Properties of a LsRequest.
         * @memberof river
         * @interface ILsRequest
         * @property {number|null} [pid] LsRequest pid
         */

        /**
         * Constructs a new LsRequest.
         * @memberof river
         * @classdesc Represents a LsRequest.
         * @implements ILsRequest
         * @constructor
         * @param {river.ILsRequest=} [properties] Properties to set
         */
        function LsRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LsRequest pid.
         * @member {number} pid
         * @memberof river.LsRequest
         * @instance
         */
        LsRequest.prototype.pid = 0;

        /**
         * Creates a new LsRequest instance using the specified properties.
         * @function create
         * @memberof river.LsRequest
         * @static
         * @param {river.ILsRequest=} [properties] Properties to set
         * @returns {river.LsRequest} LsRequest instance
         */
        LsRequest.create = function create(properties) {
            return new LsRequest(properties);
        };

        /**
         * Encodes the specified LsRequest message. Does not implicitly {@link river.LsRequest.verify|verify} messages.
         * @function encode
         * @memberof river.LsRequest
         * @static
         * @param {river.ILsRequest} message LsRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LsRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.pid != null && Object.hasOwnProperty.call(message, "pid"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.pid);
            return writer;
        };

        /**
         * Encodes the specified LsRequest message, length delimited. Does not implicitly {@link river.LsRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof river.LsRequest
         * @static
         * @param {river.ILsRequest} message LsRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LsRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LsRequest message from the specified reader or buffer.
         * @function decode
         * @memberof river.LsRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {river.LsRequest} LsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LsRequest.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.river.LsRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.pid = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LsRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof river.LsRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {river.LsRequest} LsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LsRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LsRequest message.
         * @function verify
         * @memberof river.LsRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LsRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.pid != null && message.hasOwnProperty("pid"))
                if (!$util.isInteger(message.pid))
                    return "pid: integer expected";
            return null;
        };

        /**
         * Creates a LsRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof river.LsRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {river.LsRequest} LsRequest
         */
        LsRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.river.LsRequest)
                return object;
            var message = new $root.river.LsRequest();
            if (object.pid != null)
                message.pid = object.pid | 0;
            return message;
        };

        /**
         * Creates a plain object from a LsRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof river.LsRequest
         * @static
         * @param {river.LsRequest} message LsRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LsRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.pid = 0;
            if (message.pid != null && message.hasOwnProperty("pid"))
                object.pid = message.pid;
            return object;
        };

        /**
         * Converts this LsRequest to JSON.
         * @function toJSON
         * @memberof river.LsRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LsRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return LsRequest;
    })();

    river.LsResponse = (function() {

        /**
         * Properties of a LsResponse.
         * @memberof river
         * @interface ILsResponse
         * @property {Array.<river.ILsCase>|null} [cases] LsResponse cases
         */

        /**
         * Constructs a new LsResponse.
         * @memberof river
         * @classdesc Represents a LsResponse.
         * @implements ILsResponse
         * @constructor
         * @param {river.ILsResponse=} [properties] Properties to set
         */
        function LsResponse(properties) {
            this.cases = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LsResponse cases.
         * @member {Array.<river.ILsCase>} cases
         * @memberof river.LsResponse
         * @instance
         */
        LsResponse.prototype.cases = $util.emptyArray;

        /**
         * Creates a new LsResponse instance using the specified properties.
         * @function create
         * @memberof river.LsResponse
         * @static
         * @param {river.ILsResponse=} [properties] Properties to set
         * @returns {river.LsResponse} LsResponse instance
         */
        LsResponse.create = function create(properties) {
            return new LsResponse(properties);
        };

        /**
         * Encodes the specified LsResponse message. Does not implicitly {@link river.LsResponse.verify|verify} messages.
         * @function encode
         * @memberof river.LsResponse
         * @static
         * @param {river.ILsResponse} message LsResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LsResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.cases != null && message.cases.length)
                for (var i = 0; i < message.cases.length; ++i)
                    $root.river.LsCase.encode(message.cases[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified LsResponse message, length delimited. Does not implicitly {@link river.LsResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof river.LsResponse
         * @static
         * @param {river.ILsResponse} message LsResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LsResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LsResponse message from the specified reader or buffer.
         * @function decode
         * @memberof river.LsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {river.LsResponse} LsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LsResponse.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.river.LsResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.cases && message.cases.length))
                        message.cases = [];
                    message.cases.push($root.river.LsCase.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LsResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof river.LsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {river.LsResponse} LsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LsResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LsResponse message.
         * @function verify
         * @memberof river.LsResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LsResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.cases != null && message.hasOwnProperty("cases")) {
                if (!Array.isArray(message.cases))
                    return "cases: array expected";
                for (var i = 0; i < message.cases.length; ++i) {
                    var error = $root.river.LsCase.verify(message.cases[i]);
                    if (error)
                        return "cases." + error;
                }
            }
            return null;
        };

        /**
         * Creates a LsResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof river.LsResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {river.LsResponse} LsResponse
         */
        LsResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.river.LsResponse)
                return object;
            var message = new $root.river.LsResponse();
            if (object.cases) {
                if (!Array.isArray(object.cases))
                    throw TypeError(".river.LsResponse.cases: array expected");
                message.cases = [];
                for (var i = 0; i < object.cases.length; ++i) {
                    if (typeof object.cases[i] !== "object")
                        throw TypeError(".river.LsResponse.cases: object expected");
                    message.cases[i] = $root.river.LsCase.fromObject(object.cases[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a LsResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof river.LsResponse
         * @static
         * @param {river.LsResponse} message LsResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LsResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.cases = [];
            if (message.cases && message.cases.length) {
                object.cases = [];
                for (var j = 0; j < message.cases.length; ++j)
                    object.cases[j] = $root.river.LsCase.toObject(message.cases[j], options);
            }
            return object;
        };

        /**
         * Converts this LsResponse to JSON.
         * @function toJSON
         * @memberof river.LsResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return LsResponse;
    })();

    river.Empty = (function() {

        /**
         * Properties of an Empty.
         * @memberof river
         * @interface IEmpty
         */

        /**
         * Constructs a new Empty.
         * @memberof river
         * @classdesc Represents an Empty.
         * @implements IEmpty
         * @constructor
         * @param {river.IEmpty=} [properties] Properties to set
         */
        function Empty(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new Empty instance using the specified properties.
         * @function create
         * @memberof river.Empty
         * @static
         * @param {river.IEmpty=} [properties] Properties to set
         * @returns {river.Empty} Empty instance
         */
        Empty.create = function create(properties) {
            return new Empty(properties);
        };

        /**
         * Encodes the specified Empty message. Does not implicitly {@link river.Empty.verify|verify} messages.
         * @function encode
         * @memberof river.Empty
         * @static
         * @param {river.IEmpty} message Empty message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Empty.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        /**
         * Encodes the specified Empty message, length delimited. Does not implicitly {@link river.Empty.verify|verify} messages.
         * @function encodeDelimited
         * @memberof river.Empty
         * @static
         * @param {river.IEmpty} message Empty message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Empty.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Empty message from the specified reader or buffer.
         * @function decode
         * @memberof river.Empty
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {river.Empty} Empty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Empty.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.river.Empty();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Empty message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof river.Empty
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {river.Empty} Empty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Empty.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Empty message.
         * @function verify
         * @memberof river.Empty
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Empty.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        /**
         * Creates an Empty message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof river.Empty
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {river.Empty} Empty
         */
        Empty.fromObject = function fromObject(object) {
            if (object instanceof $root.river.Empty)
                return object;
            return new $root.river.Empty();
        };

        /**
         * Creates a plain object from an Empty message. Also converts values to other types if specified.
         * @function toObject
         * @memberof river.Empty
         * @static
         * @param {river.Empty} message Empty
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Empty.toObject = function toObject() {
            return {};
        };

        /**
         * Converts this Empty to JSON.
         * @function toJSON
         * @memberof river.Empty
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Empty.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Empty;
    })();

    river.LanguageItem = (function() {

        /**
         * Properties of a LanguageItem.
         * @memberof river
         * @interface ILanguageItem
         * @property {string|null} [language] LanguageItem language
         * @property {string|null} [compile] LanguageItem compile
         * @property {string|null} [run] LanguageItem run
         * @property {string|null} [version] LanguageItem version
         */

        /**
         * Constructs a new LanguageItem.
         * @memberof river
         * @classdesc Represents a LanguageItem.
         * @implements ILanguageItem
         * @constructor
         * @param {river.ILanguageItem=} [properties] Properties to set
         */
        function LanguageItem(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LanguageItem language.
         * @member {string} language
         * @memberof river.LanguageItem
         * @instance
         */
        LanguageItem.prototype.language = "";

        /**
         * LanguageItem compile.
         * @member {string} compile
         * @memberof river.LanguageItem
         * @instance
         */
        LanguageItem.prototype.compile = "";

        /**
         * LanguageItem run.
         * @member {string} run
         * @memberof river.LanguageItem
         * @instance
         */
        LanguageItem.prototype.run = "";

        /**
         * LanguageItem version.
         * @member {string} version
         * @memberof river.LanguageItem
         * @instance
         */
        LanguageItem.prototype.version = "";

        /**
         * Creates a new LanguageItem instance using the specified properties.
         * @function create
         * @memberof river.LanguageItem
         * @static
         * @param {river.ILanguageItem=} [properties] Properties to set
         * @returns {river.LanguageItem} LanguageItem instance
         */
        LanguageItem.create = function create(properties) {
            return new LanguageItem(properties);
        };

        /**
         * Encodes the specified LanguageItem message. Does not implicitly {@link river.LanguageItem.verify|verify} messages.
         * @function encode
         * @memberof river.LanguageItem
         * @static
         * @param {river.ILanguageItem} message LanguageItem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LanguageItem.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.language != null && Object.hasOwnProperty.call(message, "language"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.language);
            if (message.compile != null && Object.hasOwnProperty.call(message, "compile"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.compile);
            if (message.run != null && Object.hasOwnProperty.call(message, "run"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.run);
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.version);
            return writer;
        };

        /**
         * Encodes the specified LanguageItem message, length delimited. Does not implicitly {@link river.LanguageItem.verify|verify} messages.
         * @function encodeDelimited
         * @memberof river.LanguageItem
         * @static
         * @param {river.ILanguageItem} message LanguageItem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LanguageItem.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LanguageItem message from the specified reader or buffer.
         * @function decode
         * @memberof river.LanguageItem
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {river.LanguageItem} LanguageItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LanguageItem.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.river.LanguageItem();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.language = reader.string();
                    break;
                case 2:
                    message.compile = reader.string();
                    break;
                case 3:
                    message.run = reader.string();
                    break;
                case 4:
                    message.version = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LanguageItem message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof river.LanguageItem
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {river.LanguageItem} LanguageItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LanguageItem.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LanguageItem message.
         * @function verify
         * @memberof river.LanguageItem
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LanguageItem.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.language != null && message.hasOwnProperty("language"))
                if (!$util.isString(message.language))
                    return "language: string expected";
            if (message.compile != null && message.hasOwnProperty("compile"))
                if (!$util.isString(message.compile))
                    return "compile: string expected";
            if (message.run != null && message.hasOwnProperty("run"))
                if (!$util.isString(message.run))
                    return "run: string expected";
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isString(message.version))
                    return "version: string expected";
            return null;
        };

        /**
         * Creates a LanguageItem message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof river.LanguageItem
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {river.LanguageItem} LanguageItem
         */
        LanguageItem.fromObject = function fromObject(object) {
            if (object instanceof $root.river.LanguageItem)
                return object;
            var message = new $root.river.LanguageItem();
            if (object.language != null)
                message.language = String(object.language);
            if (object.compile != null)
                message.compile = String(object.compile);
            if (object.run != null)
                message.run = String(object.run);
            if (object.version != null)
                message.version = String(object.version);
            return message;
        };

        /**
         * Creates a plain object from a LanguageItem message. Also converts values to other types if specified.
         * @function toObject
         * @memberof river.LanguageItem
         * @static
         * @param {river.LanguageItem} message LanguageItem
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LanguageItem.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.language = "";
                object.compile = "";
                object.run = "";
                object.version = "";
            }
            if (message.language != null && message.hasOwnProperty("language"))
                object.language = message.language;
            if (message.compile != null && message.hasOwnProperty("compile"))
                object.compile = message.compile;
            if (message.run != null && message.hasOwnProperty("run"))
                object.run = message.run;
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = message.version;
            return object;
        };

        /**
         * Converts this LanguageItem to JSON.
         * @function toJSON
         * @memberof river.LanguageItem
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LanguageItem.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return LanguageItem;
    })();

    river.LanguageConfigResponse = (function() {

        /**
         * Properties of a LanguageConfigResponse.
         * @memberof river
         * @interface ILanguageConfigResponse
         * @property {Array.<river.ILanguageItem>|null} [languages] LanguageConfigResponse languages
         */

        /**
         * Constructs a new LanguageConfigResponse.
         * @memberof river
         * @classdesc Represents a LanguageConfigResponse.
         * @implements ILanguageConfigResponse
         * @constructor
         * @param {river.ILanguageConfigResponse=} [properties] Properties to set
         */
        function LanguageConfigResponse(properties) {
            this.languages = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LanguageConfigResponse languages.
         * @member {Array.<river.ILanguageItem>} languages
         * @memberof river.LanguageConfigResponse
         * @instance
         */
        LanguageConfigResponse.prototype.languages = $util.emptyArray;

        /**
         * Creates a new LanguageConfigResponse instance using the specified properties.
         * @function create
         * @memberof river.LanguageConfigResponse
         * @static
         * @param {river.ILanguageConfigResponse=} [properties] Properties to set
         * @returns {river.LanguageConfigResponse} LanguageConfigResponse instance
         */
        LanguageConfigResponse.create = function create(properties) {
            return new LanguageConfigResponse(properties);
        };

        /**
         * Encodes the specified LanguageConfigResponse message. Does not implicitly {@link river.LanguageConfigResponse.verify|verify} messages.
         * @function encode
         * @memberof river.LanguageConfigResponse
         * @static
         * @param {river.ILanguageConfigResponse} message LanguageConfigResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LanguageConfigResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.languages != null && message.languages.length)
                for (var i = 0; i < message.languages.length; ++i)
                    $root.river.LanguageItem.encode(message.languages[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified LanguageConfigResponse message, length delimited. Does not implicitly {@link river.LanguageConfigResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof river.LanguageConfigResponse
         * @static
         * @param {river.ILanguageConfigResponse} message LanguageConfigResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LanguageConfigResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LanguageConfigResponse message from the specified reader or buffer.
         * @function decode
         * @memberof river.LanguageConfigResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {river.LanguageConfigResponse} LanguageConfigResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LanguageConfigResponse.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.river.LanguageConfigResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.languages && message.languages.length))
                        message.languages = [];
                    message.languages.push($root.river.LanguageItem.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LanguageConfigResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof river.LanguageConfigResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {river.LanguageConfigResponse} LanguageConfigResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LanguageConfigResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LanguageConfigResponse message.
         * @function verify
         * @memberof river.LanguageConfigResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LanguageConfigResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.languages != null && message.hasOwnProperty("languages")) {
                if (!Array.isArray(message.languages))
                    return "languages: array expected";
                for (var i = 0; i < message.languages.length; ++i) {
                    var error = $root.river.LanguageItem.verify(message.languages[i]);
                    if (error)
                        return "languages." + error;
                }
            }
            return null;
        };

        /**
         * Creates a LanguageConfigResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof river.LanguageConfigResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {river.LanguageConfigResponse} LanguageConfigResponse
         */
        LanguageConfigResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.river.LanguageConfigResponse)
                return object;
            var message = new $root.river.LanguageConfigResponse();
            if (object.languages) {
                if (!Array.isArray(object.languages))
                    throw TypeError(".river.LanguageConfigResponse.languages: array expected");
                message.languages = [];
                for (var i = 0; i < object.languages.length; ++i) {
                    if (typeof object.languages[i] !== "object")
                        throw TypeError(".river.LanguageConfigResponse.languages: object expected");
                    message.languages[i] = $root.river.LanguageItem.fromObject(object.languages[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a LanguageConfigResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof river.LanguageConfigResponse
         * @static
         * @param {river.LanguageConfigResponse} message LanguageConfigResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LanguageConfigResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.languages = [];
            if (message.languages && message.languages.length) {
                object.languages = [];
                for (var j = 0; j < message.languages.length; ++j)
                    object.languages[j] = $root.river.LanguageItem.toObject(message.languages[j], options);
            }
            return object;
        };

        /**
         * Converts this LanguageConfigResponse to JSON.
         * @function toJSON
         * @memberof river.LanguageConfigResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LanguageConfigResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return LanguageConfigResponse;
    })();

    river.CompileData = (function() {

        /**
         * Properties of a CompileData.
         * @memberof river
         * @interface ICompileData
         * @property {string|null} [language] CompileData language
         * @property {string|null} [code] CompileData code
         */

        /**
         * Constructs a new CompileData.
         * @memberof river
         * @classdesc Represents a CompileData.
         * @implements ICompileData
         * @constructor
         * @param {river.ICompileData=} [properties] Properties to set
         */
        function CompileData(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CompileData language.
         * @member {string} language
         * @memberof river.CompileData
         * @instance
         */
        CompileData.prototype.language = "";

        /**
         * CompileData code.
         * @member {string} code
         * @memberof river.CompileData
         * @instance
         */
        CompileData.prototype.code = "";

        /**
         * Creates a new CompileData instance using the specified properties.
         * @function create
         * @memberof river.CompileData
         * @static
         * @param {river.ICompileData=} [properties] Properties to set
         * @returns {river.CompileData} CompileData instance
         */
        CompileData.create = function create(properties) {
            return new CompileData(properties);
        };

        /**
         * Encodes the specified CompileData message. Does not implicitly {@link river.CompileData.verify|verify} messages.
         * @function encode
         * @memberof river.CompileData
         * @static
         * @param {river.ICompileData} message CompileData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CompileData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.language != null && Object.hasOwnProperty.call(message, "language"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.language);
            if (message.code != null && Object.hasOwnProperty.call(message, "code"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.code);
            return writer;
        };

        /**
         * Encodes the specified CompileData message, length delimited. Does not implicitly {@link river.CompileData.verify|verify} messages.
         * @function encodeDelimited
         * @memberof river.CompileData
         * @static
         * @param {river.ICompileData} message CompileData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CompileData.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CompileData message from the specified reader or buffer.
         * @function decode
         * @memberof river.CompileData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {river.CompileData} CompileData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CompileData.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.river.CompileData();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.language = reader.string();
                    break;
                case 2:
                    message.code = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CompileData message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof river.CompileData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {river.CompileData} CompileData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CompileData.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CompileData message.
         * @function verify
         * @memberof river.CompileData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CompileData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.language != null && message.hasOwnProperty("language"))
                if (!$util.isString(message.language))
                    return "language: string expected";
            if (message.code != null && message.hasOwnProperty("code"))
                if (!$util.isString(message.code))
                    return "code: string expected";
            return null;
        };

        /**
         * Creates a CompileData message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof river.CompileData
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {river.CompileData} CompileData
         */
        CompileData.fromObject = function fromObject(object) {
            if (object instanceof $root.river.CompileData)
                return object;
            var message = new $root.river.CompileData();
            if (object.language != null)
                message.language = String(object.language);
            if (object.code != null)
                message.code = String(object.code);
            return message;
        };

        /**
         * Creates a plain object from a CompileData message. Also converts values to other types if specified.
         * @function toObject
         * @memberof river.CompileData
         * @static
         * @param {river.CompileData} message CompileData
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CompileData.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.language = "";
                object.code = "";
            }
            if (message.language != null && message.hasOwnProperty("language"))
                object.language = message.language;
            if (message.code != null && message.hasOwnProperty("code"))
                object.code = message.code;
            return object;
        };

        /**
         * Converts this CompileData to JSON.
         * @function toJSON
         * @memberof river.CompileData
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CompileData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return CompileData;
    })();

    river.JudgeData = (function() {

        /**
         * Properties of a JudgeData.
         * @memberof river
         * @interface IJudgeData
         * @property {string|null} [inFile] JudgeData inFile
         * @property {string|null} [outFile] JudgeData outFile
         * @property {string|null} [spjFile] JudgeData spjFile
         * @property {number|null} [timeLimit] JudgeData timeLimit
         * @property {number|null} [memoryLimit] JudgeData memoryLimit
         * @property {river.JudgeType|null} [judgeType] JudgeData judgeType
         */

        /**
         * Constructs a new JudgeData.
         * @memberof river
         * @classdesc Represents a JudgeData.
         * @implements IJudgeData
         * @constructor
         * @param {river.IJudgeData=} [properties] Properties to set
         */
        function JudgeData(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * JudgeData inFile.
         * @member {string} inFile
         * @memberof river.JudgeData
         * @instance
         */
        JudgeData.prototype.inFile = "";

        /**
         * JudgeData outFile.
         * @member {string} outFile
         * @memberof river.JudgeData
         * @instance
         */
        JudgeData.prototype.outFile = "";

        /**
         * JudgeData spjFile.
         * @member {string} spjFile
         * @memberof river.JudgeData
         * @instance
         */
        JudgeData.prototype.spjFile = "";

        /**
         * JudgeData timeLimit.
         * @member {number} timeLimit
         * @memberof river.JudgeData
         * @instance
         */
        JudgeData.prototype.timeLimit = 0;

        /**
         * JudgeData memoryLimit.
         * @member {number} memoryLimit
         * @memberof river.JudgeData
         * @instance
         */
        JudgeData.prototype.memoryLimit = 0;

        /**
         * JudgeData judgeType.
         * @member {river.JudgeType} judgeType
         * @memberof river.JudgeData
         * @instance
         */
        JudgeData.prototype.judgeType = 0;

        /**
         * Creates a new JudgeData instance using the specified properties.
         * @function create
         * @memberof river.JudgeData
         * @static
         * @param {river.IJudgeData=} [properties] Properties to set
         * @returns {river.JudgeData} JudgeData instance
         */
        JudgeData.create = function create(properties) {
            return new JudgeData(properties);
        };

        /**
         * Encodes the specified JudgeData message. Does not implicitly {@link river.JudgeData.verify|verify} messages.
         * @function encode
         * @memberof river.JudgeData
         * @static
         * @param {river.IJudgeData} message JudgeData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        JudgeData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.inFile != null && Object.hasOwnProperty.call(message, "inFile"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.inFile);
            if (message.outFile != null && Object.hasOwnProperty.call(message, "outFile"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.outFile);
            if (message.timeLimit != null && Object.hasOwnProperty.call(message, "timeLimit"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.timeLimit);
            if (message.memoryLimit != null && Object.hasOwnProperty.call(message, "memoryLimit"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.memoryLimit);
            if (message.judgeType != null && Object.hasOwnProperty.call(message, "judgeType"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.judgeType);
            if (message.spjFile != null && Object.hasOwnProperty.call(message, "spjFile"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.spjFile);
            return writer;
        };

        /**
         * Encodes the specified JudgeData message, length delimited. Does not implicitly {@link river.JudgeData.verify|verify} messages.
         * @function encodeDelimited
         * @memberof river.JudgeData
         * @static
         * @param {river.IJudgeData} message JudgeData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        JudgeData.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a JudgeData message from the specified reader or buffer.
         * @function decode
         * @memberof river.JudgeData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {river.JudgeData} JudgeData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        JudgeData.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.river.JudgeData();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.inFile = reader.string();
                    break;
                case 2:
                    message.outFile = reader.string();
                    break;
                case 6:
                    message.spjFile = reader.string();
                    break;
                case 3:
                    message.timeLimit = reader.int32();
                    break;
                case 4:
                    message.memoryLimit = reader.int32();
                    break;
                case 5:
                    message.judgeType = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a JudgeData message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof river.JudgeData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {river.JudgeData} JudgeData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        JudgeData.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a JudgeData message.
         * @function verify
         * @memberof river.JudgeData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        JudgeData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.inFile != null && message.hasOwnProperty("inFile"))
                if (!$util.isString(message.inFile))
                    return "inFile: string expected";
            if (message.outFile != null && message.hasOwnProperty("outFile"))
                if (!$util.isString(message.outFile))
                    return "outFile: string expected";
            if (message.spjFile != null && message.hasOwnProperty("spjFile"))
                if (!$util.isString(message.spjFile))
                    return "spjFile: string expected";
            if (message.timeLimit != null && message.hasOwnProperty("timeLimit"))
                if (!$util.isInteger(message.timeLimit))
                    return "timeLimit: integer expected";
            if (message.memoryLimit != null && message.hasOwnProperty("memoryLimit"))
                if (!$util.isInteger(message.memoryLimit))
                    return "memoryLimit: integer expected";
            if (message.judgeType != null && message.hasOwnProperty("judgeType"))
                switch (message.judgeType) {
                default:
                    return "judgeType: enum value expected";
                case 0:
                case 1:
                    break;
                }
            return null;
        };

        /**
         * Creates a JudgeData message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof river.JudgeData
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {river.JudgeData} JudgeData
         */
        JudgeData.fromObject = function fromObject(object) {
            if (object instanceof $root.river.JudgeData)
                return object;
            var message = new $root.river.JudgeData();
            if (object.inFile != null)
                message.inFile = String(object.inFile);
            if (object.outFile != null)
                message.outFile = String(object.outFile);
            if (object.spjFile != null)
                message.spjFile = String(object.spjFile);
            if (object.timeLimit != null)
                message.timeLimit = object.timeLimit | 0;
            if (object.memoryLimit != null)
                message.memoryLimit = object.memoryLimit | 0;
            switch (object.judgeType) {
            case "Standard":
            case 0:
                message.judgeType = 0;
                break;
            case "Special":
            case 1:
                message.judgeType = 1;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from a JudgeData message. Also converts values to other types if specified.
         * @function toObject
         * @memberof river.JudgeData
         * @static
         * @param {river.JudgeData} message JudgeData
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        JudgeData.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.inFile = "";
                object.outFile = "";
                object.timeLimit = 0;
                object.memoryLimit = 0;
                object.judgeType = options.enums === String ? "Standard" : 0;
                object.spjFile = "";
            }
            if (message.inFile != null && message.hasOwnProperty("inFile"))
                object.inFile = message.inFile;
            if (message.outFile != null && message.hasOwnProperty("outFile"))
                object.outFile = message.outFile;
            if (message.timeLimit != null && message.hasOwnProperty("timeLimit"))
                object.timeLimit = message.timeLimit;
            if (message.memoryLimit != null && message.hasOwnProperty("memoryLimit"))
                object.memoryLimit = message.memoryLimit;
            if (message.judgeType != null && message.hasOwnProperty("judgeType"))
                object.judgeType = options.enums === String ? $root.river.JudgeType[message.judgeType] : message.judgeType;
            if (message.spjFile != null && message.hasOwnProperty("spjFile"))
                object.spjFile = message.spjFile;
            return object;
        };

        /**
         * Converts this JudgeData to JSON.
         * @function toJSON
         * @memberof river.JudgeData
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        JudgeData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return JudgeData;
    })();

    /**
     * JudgeType enum.
     * @name river.JudgeType
     * @enum {number}
     * @property {number} Standard=0 Standard value
     * @property {number} Special=1 Special value
     */
    river.JudgeType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "Standard"] = 0;
        values[valuesById[1] = "Special"] = 1;
        return values;
    })();

    river.JudgeRequest = (function() {

        /**
         * Properties of a JudgeRequest.
         * @memberof river
         * @interface IJudgeRequest
         * @property {river.ICompileData|null} [compileData] JudgeRequest compileData
         * @property {river.IJudgeData|null} [judgeData] JudgeRequest judgeData
         */

        /**
         * Constructs a new JudgeRequest.
         * @memberof river
         * @classdesc Represents a JudgeRequest.
         * @implements IJudgeRequest
         * @constructor
         * @param {river.IJudgeRequest=} [properties] Properties to set
         */
        function JudgeRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * JudgeRequest compileData.
         * @member {river.ICompileData|null|undefined} compileData
         * @memberof river.JudgeRequest
         * @instance
         */
        JudgeRequest.prototype.compileData = null;

        /**
         * JudgeRequest judgeData.
         * @member {river.IJudgeData|null|undefined} judgeData
         * @memberof river.JudgeRequest
         * @instance
         */
        JudgeRequest.prototype.judgeData = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * JudgeRequest data.
         * @member {"compileData"|"judgeData"|undefined} data
         * @memberof river.JudgeRequest
         * @instance
         */
        Object.defineProperty(JudgeRequest.prototype, "data", {
            get: $util.oneOfGetter($oneOfFields = ["compileData", "judgeData"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new JudgeRequest instance using the specified properties.
         * @function create
         * @memberof river.JudgeRequest
         * @static
         * @param {river.IJudgeRequest=} [properties] Properties to set
         * @returns {river.JudgeRequest} JudgeRequest instance
         */
        JudgeRequest.create = function create(properties) {
            return new JudgeRequest(properties);
        };

        /**
         * Encodes the specified JudgeRequest message. Does not implicitly {@link river.JudgeRequest.verify|verify} messages.
         * @function encode
         * @memberof river.JudgeRequest
         * @static
         * @param {river.IJudgeRequest} message JudgeRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        JudgeRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.compileData != null && Object.hasOwnProperty.call(message, "compileData"))
                $root.river.CompileData.encode(message.compileData, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.judgeData != null && Object.hasOwnProperty.call(message, "judgeData"))
                $root.river.JudgeData.encode(message.judgeData, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified JudgeRequest message, length delimited. Does not implicitly {@link river.JudgeRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof river.JudgeRequest
         * @static
         * @param {river.IJudgeRequest} message JudgeRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        JudgeRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a JudgeRequest message from the specified reader or buffer.
         * @function decode
         * @memberof river.JudgeRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {river.JudgeRequest} JudgeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        JudgeRequest.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.river.JudgeRequest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.compileData = $root.river.CompileData.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.judgeData = $root.river.JudgeData.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a JudgeRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof river.JudgeRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {river.JudgeRequest} JudgeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        JudgeRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a JudgeRequest message.
         * @function verify
         * @memberof river.JudgeRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        JudgeRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.compileData != null && message.hasOwnProperty("compileData")) {
                properties.data = 1;
                {
                    var error = $root.river.CompileData.verify(message.compileData);
                    if (error)
                        return "compileData." + error;
                }
            }
            if (message.judgeData != null && message.hasOwnProperty("judgeData")) {
                if (properties.data === 1)
                    return "data: multiple values";
                properties.data = 1;
                {
                    var error = $root.river.JudgeData.verify(message.judgeData);
                    if (error)
                        return "judgeData." + error;
                }
            }
            return null;
        };

        /**
         * Creates a JudgeRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof river.JudgeRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {river.JudgeRequest} JudgeRequest
         */
        JudgeRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.river.JudgeRequest)
                return object;
            var message = new $root.river.JudgeRequest();
            if (object.compileData != null) {
                if (typeof object.compileData !== "object")
                    throw TypeError(".river.JudgeRequest.compileData: object expected");
                message.compileData = $root.river.CompileData.fromObject(object.compileData);
            }
            if (object.judgeData != null) {
                if (typeof object.judgeData !== "object")
                    throw TypeError(".river.JudgeRequest.judgeData: object expected");
                message.judgeData = $root.river.JudgeData.fromObject(object.judgeData);
            }
            return message;
        };

        /**
         * Creates a plain object from a JudgeRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof river.JudgeRequest
         * @static
         * @param {river.JudgeRequest} message JudgeRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        JudgeRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (message.compileData != null && message.hasOwnProperty("compileData")) {
                object.compileData = $root.river.CompileData.toObject(message.compileData, options);
                if (options.oneofs)
                    object.data = "compileData";
            }
            if (message.judgeData != null && message.hasOwnProperty("judgeData")) {
                object.judgeData = $root.river.JudgeData.toObject(message.judgeData, options);
                if (options.oneofs)
                    object.data = "judgeData";
            }
            return object;
        };

        /**
         * Converts this JudgeRequest to JSON.
         * @function toJSON
         * @memberof river.JudgeRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        JudgeRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return JudgeRequest;
    })();

    /**
     * JudgeResultEnum enum.
     * @name river.JudgeResultEnum
     * @enum {number}
     * @property {number} Accepted=0 Accepted value
     * @property {number} WrongAnswer=1 WrongAnswer value
     * @property {number} TimeLimitExceeded=2 TimeLimitExceeded value
     * @property {number} MemoryLimitExceeded=3 MemoryLimitExceeded value
     * @property {number} RuntimeError=4 RuntimeError value
     * @property {number} OutputLimitExceeded=5 OutputLimitExceeded value
     * @property {number} CompileError=6 CompileError value
     * @property {number} PresentationError=7 PresentationError value
     * @property {number} SystemError=8 SystemError value
     * @property {number} CompileSuccess=9 CompileSuccess value
     */
    river.JudgeResultEnum = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "Accepted"] = 0;
        values[valuesById[1] = "WrongAnswer"] = 1;
        values[valuesById[2] = "TimeLimitExceeded"] = 2;
        values[valuesById[3] = "MemoryLimitExceeded"] = 3;
        values[valuesById[4] = "RuntimeError"] = 4;
        values[valuesById[5] = "OutputLimitExceeded"] = 5;
        values[valuesById[6] = "CompileError"] = 6;
        values[valuesById[7] = "PresentationError"] = 7;
        values[valuesById[8] = "SystemError"] = 8;
        values[valuesById[9] = "CompileSuccess"] = 9;
        return values;
    })();

    /**
     * JudgeStatus enum.
     * @name river.JudgeStatus
     * @enum {number}
     * @property {number} Pending=0 Pending value
     * @property {number} Running=1 Running value
     * @property {number} Ended=2 Ended value
     */
    river.JudgeStatus = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "Pending"] = 0;
        values[valuesById[1] = "Running"] = 1;
        values[valuesById[2] = "Ended"] = 2;
        return values;
    })();

    river.JudgeResult = (function() {

        /**
         * Properties of a JudgeResult.
         * @memberof river
         * @interface IJudgeResult
         * @property {Long|null} [timeUsed] JudgeResult timeUsed
         * @property {Long|null} [memoryUsed] JudgeResult memoryUsed
         * @property {river.JudgeResultEnum|null} [result] JudgeResult result
         * @property {string|null} [errmsg] JudgeResult errmsg
         * @property {string|null} [outmsg] JudgeResult outmsg
         */

        /**
         * Constructs a new JudgeResult.
         * @memberof river
         * @classdesc Represents a JudgeResult.
         * @implements IJudgeResult
         * @constructor
         * @param {river.IJudgeResult=} [properties] Properties to set
         */
        function JudgeResult(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * JudgeResult timeUsed.
         * @member {Long} timeUsed
         * @memberof river.JudgeResult
         * @instance
         */
        JudgeResult.prototype.timeUsed = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * JudgeResult memoryUsed.
         * @member {Long} memoryUsed
         * @memberof river.JudgeResult
         * @instance
         */
        JudgeResult.prototype.memoryUsed = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * JudgeResult result.
         * @member {river.JudgeResultEnum} result
         * @memberof river.JudgeResult
         * @instance
         */
        JudgeResult.prototype.result = 0;

        /**
         * JudgeResult errmsg.
         * @member {string} errmsg
         * @memberof river.JudgeResult
         * @instance
         */
        JudgeResult.prototype.errmsg = "";

        /**
         * JudgeResult outmsg.
         * @member {string} outmsg
         * @memberof river.JudgeResult
         * @instance
         */
        JudgeResult.prototype.outmsg = "";

        /**
         * Creates a new JudgeResult instance using the specified properties.
         * @function create
         * @memberof river.JudgeResult
         * @static
         * @param {river.IJudgeResult=} [properties] Properties to set
         * @returns {river.JudgeResult} JudgeResult instance
         */
        JudgeResult.create = function create(properties) {
            return new JudgeResult(properties);
        };

        /**
         * Encodes the specified JudgeResult message. Does not implicitly {@link river.JudgeResult.verify|verify} messages.
         * @function encode
         * @memberof river.JudgeResult
         * @static
         * @param {river.IJudgeResult} message JudgeResult message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        JudgeResult.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.timeUsed != null && Object.hasOwnProperty.call(message, "timeUsed"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.timeUsed);
            if (message.memoryUsed != null && Object.hasOwnProperty.call(message, "memoryUsed"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.memoryUsed);
            if (message.result != null && Object.hasOwnProperty.call(message, "result"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.result);
            if (message.errmsg != null && Object.hasOwnProperty.call(message, "errmsg"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.errmsg);
            if (message.outmsg != null && Object.hasOwnProperty.call(message, "outmsg"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.outmsg);
            return writer;
        };

        /**
         * Encodes the specified JudgeResult message, length delimited. Does not implicitly {@link river.JudgeResult.verify|verify} messages.
         * @function encodeDelimited
         * @memberof river.JudgeResult
         * @static
         * @param {river.IJudgeResult} message JudgeResult message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        JudgeResult.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a JudgeResult message from the specified reader or buffer.
         * @function decode
         * @memberof river.JudgeResult
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {river.JudgeResult} JudgeResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        JudgeResult.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.river.JudgeResult();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.timeUsed = reader.int64();
                    break;
                case 2:
                    message.memoryUsed = reader.int64();
                    break;
                case 3:
                    message.result = reader.int32();
                    break;
                case 4:
                    message.errmsg = reader.string();
                    break;
                case 5:
                    message.outmsg = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a JudgeResult message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof river.JudgeResult
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {river.JudgeResult} JudgeResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        JudgeResult.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a JudgeResult message.
         * @function verify
         * @memberof river.JudgeResult
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        JudgeResult.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.timeUsed != null && message.hasOwnProperty("timeUsed"))
                if (!$util.isInteger(message.timeUsed) && !(message.timeUsed && $util.isInteger(message.timeUsed.low) && $util.isInteger(message.timeUsed.high)))
                    return "timeUsed: integer|Long expected";
            if (message.memoryUsed != null && message.hasOwnProperty("memoryUsed"))
                if (!$util.isInteger(message.memoryUsed) && !(message.memoryUsed && $util.isInteger(message.memoryUsed.low) && $util.isInteger(message.memoryUsed.high)))
                    return "memoryUsed: integer|Long expected";
            if (message.result != null && message.hasOwnProperty("result"))
                switch (message.result) {
                default:
                    return "result: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                    break;
                }
            if (message.errmsg != null && message.hasOwnProperty("errmsg"))
                if (!$util.isString(message.errmsg))
                    return "errmsg: string expected";
            if (message.outmsg != null && message.hasOwnProperty("outmsg"))
                if (!$util.isString(message.outmsg))
                    return "outmsg: string expected";
            return null;
        };

        /**
         * Creates a JudgeResult message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof river.JudgeResult
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {river.JudgeResult} JudgeResult
         */
        JudgeResult.fromObject = function fromObject(object) {
            if (object instanceof $root.river.JudgeResult)
                return object;
            var message = new $root.river.JudgeResult();
            if (object.timeUsed != null)
                if ($util.Long)
                    (message.timeUsed = $util.Long.fromValue(object.timeUsed)).unsigned = false;
                else if (typeof object.timeUsed === "string")
                    message.timeUsed = parseInt(object.timeUsed, 10);
                else if (typeof object.timeUsed === "number")
                    message.timeUsed = object.timeUsed;
                else if (typeof object.timeUsed === "object")
                    message.timeUsed = new $util.LongBits(object.timeUsed.low >>> 0, object.timeUsed.high >>> 0).toNumber();
            if (object.memoryUsed != null)
                if ($util.Long)
                    (message.memoryUsed = $util.Long.fromValue(object.memoryUsed)).unsigned = false;
                else if (typeof object.memoryUsed === "string")
                    message.memoryUsed = parseInt(object.memoryUsed, 10);
                else if (typeof object.memoryUsed === "number")
                    message.memoryUsed = object.memoryUsed;
                else if (typeof object.memoryUsed === "object")
                    message.memoryUsed = new $util.LongBits(object.memoryUsed.low >>> 0, object.memoryUsed.high >>> 0).toNumber();
            switch (object.result) {
            case "Accepted":
            case 0:
                message.result = 0;
                break;
            case "WrongAnswer":
            case 1:
                message.result = 1;
                break;
            case "TimeLimitExceeded":
            case 2:
                message.result = 2;
                break;
            case "MemoryLimitExceeded":
            case 3:
                message.result = 3;
                break;
            case "RuntimeError":
            case 4:
                message.result = 4;
                break;
            case "OutputLimitExceeded":
            case 5:
                message.result = 5;
                break;
            case "CompileError":
            case 6:
                message.result = 6;
                break;
            case "PresentationError":
            case 7:
                message.result = 7;
                break;
            case "SystemError":
            case 8:
                message.result = 8;
                break;
            case "CompileSuccess":
            case 9:
                message.result = 9;
                break;
            }
            if (object.errmsg != null)
                message.errmsg = String(object.errmsg);
            if (object.outmsg != null)
                message.outmsg = String(object.outmsg);
            return message;
        };

        /**
         * Creates a plain object from a JudgeResult message. Also converts values to other types if specified.
         * @function toObject
         * @memberof river.JudgeResult
         * @static
         * @param {river.JudgeResult} message JudgeResult
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        JudgeResult.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.timeUsed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timeUsed = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.memoryUsed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.memoryUsed = options.longs === String ? "0" : 0;
                object.result = options.enums === String ? "Accepted" : 0;
                object.errmsg = "";
                object.outmsg = "";
            }
            if (message.timeUsed != null && message.hasOwnProperty("timeUsed"))
                if (typeof message.timeUsed === "number")
                    object.timeUsed = options.longs === String ? String(message.timeUsed) : message.timeUsed;
                else
                    object.timeUsed = options.longs === String ? $util.Long.prototype.toString.call(message.timeUsed) : options.longs === Number ? new $util.LongBits(message.timeUsed.low >>> 0, message.timeUsed.high >>> 0).toNumber() : message.timeUsed;
            if (message.memoryUsed != null && message.hasOwnProperty("memoryUsed"))
                if (typeof message.memoryUsed === "number")
                    object.memoryUsed = options.longs === String ? String(message.memoryUsed) : message.memoryUsed;
                else
                    object.memoryUsed = options.longs === String ? $util.Long.prototype.toString.call(message.memoryUsed) : options.longs === Number ? new $util.LongBits(message.memoryUsed.low >>> 0, message.memoryUsed.high >>> 0).toNumber() : message.memoryUsed;
            if (message.result != null && message.hasOwnProperty("result"))
                object.result = options.enums === String ? $root.river.JudgeResultEnum[message.result] : message.result;
            if (message.errmsg != null && message.hasOwnProperty("errmsg"))
                object.errmsg = message.errmsg;
            if (message.outmsg != null && message.hasOwnProperty("outmsg"))
                object.outmsg = message.outmsg;
            return object;
        };

        /**
         * Converts this JudgeResult to JSON.
         * @function toJSON
         * @memberof river.JudgeResult
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        JudgeResult.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return JudgeResult;
    })();

    river.JudgeResponse = (function() {

        /**
         * Properties of a JudgeResponse.
         * @memberof river
         * @interface IJudgeResponse
         * @property {river.IJudgeResult|null} [result] JudgeResponse result
         * @property {river.JudgeStatus|null} [status] JudgeResponse status
         */

        /**
         * Constructs a new JudgeResponse.
         * @memberof river
         * @classdesc Represents a JudgeResponse.
         * @implements IJudgeResponse
         * @constructor
         * @param {river.IJudgeResponse=} [properties] Properties to set
         */
        function JudgeResponse(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * JudgeResponse result.
         * @member {river.IJudgeResult|null|undefined} result
         * @memberof river.JudgeResponse
         * @instance
         */
        JudgeResponse.prototype.result = null;

        /**
         * JudgeResponse status.
         * @member {river.JudgeStatus} status
         * @memberof river.JudgeResponse
         * @instance
         */
        JudgeResponse.prototype.status = 0;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * JudgeResponse state.
         * @member {"result"|"status"|undefined} state
         * @memberof river.JudgeResponse
         * @instance
         */
        Object.defineProperty(JudgeResponse.prototype, "state", {
            get: $util.oneOfGetter($oneOfFields = ["result", "status"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new JudgeResponse instance using the specified properties.
         * @function create
         * @memberof river.JudgeResponse
         * @static
         * @param {river.IJudgeResponse=} [properties] Properties to set
         * @returns {river.JudgeResponse} JudgeResponse instance
         */
        JudgeResponse.create = function create(properties) {
            return new JudgeResponse(properties);
        };

        /**
         * Encodes the specified JudgeResponse message. Does not implicitly {@link river.JudgeResponse.verify|verify} messages.
         * @function encode
         * @memberof river.JudgeResponse
         * @static
         * @param {river.IJudgeResponse} message JudgeResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        JudgeResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.result != null && Object.hasOwnProperty.call(message, "result"))
                $root.river.JudgeResult.encode(message.result, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.status);
            return writer;
        };

        /**
         * Encodes the specified JudgeResponse message, length delimited. Does not implicitly {@link river.JudgeResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof river.JudgeResponse
         * @static
         * @param {river.IJudgeResponse} message JudgeResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        JudgeResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a JudgeResponse message from the specified reader or buffer.
         * @function decode
         * @memberof river.JudgeResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {river.JudgeResponse} JudgeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        JudgeResponse.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.river.JudgeResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.result = $root.river.JudgeResult.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.status = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a JudgeResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof river.JudgeResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {river.JudgeResponse} JudgeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        JudgeResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a JudgeResponse message.
         * @function verify
         * @memberof river.JudgeResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        JudgeResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.result != null && message.hasOwnProperty("result")) {
                properties.state = 1;
                {
                    var error = $root.river.JudgeResult.verify(message.result);
                    if (error)
                        return "result." + error;
                }
            }
            if (message.status != null && message.hasOwnProperty("status")) {
                if (properties.state === 1)
                    return "state: multiple values";
                properties.state = 1;
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            }
            return null;
        };

        /**
         * Creates a JudgeResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof river.JudgeResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {river.JudgeResponse} JudgeResponse
         */
        JudgeResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.river.JudgeResponse)
                return object;
            var message = new $root.river.JudgeResponse();
            if (object.result != null) {
                if (typeof object.result !== "object")
                    throw TypeError(".river.JudgeResponse.result: object expected");
                message.result = $root.river.JudgeResult.fromObject(object.result);
            }
            switch (object.status) {
            case "Pending":
            case 0:
                message.status = 0;
                break;
            case "Running":
            case 1:
                message.status = 1;
                break;
            case "Ended":
            case 2:
                message.status = 2;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from a JudgeResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof river.JudgeResponse
         * @static
         * @param {river.JudgeResponse} message JudgeResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        JudgeResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (message.result != null && message.hasOwnProperty("result")) {
                object.result = $root.river.JudgeResult.toObject(message.result, options);
                if (options.oneofs)
                    object.state = "result";
            }
            if (message.status != null && message.hasOwnProperty("status")) {
                object.status = options.enums === String ? $root.river.JudgeStatus[message.status] : message.status;
                if (options.oneofs)
                    object.state = "status";
            }
            return object;
        };

        /**
         * Converts this JudgeResponse to JSON.
         * @function toJSON
         * @memberof river.JudgeResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        JudgeResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return JudgeResponse;
    })();

    return river;
})();

module.exports = $root;

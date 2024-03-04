/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots.judge || ($protobuf.roots.judge = {});

$root.judge = (function() {

    /**
     * Namespace judge.
     * @exports judge
     * @namespace
     */
    var judge = {};

    /**
     * CodeEncodingEnum enum.
     * @name judge.CodeEncodingEnum
     * @enum {number}
     * @property {number} UTF8=0 UTF8 value
     * @property {number} GZIP=1 GZIP value
     */
    judge.CodeEncodingEnum = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "UTF8"] = 0;
        values[valuesById[1] = "GZIP"] = 1;
        return values;
    })();

    judge.Problem = (function() {

        /**
         * Properties of a Problem.
         * @memberof judge
         * @interface IProblem
         * @property {number|null} [problemId] Problem problemId
         * @property {number|null} [revision] Problem revision
         * @property {number|null} [timeLimit] Problem timeLimit
         * @property {number|null} [memoryLimit] Problem memoryLimit
         * @property {boolean|null} [spj] Problem spj
         */

        /**
         * Constructs a new Problem.
         * @memberof judge
         * @classdesc Represents a Problem.
         * @implements IProblem
         * @constructor
         * @param {judge.IProblem=} [properties] Properties to set
         */
        function Problem(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Problem problemId.
         * @member {number} problemId
         * @memberof judge.Problem
         * @instance
         */
        Problem.prototype.problemId = 0;

        /**
         * Problem revision.
         * @member {number} revision
         * @memberof judge.Problem
         * @instance
         */
        Problem.prototype.revision = 0;

        /**
         * Problem timeLimit.
         * @member {number} timeLimit
         * @memberof judge.Problem
         * @instance
         */
        Problem.prototype.timeLimit = 0;

        /**
         * Problem memoryLimit.
         * @member {number} memoryLimit
         * @memberof judge.Problem
         * @instance
         */
        Problem.prototype.memoryLimit = 0;

        /**
         * Problem spj.
         * @member {boolean} spj
         * @memberof judge.Problem
         * @instance
         */
        Problem.prototype.spj = false;

        /**
         * Creates a new Problem instance using the specified properties.
         * @function create
         * @memberof judge.Problem
         * @static
         * @param {judge.IProblem=} [properties] Properties to set
         * @returns {judge.Problem} Problem instance
         */
        Problem.create = function create(properties) {
            return new Problem(properties);
        };

        /**
         * Encodes the specified Problem message. Does not implicitly {@link judge.Problem.verify|verify} messages.
         * @function encode
         * @memberof judge.Problem
         * @static
         * @param {judge.IProblem} message Problem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Problem.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.problemId != null && Object.hasOwnProperty.call(message, "problemId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.problemId);
            if (message.revision != null && Object.hasOwnProperty.call(message, "revision"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.revision);
            if (message.timeLimit != null && Object.hasOwnProperty.call(message, "timeLimit"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.timeLimit);
            if (message.memoryLimit != null && Object.hasOwnProperty.call(message, "memoryLimit"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.memoryLimit);
            if (message.spj != null && Object.hasOwnProperty.call(message, "spj"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.spj);
            return writer;
        };

        /**
         * Encodes the specified Problem message, length delimited. Does not implicitly {@link judge.Problem.verify|verify} messages.
         * @function encodeDelimited
         * @memberof judge.Problem
         * @static
         * @param {judge.IProblem} message Problem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Problem.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Problem message from the specified reader or buffer.
         * @function decode
         * @memberof judge.Problem
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {judge.Problem} Problem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Problem.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.judge.Problem();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.problemId = reader.uint32();
                    break;
                case 2:
                    message.revision = reader.uint32();
                    break;
                case 3:
                    message.timeLimit = reader.uint32();
                    break;
                case 4:
                    message.memoryLimit = reader.uint32();
                    break;
                case 5:
                    message.spj = reader.bool();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Problem message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof judge.Problem
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {judge.Problem} Problem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Problem.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Problem message.
         * @function verify
         * @memberof judge.Problem
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Problem.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.problemId != null && message.hasOwnProperty("problemId"))
                if (!$util.isInteger(message.problemId))
                    return "problemId: integer expected";
            if (message.revision != null && message.hasOwnProperty("revision"))
                if (!$util.isInteger(message.revision))
                    return "revision: integer expected";
            if (message.timeLimit != null && message.hasOwnProperty("timeLimit"))
                if (!$util.isInteger(message.timeLimit))
                    return "timeLimit: integer expected";
            if (message.memoryLimit != null && message.hasOwnProperty("memoryLimit"))
                if (!$util.isInteger(message.memoryLimit))
                    return "memoryLimit: integer expected";
            if (message.spj != null && message.hasOwnProperty("spj"))
                if (typeof message.spj !== "boolean")
                    return "spj: boolean expected";
            return null;
        };

        /**
         * Creates a Problem message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof judge.Problem
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {judge.Problem} Problem
         */
        Problem.fromObject = function fromObject(object) {
            if (object instanceof $root.judge.Problem)
                return object;
            var message = new $root.judge.Problem();
            if (object.problemId != null)
                message.problemId = object.problemId >>> 0;
            if (object.revision != null)
                message.revision = object.revision >>> 0;
            if (object.timeLimit != null)
                message.timeLimit = object.timeLimit >>> 0;
            if (object.memoryLimit != null)
                message.memoryLimit = object.memoryLimit >>> 0;
            if (object.spj != null)
                message.spj = Boolean(object.spj);
            return message;
        };

        /**
         * Creates a plain object from a Problem message. Also converts values to other types if specified.
         * @function toObject
         * @memberof judge.Problem
         * @static
         * @param {judge.Problem} message Problem
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Problem.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.problemId = 0;
                object.revision = 0;
                object.timeLimit = 0;
                object.memoryLimit = 0;
                object.spj = false;
            }
            if (message.problemId != null && message.hasOwnProperty("problemId"))
                object.problemId = message.problemId;
            if (message.revision != null && message.hasOwnProperty("revision"))
                object.revision = message.revision;
            if (message.timeLimit != null && message.hasOwnProperty("timeLimit"))
                object.timeLimit = message.timeLimit;
            if (message.memoryLimit != null && message.hasOwnProperty("memoryLimit"))
                object.memoryLimit = message.memoryLimit;
            if (message.spj != null && message.hasOwnProperty("spj"))
                object.spj = message.spj;
            return object;
        };

        /**
         * Converts this Problem to JSON.
         * @function toJSON
         * @memberof judge.Problem
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Problem.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Problem;
    })();

    judge.User = (function() {

        /**
         * Properties of a User.
         * @memberof judge
         * @interface IUser
         * @property {number|null} [userId] User userId
         */

        /**
         * Constructs a new User.
         * @memberof judge
         * @classdesc Represents a User.
         * @implements IUser
         * @constructor
         * @param {judge.IUser=} [properties] Properties to set
         */
        function User(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * User userId.
         * @member {number} userId
         * @memberof judge.User
         * @instance
         */
        User.prototype.userId = 0;

        /**
         * Creates a new User instance using the specified properties.
         * @function create
         * @memberof judge.User
         * @static
         * @param {judge.IUser=} [properties] Properties to set
         * @returns {judge.User} User instance
         */
        User.create = function create(properties) {
            return new User(properties);
        };

        /**
         * Encodes the specified User message. Does not implicitly {@link judge.User.verify|verify} messages.
         * @function encode
         * @memberof judge.User
         * @static
         * @param {judge.IUser} message User message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        User.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.userId);
            return writer;
        };

        /**
         * Encodes the specified User message, length delimited. Does not implicitly {@link judge.User.verify|verify} messages.
         * @function encodeDelimited
         * @memberof judge.User
         * @static
         * @param {judge.IUser} message User message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        User.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a User message from the specified reader or buffer.
         * @function decode
         * @memberof judge.User
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {judge.User} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        User.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.judge.User();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.userId = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a User message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof judge.User
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {judge.User} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        User.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a User message.
         * @function verify
         * @memberof judge.User
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        User.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (!$util.isInteger(message.userId))
                    return "userId: integer expected";
            return null;
        };

        /**
         * Creates a User message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof judge.User
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {judge.User} User
         */
        User.fromObject = function fromObject(object) {
            if (object instanceof $root.judge.User)
                return object;
            var message = new $root.judge.User();
            if (object.userId != null)
                message.userId = object.userId >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a User message. Also converts values to other types if specified.
         * @function toObject
         * @memberof judge.User
         * @static
         * @param {judge.User} message User
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        User.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.userId = 0;
            if (message.userId != null && message.hasOwnProperty("userId"))
                object.userId = message.userId;
            return object;
        };

        /**
         * Converts this User to JSON.
         * @function toJSON
         * @memberof judge.User
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        User.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return User;
    })();

    judge.Competition = (function() {

        /**
         * Properties of a Competition.
         * @memberof judge
         * @interface ICompetition
         * @property {number|null} [competitionId] Competition competitionId
         */

        /**
         * Constructs a new Competition.
         * @memberof judge
         * @classdesc Represents a Competition.
         * @implements ICompetition
         * @constructor
         * @param {judge.ICompetition=} [properties] Properties to set
         */
        function Competition(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Competition competitionId.
         * @member {number} competitionId
         * @memberof judge.Competition
         * @instance
         */
        Competition.prototype.competitionId = 0;

        /**
         * Creates a new Competition instance using the specified properties.
         * @function create
         * @memberof judge.Competition
         * @static
         * @param {judge.ICompetition=} [properties] Properties to set
         * @returns {judge.Competition} Competition instance
         */
        Competition.create = function create(properties) {
            return new Competition(properties);
        };

        /**
         * Encodes the specified Competition message. Does not implicitly {@link judge.Competition.verify|verify} messages.
         * @function encode
         * @memberof judge.Competition
         * @static
         * @param {judge.ICompetition} message Competition message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Competition.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.competitionId != null && Object.hasOwnProperty.call(message, "competitionId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.competitionId);
            return writer;
        };

        /**
         * Encodes the specified Competition message, length delimited. Does not implicitly {@link judge.Competition.verify|verify} messages.
         * @function encodeDelimited
         * @memberof judge.Competition
         * @static
         * @param {judge.ICompetition} message Competition message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Competition.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Competition message from the specified reader or buffer.
         * @function decode
         * @memberof judge.Competition
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {judge.Competition} Competition
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Competition.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.judge.Competition();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.competitionId = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Competition message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof judge.Competition
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {judge.Competition} Competition
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Competition.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Competition message.
         * @function verify
         * @memberof judge.Competition
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Competition.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.competitionId != null && message.hasOwnProperty("competitionId"))
                if (!$util.isInteger(message.competitionId))
                    return "competitionId: integer expected";
            return null;
        };

        /**
         * Creates a Competition message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof judge.Competition
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {judge.Competition} Competition
         */
        Competition.fromObject = function fromObject(object) {
            if (object instanceof $root.judge.Competition)
                return object;
            var message = new $root.judge.Competition();
            if (object.competitionId != null)
                message.competitionId = object.competitionId >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a Competition message. Also converts values to other types if specified.
         * @function toObject
         * @memberof judge.Competition
         * @static
         * @param {judge.Competition} message Competition
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Competition.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.competitionId = 0;
            if (message.competitionId != null && message.hasOwnProperty("competitionId"))
                object.competitionId = message.competitionId;
            return object;
        };

        /**
         * Converts this Competition to JSON.
         * @function toJSON
         * @memberof judge.Competition
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Competition.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Competition;
    })();

    judge.JudgeTask = (function() {

        /**
         * Properties of a JudgeTask.
         * @memberof judge
         * @interface IJudgeTask
         * @property {number|null} [judgeInfoId] JudgeTask judgeInfoId
         * @property {number|null} [solutionId] JudgeTask solutionId
         * @property {judge.IProblem|null} [problem] JudgeTask problem
         * @property {judge.IUser|null} [user] JudgeTask user
         * @property {judge.ICompetition|null} [competition] JudgeTask competition
         * @property {string|null} [language] JudgeTask language
         * @property {judge.CodeEncodingEnum|null} [codeEncoding] JudgeTask codeEncoding
         * @property {Uint8Array|null} [code] JudgeTask code
         */

        /**
         * Constructs a new JudgeTask.
         * @memberof judge
         * @classdesc Represents a JudgeTask.
         * @implements IJudgeTask
         * @constructor
         * @param {judge.IJudgeTask=} [properties] Properties to set
         */
        function JudgeTask(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * JudgeTask judgeInfoId.
         * @member {number} judgeInfoId
         * @memberof judge.JudgeTask
         * @instance
         */
        JudgeTask.prototype.judgeInfoId = 0;

        /**
         * JudgeTask solutionId.
         * @member {number} solutionId
         * @memberof judge.JudgeTask
         * @instance
         */
        JudgeTask.prototype.solutionId = 0;

        /**
         * JudgeTask problem.
         * @member {judge.IProblem|null|undefined} problem
         * @memberof judge.JudgeTask
         * @instance
         */
        JudgeTask.prototype.problem = null;

        /**
         * JudgeTask user.
         * @member {judge.IUser|null|undefined} user
         * @memberof judge.JudgeTask
         * @instance
         */
        JudgeTask.prototype.user = null;

        /**
         * JudgeTask competition.
         * @member {judge.ICompetition|null|undefined} competition
         * @memberof judge.JudgeTask
         * @instance
         */
        JudgeTask.prototype.competition = null;

        /**
         * JudgeTask language.
         * @member {string} language
         * @memberof judge.JudgeTask
         * @instance
         */
        JudgeTask.prototype.language = "";

        /**
         * JudgeTask codeEncoding.
         * @member {judge.CodeEncodingEnum} codeEncoding
         * @memberof judge.JudgeTask
         * @instance
         */
        JudgeTask.prototype.codeEncoding = 0;

        /**
         * JudgeTask code.
         * @member {Uint8Array} code
         * @memberof judge.JudgeTask
         * @instance
         */
        JudgeTask.prototype.code = $util.newBuffer([]);

        /**
         * Creates a new JudgeTask instance using the specified properties.
         * @function create
         * @memberof judge.JudgeTask
         * @static
         * @param {judge.IJudgeTask=} [properties] Properties to set
         * @returns {judge.JudgeTask} JudgeTask instance
         */
        JudgeTask.create = function create(properties) {
            return new JudgeTask(properties);
        };

        /**
         * Encodes the specified JudgeTask message. Does not implicitly {@link judge.JudgeTask.verify|verify} messages.
         * @function encode
         * @memberof judge.JudgeTask
         * @static
         * @param {judge.IJudgeTask} message JudgeTask message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        JudgeTask.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.judgeInfoId != null && Object.hasOwnProperty.call(message, "judgeInfoId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.judgeInfoId);
            if (message.solutionId != null && Object.hasOwnProperty.call(message, "solutionId"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.solutionId);
            if (message.problem != null && Object.hasOwnProperty.call(message, "problem"))
                $root.judge.Problem.encode(message.problem, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.user != null && Object.hasOwnProperty.call(message, "user"))
                $root.judge.User.encode(message.user, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.competition != null && Object.hasOwnProperty.call(message, "competition"))
                $root.judge.Competition.encode(message.competition, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.language != null && Object.hasOwnProperty.call(message, "language"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.language);
            if (message.codeEncoding != null && Object.hasOwnProperty.call(message, "codeEncoding"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.codeEncoding);
            if (message.code != null && Object.hasOwnProperty.call(message, "code"))
                writer.uint32(/* id 8, wireType 2 =*/66).bytes(message.code);
            return writer;
        };

        /**
         * Encodes the specified JudgeTask message, length delimited. Does not implicitly {@link judge.JudgeTask.verify|verify} messages.
         * @function encodeDelimited
         * @memberof judge.JudgeTask
         * @static
         * @param {judge.IJudgeTask} message JudgeTask message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        JudgeTask.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a JudgeTask message from the specified reader or buffer.
         * @function decode
         * @memberof judge.JudgeTask
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {judge.JudgeTask} JudgeTask
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        JudgeTask.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.judge.JudgeTask();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.judgeInfoId = reader.uint32();
                    break;
                case 2:
                    message.solutionId = reader.uint32();
                    break;
                case 3:
                    message.problem = $root.judge.Problem.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.user = $root.judge.User.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.competition = $root.judge.Competition.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.language = reader.string();
                    break;
                case 7:
                    message.codeEncoding = reader.int32();
                    break;
                case 8:
                    message.code = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a JudgeTask message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof judge.JudgeTask
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {judge.JudgeTask} JudgeTask
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        JudgeTask.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a JudgeTask message.
         * @function verify
         * @memberof judge.JudgeTask
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        JudgeTask.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.judgeInfoId != null && message.hasOwnProperty("judgeInfoId"))
                if (!$util.isInteger(message.judgeInfoId))
                    return "judgeInfoId: integer expected";
            if (message.solutionId != null && message.hasOwnProperty("solutionId"))
                if (!$util.isInteger(message.solutionId))
                    return "solutionId: integer expected";
            if (message.problem != null && message.hasOwnProperty("problem")) {
                var error = $root.judge.Problem.verify(message.problem);
                if (error)
                    return "problem." + error;
            }
            if (message.user != null && message.hasOwnProperty("user")) {
                var error = $root.judge.User.verify(message.user);
                if (error)
                    return "user." + error;
            }
            if (message.competition != null && message.hasOwnProperty("competition")) {
                var error = $root.judge.Competition.verify(message.competition);
                if (error)
                    return "competition." + error;
            }
            if (message.language != null && message.hasOwnProperty("language"))
                if (!$util.isString(message.language))
                    return "language: string expected";
            if (message.codeEncoding != null && message.hasOwnProperty("codeEncoding"))
                switch (message.codeEncoding) {
                default:
                    return "codeEncoding: enum value expected";
                case 0:
                case 1:
                    break;
                }
            if (message.code != null && message.hasOwnProperty("code"))
                if (!(message.code && typeof message.code.length === "number" || $util.isString(message.code)))
                    return "code: buffer expected";
            return null;
        };

        /**
         * Creates a JudgeTask message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof judge.JudgeTask
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {judge.JudgeTask} JudgeTask
         */
        JudgeTask.fromObject = function fromObject(object) {
            if (object instanceof $root.judge.JudgeTask)
                return object;
            var message = new $root.judge.JudgeTask();
            if (object.judgeInfoId != null)
                message.judgeInfoId = object.judgeInfoId >>> 0;
            if (object.solutionId != null)
                message.solutionId = object.solutionId >>> 0;
            if (object.problem != null) {
                if (typeof object.problem !== "object")
                    throw TypeError(".judge.JudgeTask.problem: object expected");
                message.problem = $root.judge.Problem.fromObject(object.problem);
            }
            if (object.user != null) {
                if (typeof object.user !== "object")
                    throw TypeError(".judge.JudgeTask.user: object expected");
                message.user = $root.judge.User.fromObject(object.user);
            }
            if (object.competition != null) {
                if (typeof object.competition !== "object")
                    throw TypeError(".judge.JudgeTask.competition: object expected");
                message.competition = $root.judge.Competition.fromObject(object.competition);
            }
            if (object.language != null)
                message.language = String(object.language);
            switch (object.codeEncoding) {
            case "UTF8":
            case 0:
                message.codeEncoding = 0;
                break;
            case "GZIP":
            case 1:
                message.codeEncoding = 1;
                break;
            }
            if (object.code != null)
                if (typeof object.code === "string")
                    $util.base64.decode(object.code, message.code = $util.newBuffer($util.base64.length(object.code)), 0);
                else if (object.code.length)
                    message.code = object.code;
            return message;
        };

        /**
         * Creates a plain object from a JudgeTask message. Also converts values to other types if specified.
         * @function toObject
         * @memberof judge.JudgeTask
         * @static
         * @param {judge.JudgeTask} message JudgeTask
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        JudgeTask.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.judgeInfoId = 0;
                object.solutionId = 0;
                object.problem = null;
                object.user = null;
                object.competition = null;
                object.language = "";
                object.codeEncoding = options.enums === String ? "UTF8" : 0;
                if (options.bytes === String)
                    object.code = "";
                else {
                    object.code = [];
                    if (options.bytes !== Array)
                        object.code = $util.newBuffer(object.code);
                }
            }
            if (message.judgeInfoId != null && message.hasOwnProperty("judgeInfoId"))
                object.judgeInfoId = message.judgeInfoId;
            if (message.solutionId != null && message.hasOwnProperty("solutionId"))
                object.solutionId = message.solutionId;
            if (message.problem != null && message.hasOwnProperty("problem"))
                object.problem = $root.judge.Problem.toObject(message.problem, options);
            if (message.user != null && message.hasOwnProperty("user"))
                object.user = $root.judge.User.toObject(message.user, options);
            if (message.competition != null && message.hasOwnProperty("competition"))
                object.competition = $root.judge.Competition.toObject(message.competition, options);
            if (message.language != null && message.hasOwnProperty("language"))
                object.language = message.language;
            if (message.codeEncoding != null && message.hasOwnProperty("codeEncoding"))
                object.codeEncoding = options.enums === String ? $root.judge.CodeEncodingEnum[message.codeEncoding] : message.codeEncoding;
            if (message.code != null && message.hasOwnProperty("code"))
                object.code = options.bytes === String ? $util.base64.encode(message.code, 0, message.code.length) : options.bytes === Array ? Array.prototype.slice.call(message.code) : message.code;
            return object;
        };

        /**
         * Converts this JudgeTask to JSON.
         * @function toJSON
         * @memberof judge.JudgeTask
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        JudgeTask.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return JudgeTask;
    })();

    return judge;
})();

module.exports = $root;

import * as $protobuf from "protobufjs";
/** Namespace river. */
export namespace river {

    /** Represents a River */
    class River extends $protobuf.rpc.Service {

        /**
         * Constructs a new River service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new River service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): River;

        /**
         * Calls Judge.
         * @param request JudgeRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and JudgeResponse
         */
        public judge(request: river.IJudgeRequest, callback: river.River.JudgeCallback): void;

        /**
         * Calls Judge.
         * @param request JudgeRequest message or plain object
         * @returns Promise
         */
        public judge(request: river.IJudgeRequest): Promise<river.JudgeResponse>;

        /**
         * Calls LanguageConfig.
         * @param request Empty message or plain object
         * @param callback Node-style callback called with the error, if any, and LanguageConfigResponse
         */
        public languageConfig(request: river.IEmpty, callback: river.River.LanguageConfigCallback): void;

        /**
         * Calls LanguageConfig.
         * @param request Empty message or plain object
         * @returns Promise
         */
        public languageConfig(request: river.IEmpty): Promise<river.LanguageConfigResponse>;

        /**
         * Calls Ls.
         * @param request LsRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and LsResponse
         */
        public ls(request: river.ILsRequest, callback: river.River.LsCallback): void;

        /**
         * Calls Ls.
         * @param request LsRequest message or plain object
         * @returns Promise
         */
        public ls(request: river.ILsRequest): Promise<river.LsResponse>;
    }

    namespace River {

        /**
         * Callback as used by {@link river.River#judge}.
         * @param error Error, if any
         * @param [response] JudgeResponse
         */
        type JudgeCallback = (error: (Error|null), response?: river.JudgeResponse) => void;

        /**
         * Callback as used by {@link river.River#languageConfig}.
         * @param error Error, if any
         * @param [response] LanguageConfigResponse
         */
        type LanguageConfigCallback = (error: (Error|null), response?: river.LanguageConfigResponse) => void;

        /**
         * Callback as used by {@link river.River#ls}.
         * @param error Error, if any
         * @param [response] LsResponse
         */
        type LsCallback = (error: (Error|null), response?: river.LsResponse) => void;
    }

    /** Properties of a LsCase. */
    interface ILsCase {

        /** LsCase in */
        "in"?: (string|null);

        /** LsCase out */
        out?: (string|null);
    }

    /** Represents a LsCase. */
    class LsCase implements ILsCase {

        /**
         * Constructs a new LsCase.
         * @param [properties] Properties to set
         */
        constructor(properties?: river.ILsCase);

        /** LsCase in. */
        public in: string;

        /** LsCase out. */
        public out: string;

        /**
         * Creates a new LsCase instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LsCase instance
         */
        public static create(properties?: river.ILsCase): river.LsCase;

        /**
         * Encodes the specified LsCase message. Does not implicitly {@link river.LsCase.verify|verify} messages.
         * @param message LsCase message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: river.ILsCase, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified LsCase message, length delimited. Does not implicitly {@link river.LsCase.verify|verify} messages.
         * @param message LsCase message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: river.ILsCase, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LsCase message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns LsCase
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): river.LsCase;

        /**
         * Decodes a LsCase message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns LsCase
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): river.LsCase;

        /**
         * Verifies a LsCase message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a LsCase message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns LsCase
         */
        public static fromObject(object: { [k: string]: any }): river.LsCase;

        /**
         * Creates a plain object from a LsCase message. Also converts values to other types if specified.
         * @param message LsCase
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: river.LsCase, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this LsCase to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a LsRequest. */
    interface ILsRequest {

        /** LsRequest pid */
        pid?: (number|null);
    }

    /** Represents a LsRequest. */
    class LsRequest implements ILsRequest {

        /**
         * Constructs a new LsRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: river.ILsRequest);

        /** LsRequest pid. */
        public pid: number;

        /**
         * Creates a new LsRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LsRequest instance
         */
        public static create(properties?: river.ILsRequest): river.LsRequest;

        /**
         * Encodes the specified LsRequest message. Does not implicitly {@link river.LsRequest.verify|verify} messages.
         * @param message LsRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: river.ILsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified LsRequest message, length delimited. Does not implicitly {@link river.LsRequest.verify|verify} messages.
         * @param message LsRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: river.ILsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LsRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns LsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): river.LsRequest;

        /**
         * Decodes a LsRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns LsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): river.LsRequest;

        /**
         * Verifies a LsRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a LsRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns LsRequest
         */
        public static fromObject(object: { [k: string]: any }): river.LsRequest;

        /**
         * Creates a plain object from a LsRequest message. Also converts values to other types if specified.
         * @param message LsRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: river.LsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this LsRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a LsResponse. */
    interface ILsResponse {

        /** LsResponse cases */
        cases?: (river.ILsCase[]|null);
    }

    /** Represents a LsResponse. */
    class LsResponse implements ILsResponse {

        /**
         * Constructs a new LsResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: river.ILsResponse);

        /** LsResponse cases. */
        public cases: river.ILsCase[];

        /**
         * Creates a new LsResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LsResponse instance
         */
        public static create(properties?: river.ILsResponse): river.LsResponse;

        /**
         * Encodes the specified LsResponse message. Does not implicitly {@link river.LsResponse.verify|verify} messages.
         * @param message LsResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: river.ILsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified LsResponse message, length delimited. Does not implicitly {@link river.LsResponse.verify|verify} messages.
         * @param message LsResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: river.ILsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LsResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns LsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): river.LsResponse;

        /**
         * Decodes a LsResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns LsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): river.LsResponse;

        /**
         * Verifies a LsResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a LsResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns LsResponse
         */
        public static fromObject(object: { [k: string]: any }): river.LsResponse;

        /**
         * Creates a plain object from a LsResponse message. Also converts values to other types if specified.
         * @param message LsResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: river.LsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this LsResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an Empty. */
    interface IEmpty {
    }

    /** Represents an Empty. */
    class Empty implements IEmpty {

        /**
         * Constructs a new Empty.
         * @param [properties] Properties to set
         */
        constructor(properties?: river.IEmpty);

        /**
         * Creates a new Empty instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Empty instance
         */
        public static create(properties?: river.IEmpty): river.Empty;

        /**
         * Encodes the specified Empty message. Does not implicitly {@link river.Empty.verify|verify} messages.
         * @param message Empty message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: river.IEmpty, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Empty message, length delimited. Does not implicitly {@link river.Empty.verify|verify} messages.
         * @param message Empty message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: river.IEmpty, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Empty message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Empty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): river.Empty;

        /**
         * Decodes an Empty message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Empty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): river.Empty;

        /**
         * Verifies an Empty message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Empty message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Empty
         */
        public static fromObject(object: { [k: string]: any }): river.Empty;

        /**
         * Creates a plain object from an Empty message. Also converts values to other types if specified.
         * @param message Empty
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: river.Empty, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Empty to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a LanguageItem. */
    interface ILanguageItem {

        /** LanguageItem language */
        language?: (string|null);

        /** LanguageItem compile */
        compile?: (string|null);

        /** LanguageItem run */
        run?: (string|null);

        /** LanguageItem version */
        version?: (string|null);
    }

    /** Represents a LanguageItem. */
    class LanguageItem implements ILanguageItem {

        /**
         * Constructs a new LanguageItem.
         * @param [properties] Properties to set
         */
        constructor(properties?: river.ILanguageItem);

        /** LanguageItem language. */
        public language: string;

        /** LanguageItem compile. */
        public compile: string;

        /** LanguageItem run. */
        public run: string;

        /** LanguageItem version. */
        public version: string;

        /**
         * Creates a new LanguageItem instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LanguageItem instance
         */
        public static create(properties?: river.ILanguageItem): river.LanguageItem;

        /**
         * Encodes the specified LanguageItem message. Does not implicitly {@link river.LanguageItem.verify|verify} messages.
         * @param message LanguageItem message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: river.ILanguageItem, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified LanguageItem message, length delimited. Does not implicitly {@link river.LanguageItem.verify|verify} messages.
         * @param message LanguageItem message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: river.ILanguageItem, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LanguageItem message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns LanguageItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): river.LanguageItem;

        /**
         * Decodes a LanguageItem message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns LanguageItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): river.LanguageItem;

        /**
         * Verifies a LanguageItem message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a LanguageItem message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns LanguageItem
         */
        public static fromObject(object: { [k: string]: any }): river.LanguageItem;

        /**
         * Creates a plain object from a LanguageItem message. Also converts values to other types if specified.
         * @param message LanguageItem
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: river.LanguageItem, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this LanguageItem to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a LanguageConfigResponse. */
    interface ILanguageConfigResponse {

        /** LanguageConfigResponse languages */
        languages?: (river.ILanguageItem[]|null);
    }

    /** Represents a LanguageConfigResponse. */
    class LanguageConfigResponse implements ILanguageConfigResponse {

        /**
         * Constructs a new LanguageConfigResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: river.ILanguageConfigResponse);

        /** LanguageConfigResponse languages. */
        public languages: river.ILanguageItem[];

        /**
         * Creates a new LanguageConfigResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LanguageConfigResponse instance
         */
        public static create(properties?: river.ILanguageConfigResponse): river.LanguageConfigResponse;

        /**
         * Encodes the specified LanguageConfigResponse message. Does not implicitly {@link river.LanguageConfigResponse.verify|verify} messages.
         * @param message LanguageConfigResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: river.ILanguageConfigResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified LanguageConfigResponse message, length delimited. Does not implicitly {@link river.LanguageConfigResponse.verify|verify} messages.
         * @param message LanguageConfigResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: river.ILanguageConfigResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LanguageConfigResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns LanguageConfigResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): river.LanguageConfigResponse;

        /**
         * Decodes a LanguageConfigResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns LanguageConfigResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): river.LanguageConfigResponse;

        /**
         * Verifies a LanguageConfigResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a LanguageConfigResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns LanguageConfigResponse
         */
        public static fromObject(object: { [k: string]: any }): river.LanguageConfigResponse;

        /**
         * Creates a plain object from a LanguageConfigResponse message. Also converts values to other types if specified.
         * @param message LanguageConfigResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: river.LanguageConfigResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this LanguageConfigResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a CompileData. */
    interface ICompileData {

        /** CompileData language */
        language?: (string|null);

        /** CompileData code */
        code?: (string|null);
    }

    /** Represents a CompileData. */
    class CompileData implements ICompileData {

        /**
         * Constructs a new CompileData.
         * @param [properties] Properties to set
         */
        constructor(properties?: river.ICompileData);

        /** CompileData language. */
        public language: string;

        /** CompileData code. */
        public code: string;

        /**
         * Creates a new CompileData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CompileData instance
         */
        public static create(properties?: river.ICompileData): river.CompileData;

        /**
         * Encodes the specified CompileData message. Does not implicitly {@link river.CompileData.verify|verify} messages.
         * @param message CompileData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: river.ICompileData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CompileData message, length delimited. Does not implicitly {@link river.CompileData.verify|verify} messages.
         * @param message CompileData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: river.ICompileData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CompileData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CompileData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): river.CompileData;

        /**
         * Decodes a CompileData message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CompileData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): river.CompileData;

        /**
         * Verifies a CompileData message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CompileData message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CompileData
         */
        public static fromObject(object: { [k: string]: any }): river.CompileData;

        /**
         * Creates a plain object from a CompileData message. Also converts values to other types if specified.
         * @param message CompileData
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: river.CompileData, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CompileData to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a JudgeData. */
    interface IJudgeData {

        /** JudgeData inFile */
        inFile?: (string|null);

        /** JudgeData outFile */
        outFile?: (string|null);

        /** JudgeData timeLimit */
        timeLimit?: (number|null);

        /** JudgeData memoryLimit */
        memoryLimit?: (number|null);

        /** JudgeData judgeType */
        judgeType?: (river.JudgeType|null);
    }

    /** Represents a JudgeData. */
    class JudgeData implements IJudgeData {

        /**
         * Constructs a new JudgeData.
         * @param [properties] Properties to set
         */
        constructor(properties?: river.IJudgeData);

        /** JudgeData inFile. */
        public inFile: string;

        /** JudgeData outFile. */
        public outFile: string;

        /** JudgeData timeLimit. */
        public timeLimit: number;

        /** JudgeData memoryLimit. */
        public memoryLimit: number;

        /** JudgeData judgeType. */
        public judgeType: river.JudgeType;

        /**
         * Creates a new JudgeData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns JudgeData instance
         */
        public static create(properties?: river.IJudgeData): river.JudgeData;

        /**
         * Encodes the specified JudgeData message. Does not implicitly {@link river.JudgeData.verify|verify} messages.
         * @param message JudgeData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: river.IJudgeData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified JudgeData message, length delimited. Does not implicitly {@link river.JudgeData.verify|verify} messages.
         * @param message JudgeData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: river.IJudgeData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a JudgeData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns JudgeData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): river.JudgeData;

        /**
         * Decodes a JudgeData message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns JudgeData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): river.JudgeData;

        /**
         * Verifies a JudgeData message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a JudgeData message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns JudgeData
         */
        public static fromObject(object: { [k: string]: any }): river.JudgeData;

        /**
         * Creates a plain object from a JudgeData message. Also converts values to other types if specified.
         * @param message JudgeData
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: river.JudgeData, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this JudgeData to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** JudgeType enum. */
    enum JudgeType {
        Standard = 0
    }

    /** Properties of a JudgeRequest. */
    interface IJudgeRequest {

        /** JudgeRequest compileData */
        compileData?: (river.ICompileData|null);

        /** JudgeRequest judgeData */
        judgeData?: (river.IJudgeData|null);
    }

    /** Represents a JudgeRequest. */
    class JudgeRequest implements IJudgeRequest {

        /**
         * Constructs a new JudgeRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: river.IJudgeRequest);

        /** JudgeRequest compileData. */
        public compileData?: (river.ICompileData|null);

        /** JudgeRequest judgeData. */
        public judgeData?: (river.IJudgeData|null);

        /** JudgeRequest data. */
        public data?: ("compileData"|"judgeData");

        /**
         * Creates a new JudgeRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns JudgeRequest instance
         */
        public static create(properties?: river.IJudgeRequest): river.JudgeRequest;

        /**
         * Encodes the specified JudgeRequest message. Does not implicitly {@link river.JudgeRequest.verify|verify} messages.
         * @param message JudgeRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: river.IJudgeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified JudgeRequest message, length delimited. Does not implicitly {@link river.JudgeRequest.verify|verify} messages.
         * @param message JudgeRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: river.IJudgeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a JudgeRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns JudgeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): river.JudgeRequest;

        /**
         * Decodes a JudgeRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns JudgeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): river.JudgeRequest;

        /**
         * Verifies a JudgeRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a JudgeRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns JudgeRequest
         */
        public static fromObject(object: { [k: string]: any }): river.JudgeRequest;

        /**
         * Creates a plain object from a JudgeRequest message. Also converts values to other types if specified.
         * @param message JudgeRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: river.JudgeRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this JudgeRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** JudgeResultEnum enum. */
    enum JudgeResultEnum {
        Accepted = 0,
        WrongAnswer = 1,
        TimeLimitExceeded = 2,
        MemoryLimitExceeded = 3,
        RuntimeError = 4,
        OutputLimitExceeded = 5,
        CompileError = 6,
        PresentationError = 7,
        SystemError = 8,
        CompileSuccess = 9
    }

    /** JudgeStatus enum. */
    enum JudgeStatus {
        Pending = 0,
        Running = 1,
        Ended = 2
    }

    /** Properties of a JudgeResult. */
    interface IJudgeResult {

        /** JudgeResult timeUsed */
        timeUsed?: (Long|null);

        /** JudgeResult memoryUsed */
        memoryUsed?: (Long|null);

        /** JudgeResult result */
        result?: (river.JudgeResultEnum|null);

        /** JudgeResult errmsg */
        errmsg?: (string|null);
    }

    /** Represents a JudgeResult. */
    class JudgeResult implements IJudgeResult {

        /**
         * Constructs a new JudgeResult.
         * @param [properties] Properties to set
         */
        constructor(properties?: river.IJudgeResult);

        /** JudgeResult timeUsed. */
        public timeUsed: Long;

        /** JudgeResult memoryUsed. */
        public memoryUsed: Long;

        /** JudgeResult result. */
        public result: river.JudgeResultEnum;

        /** JudgeResult errmsg. */
        public errmsg: string;

        /**
         * Creates a new JudgeResult instance using the specified properties.
         * @param [properties] Properties to set
         * @returns JudgeResult instance
         */
        public static create(properties?: river.IJudgeResult): river.JudgeResult;

        /**
         * Encodes the specified JudgeResult message. Does not implicitly {@link river.JudgeResult.verify|verify} messages.
         * @param message JudgeResult message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: river.IJudgeResult, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified JudgeResult message, length delimited. Does not implicitly {@link river.JudgeResult.verify|verify} messages.
         * @param message JudgeResult message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: river.IJudgeResult, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a JudgeResult message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns JudgeResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): river.JudgeResult;

        /**
         * Decodes a JudgeResult message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns JudgeResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): river.JudgeResult;

        /**
         * Verifies a JudgeResult message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a JudgeResult message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns JudgeResult
         */
        public static fromObject(object: { [k: string]: any }): river.JudgeResult;

        /**
         * Creates a plain object from a JudgeResult message. Also converts values to other types if specified.
         * @param message JudgeResult
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: river.JudgeResult, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this JudgeResult to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a JudgeResponse. */
    interface IJudgeResponse {

        /** JudgeResponse result */
        result?: (river.IJudgeResult|null);

        /** JudgeResponse status */
        status?: (river.JudgeStatus|null);
    }

    /** Represents a JudgeResponse. */
    class JudgeResponse implements IJudgeResponse {

        /**
         * Constructs a new JudgeResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: river.IJudgeResponse);

        /** JudgeResponse result. */
        public result?: (river.IJudgeResult|null);

        /** JudgeResponse status. */
        public status: river.JudgeStatus;

        /** JudgeResponse state. */
        public state?: ("result"|"status");

        /**
         * Creates a new JudgeResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns JudgeResponse instance
         */
        public static create(properties?: river.IJudgeResponse): river.JudgeResponse;

        /**
         * Encodes the specified JudgeResponse message. Does not implicitly {@link river.JudgeResponse.verify|verify} messages.
         * @param message JudgeResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: river.IJudgeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified JudgeResponse message, length delimited. Does not implicitly {@link river.JudgeResponse.verify|verify} messages.
         * @param message JudgeResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: river.IJudgeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a JudgeResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns JudgeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): river.JudgeResponse;

        /**
         * Decodes a JudgeResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns JudgeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): river.JudgeResponse;

        /**
         * Verifies a JudgeResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a JudgeResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns JudgeResponse
         */
        public static fromObject(object: { [k: string]: any }): river.JudgeResponse;

        /**
         * Creates a plain object from a JudgeResponse message. Also converts values to other types if specified.
         * @param message JudgeResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: river.JudgeResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this JudgeResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}

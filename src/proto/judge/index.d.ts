import * as $protobuf from "protobufjs";
/** Namespace judge. */
export namespace judge {

    /** CodeEncodingEnum enum. */
    enum CodeEncodingEnum {
        UTF8 = 0,
        GZIP = 1
    }

    /** Properties of a Problem. */
    interface IProblem {

        /** Problem problemId */
        problemId?: (number|null);

        /** Problem revision */
        revision?: (number|null);

        /** Problem timeLimit */
        timeLimit?: (number|null);

        /** Problem memoryLimit */
        memoryLimit?: (number|null);

        /** Problem spj */
        spj?: (boolean|null);
    }

    /** Represents a Problem. */
    class Problem implements IProblem {

        /**
         * Constructs a new Problem.
         * @param [properties] Properties to set
         */
        constructor(properties?: judge.IProblem);

        /** Problem problemId. */
        public problemId: number;

        /** Problem revision. */
        public revision: number;

        /** Problem timeLimit. */
        public timeLimit: number;

        /** Problem memoryLimit. */
        public memoryLimit: number;

        /** Problem spj. */
        public spj: boolean;

        /**
         * Creates a new Problem instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Problem instance
         */
        public static create(properties?: judge.IProblem): judge.Problem;

        /**
         * Encodes the specified Problem message. Does not implicitly {@link judge.Problem.verify|verify} messages.
         * @param message Problem message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: judge.IProblem, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Problem message, length delimited. Does not implicitly {@link judge.Problem.verify|verify} messages.
         * @param message Problem message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: judge.IProblem, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Problem message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Problem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): judge.Problem;

        /**
         * Decodes a Problem message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Problem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): judge.Problem;

        /**
         * Verifies a Problem message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Problem message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Problem
         */
        public static fromObject(object: { [k: string]: any }): judge.Problem;

        /**
         * Creates a plain object from a Problem message. Also converts values to other types if specified.
         * @param message Problem
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: judge.Problem, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Problem to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a User. */
    interface IUser {

        /** User userId */
        userId?: (number|null);
    }

    /** Represents a User. */
    class User implements IUser {

        /**
         * Constructs a new User.
         * @param [properties] Properties to set
         */
        constructor(properties?: judge.IUser);

        /** User userId. */
        public userId: number;

        /**
         * Creates a new User instance using the specified properties.
         * @param [properties] Properties to set
         * @returns User instance
         */
        public static create(properties?: judge.IUser): judge.User;

        /**
         * Encodes the specified User message. Does not implicitly {@link judge.User.verify|verify} messages.
         * @param message User message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: judge.IUser, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified User message, length delimited. Does not implicitly {@link judge.User.verify|verify} messages.
         * @param message User message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: judge.IUser, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a User message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): judge.User;

        /**
         * Decodes a User message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): judge.User;

        /**
         * Verifies a User message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a User message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns User
         */
        public static fromObject(object: { [k: string]: any }): judge.User;

        /**
         * Creates a plain object from a User message. Also converts values to other types if specified.
         * @param message User
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: judge.User, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this User to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Competition. */
    interface ICompetition {

        /** Competition competitionId */
        competitionId?: (number|null);
    }

    /** Represents a Competition. */
    class Competition implements ICompetition {

        /**
         * Constructs a new Competition.
         * @param [properties] Properties to set
         */
        constructor(properties?: judge.ICompetition);

        /** Competition competitionId. */
        public competitionId: number;

        /**
         * Creates a new Competition instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Competition instance
         */
        public static create(properties?: judge.ICompetition): judge.Competition;

        /**
         * Encodes the specified Competition message. Does not implicitly {@link judge.Competition.verify|verify} messages.
         * @param message Competition message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: judge.ICompetition, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Competition message, length delimited. Does not implicitly {@link judge.Competition.verify|verify} messages.
         * @param message Competition message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: judge.ICompetition, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Competition message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Competition
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): judge.Competition;

        /**
         * Decodes a Competition message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Competition
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): judge.Competition;

        /**
         * Verifies a Competition message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Competition message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Competition
         */
        public static fromObject(object: { [k: string]: any }): judge.Competition;

        /**
         * Creates a plain object from a Competition message. Also converts values to other types if specified.
         * @param message Competition
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: judge.Competition, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Competition to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a JudgeTask. */
    interface IJudgeTask {

        /** JudgeTask judgeInfoId */
        judgeInfoId?: (number|null);

        /** JudgeTask solutionId */
        solutionId?: (number|null);

        /** JudgeTask problem */
        problem?: (judge.IProblem|null);

        /** JudgeTask user */
        user?: (judge.IUser|null);

        /** JudgeTask competition */
        competition?: (judge.ICompetition|null);

        /** JudgeTask language */
        language?: (string|null);

        /** JudgeTask codeEncoding */
        codeEncoding?: (judge.CodeEncodingEnum|null);

        /** JudgeTask code */
        code?: (Uint8Array|null);
    }

    /** Represents a JudgeTask. */
    class JudgeTask implements IJudgeTask {

        /**
         * Constructs a new JudgeTask.
         * @param [properties] Properties to set
         */
        constructor(properties?: judge.IJudgeTask);

        /** JudgeTask judgeInfoId. */
        public judgeInfoId: number;

        /** JudgeTask solutionId. */
        public solutionId: number;

        /** JudgeTask problem. */
        public problem?: (judge.IProblem|null);

        /** JudgeTask user. */
        public user?: (judge.IUser|null);

        /** JudgeTask competition. */
        public competition?: (judge.ICompetition|null);

        /** JudgeTask language. */
        public language: string;

        /** JudgeTask codeEncoding. */
        public codeEncoding: judge.CodeEncodingEnum;

        /** JudgeTask code. */
        public code: Uint8Array;

        /**
         * Creates a new JudgeTask instance using the specified properties.
         * @param [properties] Properties to set
         * @returns JudgeTask instance
         */
        public static create(properties?: judge.IJudgeTask): judge.JudgeTask;

        /**
         * Encodes the specified JudgeTask message. Does not implicitly {@link judge.JudgeTask.verify|verify} messages.
         * @param message JudgeTask message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: judge.IJudgeTask, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified JudgeTask message, length delimited. Does not implicitly {@link judge.JudgeTask.verify|verify} messages.
         * @param message JudgeTask message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: judge.IJudgeTask, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a JudgeTask message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns JudgeTask
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): judge.JudgeTask;

        /**
         * Decodes a JudgeTask message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns JudgeTask
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): judge.JudgeTask;

        /**
         * Verifies a JudgeTask message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a JudgeTask message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns JudgeTask
         */
        public static fromObject(object: { [k: string]: any }): judge.JudgeTask;

        /**
         * Creates a plain object from a JudgeTask message. Also converts values to other types if specified.
         * @param message JudgeTask
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: judge.JudgeTask, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this JudgeTask to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}

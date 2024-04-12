import type { TypesaurusCore } from "typesaurus";

export namespace TypesaurusRecovery {
  export interface Recover {
    <SP extends AnySP>(at: Date | number | string, query: SP): GetResult<SP>;

    <SPS extends readonly AnySP[] | []>(
      at: Date | number | string,
      queries: SPS
    ): Promise<{
      -readonly [Index in keyof SPS]: GetResult<SPS[Index]>;
    }>;
  }

  export type GetResult<SP extends AnySP> =
    SP extends TypesaurusCore.SubscriptionPromise<any, infer Result, any>
      ? Result
      : never;

  export type AnySP = TypesaurusCore.SubscriptionPromise<any, any, any>;
}

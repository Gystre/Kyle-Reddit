import { Cache, QueryInput } from "@urql/exchange-graphcache";

//this function allows us to properly cast the types for AUTO COMPLETION
export function betterUpdateQuery<Result, Query>(
    cache: Cache,
    qi: QueryInput,
    result: any,
    fn: (r: Result, q: Query) => Query
) {
    return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

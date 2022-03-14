import type { WhereFilterOp, OrderByDirection } from 'firebase/firestore';

interface Limit {
	limit: number;
}
interface SortBy {
	sortBy: string;
	direction?: OrderByDirection;
}
interface Where {
	field: string;
	value: unknown;
	op: WhereFilterOp;
}
export type QueryClause = SortBy | Where | Limit;

export const isSortBy = (query: QueryClause): query is SortBy => {
	return (query as SortBy).sortBy != null;
};
export const isLimit = (query: QueryClause): query is Limit => {
	return (query as Limit).limit != null;
};
export const isWhere = (query: QueryClause): query is Where => {
	return (query as Where).op != null;
};

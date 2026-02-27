export function hotScore(upvotes: number, downvotes: number, createdAt: string): number {
  const score = upvotes - downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds = (new Date(createdAt).getTime() / 1000) - 1134028003; // Reddit epoch
  return sign * order + seconds / 45000;
}

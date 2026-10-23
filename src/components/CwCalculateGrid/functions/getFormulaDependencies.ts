export default (formula: string) => {
  const matches = formula.match(/\b(?!\d+\b)\w+(?:\.\w+)?\b/g)
  const uniqueMatches = matches ? Array.from(new Set(matches)) : []
  return uniqueMatches
}

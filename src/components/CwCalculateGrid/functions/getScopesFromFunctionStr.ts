export default (functionStr: string) => {
  const matches = Array.from(
    functionStr.matchAll(/\b([a-zA-Z_$][\w$]*)\.\w+\b/g),
    m => m[1],
  )
  const uniqueMatches = matches ? Array.from(new Set(matches)) : []
  return uniqueMatches
}

function Badge({ kind = "neutral", children }) {
  return <span className={`badge badge--${kind}`}>{children}</span>;
}
 
export default Badge;

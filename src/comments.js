export default ({ leadingComments }) => {
  const commentData = { hasComments: false };
  if (!leadingComments || !leadingComments.length) return commentData;

  const lines = leadingComments
    .map(cmt =>
      cmt.value
        .split('\n')
        .map(part => part.trim())
        .filter(i => i)
    )
    .reduce((arr, curr) => arr.concat(curr), []);

  return {
    hasComments: true,
    lines
  };
};

import React from "react";

const Post = React.memo(({ post }) => {
  console.log("Rendering post:", post.title);
  return (
    <div>
      <p>{post.title}</p>
      <p>{post.playDate}</p>
    </div>
  );
});

export default Post;

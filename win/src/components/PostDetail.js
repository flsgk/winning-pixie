import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "../firebase";

function PostDetail() {
  const { id } = useParams(); // URL에서 ID 가져오기
  console.log("Fetched ID from URL:", id); // 디버깅

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching post with ID:", id); // URL 파라미터 확인
    const postRef = ref(database, `posts/${id}`); // posts 밑에 해당 ID 경로
    get(postRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log("Post data:", snapshot.val()); // 데이터 가져오기 확인
          setPost(snapshot.val());
        } else {
          console.log("No data found for this ID");
          setPost(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching post data:", error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>로딩 중...</p>;
  if (!post) return <p>글을 찾을 수 없습니다.</p>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>작성일: {post.createdDate}</p>
      <p>경기 날짜: {post.playDate}</p>
      <p>팀: {post.team}</p>
    </div>
  );
}

export default PostDetail;

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";

function PostList() {
  const { date } = useParams(); // URL에서 클릭된 날짜 가져오기
  const allPosts = useSelector((state) => state.posts.posts); // Redux에서 모든 글 가져오기
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    // 선택한 날짜에 해당하는 글 필터링
    const postsForDate = allPosts.filter((post) => {
      // 단순히 날짜 문자열을 비교
      return post.playDate === date; // '2024-04-10' 형식으로 비교
    });
    setFilteredPosts(postsForDate);
  }, [date, allPosts]);

  return (
    <div>
      <h2>{date} 직관 메이트 모집</h2>
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <div key={post.id}>
            <h4>{post.title}</h4>
            <p>{post.content}</p>
          </div>
        ))
      ) : (
        <p>이 날짜에 작성된 글이 없습니다.</p>
      )}
      <Link to="/">홈으로 돌아가기</Link>
    </div>
  );
}

export default PostList;

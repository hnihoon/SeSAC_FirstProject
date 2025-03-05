import React, { useState } from 'react';
import styles from './MyPage.module.css';
import Dropdown from './Dropdown'; // 드롭다운 컴포넌트 import
import { useSelector } from 'react-redux';
import { api } from '../api/api';

const MyPage = () => {
  const initState = {
    myTimepapers: [
      { id: 1, title: 'Project Plan' },
      { id: 2, title: 'Weekly Goals' },
      { id: 3, title: 'Team Meeting Notes' },
    ],
    myPostits: [
      { id: 1, content: 'Buy groceries' },
      { id: 2, content: 'Prepare presentation' },
      { id: 3, content: 'Call the client' },
    ],
  };

  const [currentTab, setCurrentTab] = useState('timepapers'); // 현재 선택된 탭
  const [myInfo] = useState(initState.myInfo);
  const [myTimepapers] = useState(initState.myTimepapers);
  const [myPostits] = useState(initState.myPostits);

  const email = useSelector((state) => state.auth.email);

  const handleActionClick = (path) => {
    console.log(`${path}로 이동`); // 경로 처리 로직 추가
    // 필요 시 navigate(path)로 경로 이동 구현 가능
  };

  const handlePostitTap = async () => {
    setCurrentTab('postits');
    const response = await api.getMyTimePapers(email);
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.header}>
        <button className={styles.backButton}>←</button>
        <h2 className={styles.title}>마이페이지</h2>
        <button className={styles.homeButton}>🏠</button>
      </header>

      {/* 이메일 정보 */}
      <div className={styles.email}>{email}</div>

      {/* 탭 버튼 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${currentTab === 'timepapers' ? styles.active : ''}`}
          onClick={() => setCurrentTab('timepapers')}
        >
          내가 작성한 롤링페이퍼
        </button>
        <button
          className={`${styles.tabButton} ${currentTab === 'postits' ? styles.active : ''}`}
          onClick={handlePostitTap}
        >
          내가 작성한 포스트잇
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className={styles.content}>
        {currentTab === 'timepapers' && (
          <ul>
            {myTimepapers.map((timepaper) => (
              <li key={timepaper.id} className={styles.listItem}>
                {timepaper.title}
              </li>
            ))}
          </ul>
        )}
        {currentTab === 'postits' && (
          <ul>
            {myPostits.map((postit) => (
              <li key={postit.id} className={styles.listItem}>
                {postit.content}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 드롭다운 메뉴 */}
      <Dropdown onActionClick={handleActionClick} />
    </div>
  );
};

export default MyPage;

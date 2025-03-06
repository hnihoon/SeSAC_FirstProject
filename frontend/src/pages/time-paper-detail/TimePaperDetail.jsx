import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/slices/headerSlice';
import { api } from '../../api/api';
import styles from './TimePaperDetail.module.css';
import BottomButton from '../../components/BottomButton/BottomButton';
import ConfirmModal from '../../components/confirmmodal/ConfirmModal';
import Modal from '../../components/Modal/Modal';

import { finishLoading, startLoading } from '../../store/slices/loadingSlice';

export default function TimePaperDetail() {
  const { timepaperId } = useParams();
  const dispatch = useDispatch();
  const [timepaper, setTimepaper] = useState(null);
  const [postits, setPostits] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPostit, setSelectedPostit] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const userEmail = useSelector((state) => state.auth.email || '');
  const observerTarget = useRef(null);

  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isLoadingRef = useRef(false); // isLoading을 useRef로 변경

  useEffect(() => {
    const fetchTimepaper = async () => {
      dispatch(startLoading());
      try {
        const timePaperResponse = await api.getTimepaper(timepaperId);
        if (timePaperResponse && timePaperResponse.data && timePaperResponse.data.data) {
          const timePaperData = timePaperResponse.data.data;
          if (timePaperData.locked) {
            navigate(`/timepaper/${timepaperId}/lock`, { replace: true });
            return;
          }

          setTimepaper(timePaperData);
          dispatch(setPageTitle('타임페이퍼'));
        }
      } catch (error) {
        setIsError(true);
        if (error.response && error.response.status === 404) {
          setErrorMessage('해당 타임페이퍼는 존재하지 않습니다.');
        } else {
          setErrorMessage('타임페이퍼 데이터를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        dispatch(finishLoading());
      }
    };

    fetchTimepaper();
  }, [timepaperId, dispatch]);

  const fetchPostits = async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    isLoadingRef.current = true; // 로딩 시작

    try {
      const response = await api.getPostits(timepaperId, {
        page: pageRef.current,
        size: 10,
      });

      if (response?.data?.data?.postits?.length > 0) {
        setPostits((prev) => {
          const newPostits = response.data.data.postits;
          const postitIds = new Set(prev.map((p) => p.postitId));
          return [...prev, ...newPostits.filter((p) => !postitIds.has(p.postitId))];
        });

        const isMore = response.data.data.postits.length === 10;
        hasMoreRef.current = isMore; // hasMore 상태 업데이트

        if (isMore) {
          pageRef.current += 1; // 페이지 증가
        }
      } else {
        hasMoreRef.current = false;
      }
    } catch (error) {
      console.error('포스트잇 조회 에러:', error);
      hasMoreRef.current = false;
    } finally {
      isLoadingRef.current = false; // 로딩 종료
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchPostits();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // IntersectionObserver 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
          fetchPostits();
        }
      },
      { threshold: 0.5 }, // 100% 화면에 보일 때 실행
    );

    if (observerTarget.current) observer.observe(observerTarget.current);

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, []);

  const handleCapsuleClick = () => {
    navigate(`/timepaper/${timepaperId}/capsule`, {
      state: { authorEmail: userEmail },
    });
  };

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  const handlePostitClick = (postit) => {
    setSelectedPostit(postit);
    setModalOpen(true);
  };

  const handlePostItCreateClick = () => {
    navigate(`/timepaper/${timepaperId}/postit/create`);
  };

  const handleDeleteTimepaper = async () => {
    try {
      await api.deleteTimepaper(timepaperId);
      alert('타임페이퍼가 성공적으로 삭제되었습니다.');
      navigate('/');
    } catch (error) {
      console.error('타임페이퍼 삭제 실패:', error);
      alert('타임페이퍼를 삭제하는 데 실패했습니다.');
    }
    setShowConfirmModal(false);
  };

  const handleDeletePostit = (deletedPostitId) => {
    setPostits((prev) => prev.filter((postit) => postit.postitId !== deletedPostitId));
    setModalOpen(false);
    setSelectedPostit(null);
  };

  return (
    <>
      {errorMessage ? (
        <div>{errorMessage}</div>
      ) : timepaper ? (
        <div className={styles.timepaperDetail}>
          <h2>{timepaper.title}</h2>
        </div>
      ) : (
        <div>타임페이퍼 데이터를 불러오는 중...</div>
      )}
      <div className={styles.container}>
        <div className={styles.postitsSection}>
          {postits && postits.length > 0 ? (
            <ul className={styles.timepaperList}>
              {postits.map((postit) => (
                <li
                  key={postit.postitId}
                  className={styles.timepaperItem}
                  onClick={() => handlePostitClick(postit)}
                >
                  <div
                    className={styles.postitBackground}
                    style={{ backgroundImage: `url(${encodeURI(postit.imageUrl)})` }}
                  >
                    <div className={styles.overlay}>
                      <p className={styles.postitContent}>{postit.content}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div>포스트잇이 없습니다.</div>
          )}

          {timepaper &&
            timepaper.writerEmail.trim().toLowerCase() === userEmail.trim().toLowerCase() && (
              <div className={styles.buttonGroup}>
                <BottomButton
                  title="타임페이퍼 캡슐화"
                  onClick={handleCapsuleClick}
                  isEnable={true}
                />
                <BottomButton title="타임페이퍼 삭제" onClick={handleDeleteClick} isEnable={true} />

                {showConfirmModal && (
                  <ConfirmModal
                    message="정말로 이 타임페이퍼를 삭제하시겠습니까?"
                    onConfirm={handleDeleteTimepaper}
                    onCancel={() => setShowConfirmModal(false)}
                  />
                )}
              </div>
            )}
          {isModalOpen && selectedPostit && (
            <Modal
              onClose={() => {
                setModalOpen(false);
                setSelectedPostit(null);
              }}
              onDelete={handleDeletePostit}
              imageUrl={selectedPostit.imageUrl}
              modalContent={selectedPostit.content}
              from={selectedPostit.author}
              postitId={selectedPostit.postitId}
              timepaperId={timepaperId}
            />
          )}
          <BottomButton
            title="포스트잇 작성"
            onClick={handlePostItCreateClick}
            isEnable={true}
            className={styles.postitCreate}
          />
        </div>
      </div>
      {/* Observer 타겟 요소 */}
      <div ref={observerTarget} style={{ height: '20px', margin: '10px 0' }}></div>
    </>
  );
}

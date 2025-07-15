import React from 'react';
import styled from 'styled-components';

const LoadingWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #ff8888; // 연한 빨간색 계열
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #fff1c1; // 연노랑색
  font-weight: bold;
  line-height: 1.5;
  text-align: center;
`;

const Loading = () => {
  return (
    <LoadingWrapper>
      <Title>
        생일<br />
        한상
      </Title>
    </LoadingWrapper>
  );
};

export default Loading;

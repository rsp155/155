import React, { useState } from 'react';
import { api } from '../../services/api';
import './Auth.css';

function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(username, password);
      
      if (result.token) {
        // 로컬 스토리지에 저장
        localStorage.setItem('token', result.token);
        localStorage.setItem('userId', result.user_id);
        localStorage.setItem('role', result.role);
        
        onLoginSuccess(result);
      } else {
        setError('로그인 실패');
      }
    } catch (err) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>로그인</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              required
            />
          </div>
          
          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="auth-switch">
          <p>계정이 없으신가요?</p>
          <button onClick={onSwitchToRegister} className="link-button">
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
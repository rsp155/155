import React, { useState, useEffect } from 'react';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import MenuList from './components/Menu/MenuList';
import Cart from './components/Order/Cart';
import OrderStatus from './components/Order/OrderStatus';
import TrackDelivery from './components/Delivery/TrackDelivery';
import VoiceOrder from './components/Voice/VoiceOrder';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [cart, setCart] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [userName, setUserName] = useState('');
  const [showVoiceOrder, setShowVoiceOrder] = useState(false);

  // --------------------- hook & handler 영역 ---------------------

  useEffect(() => {
    // 로컬 스토리지에서 인증 정보 확인
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (token && userId) {
      setIsAuthenticated(true);
      setUserName(username || '사용자');
    }
  }, []);

  const handleLoginSuccess = (result) => {
    setIsAuthenticated(true);
    setUserName(result.username || '사용자');
    localStorage.setItem('username', result.username || '사용자');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setCart([]);
    setOrderId(null);
    setUserName('');
  };

  const handleAddToCart = (item) => {
    const existingItem = cart.find(i => i.item_id === item.item_id);
    
    if (existingItem) {
      setCart(cart.map(i => 
        i.item_id === item.item_id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      // quantity 기본값이 없다면 1로 설정
      setCart([...cart, { ...item, quantity: item.quantity || 1 }]);
    }
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter(item => item.item_id !== itemId));
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    setCart(cart.map(item =>
      item.item_id === itemId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const handleOrderComplete = (newOrderId) => {
    setOrderId(newOrderId);
    setCart([]);
  };

  const handleNewOrder = () => {
    setOrderId(null);
    setCart([]);
  };

  const handleVoiceOrderComplete = (voiceOrder) => {

     setShowVoiceOrder(false);
  };

  // --------------------- 화면 분기 영역 ---------------------

  // 1) 인증되지 않은 경우: 로그인 / 회원가입 화면
  if (!isAuthenticated) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🍽️ Mr. Daebak</h1>
          <p className="subtitle">특별한 디너를 집에서</p>
        </header>
        
        {showRegister ? (
          <Register 
            onRegisterSuccess={() => setShowRegister(false)}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login 
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    );
  }

  // 2) 주문 완료 후: 주문 상태 + 배달 추적 화면
  if (orderId) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🍽️ Mr. Daebak</h1>
          <div className="header-actions">
            <span className="user-name">👤 {userName}님</span>
            <button onClick={handleLogout} className="logout-button">
              로그아웃
            </button>
          </div>
        </header>

        <OrderStatus orderId={orderId} />
        <TrackDelivery orderId={orderId} />

        <div className="action-buttons">
          <button onClick={handleNewOrder} className="new-order-button">
            새로운 주문하기
          </button>
        </div>
      </div>
    );
  }

  // 3) 메인 주문 화면 (음성 주문 버튼 포함)
  return (
    <div className="app">
      <header className="app-header">
        <h1>🍽️ Mr. Daebak</h1>
        <div className="header-actions">
          <span className="user-name">👤 {userName}님</span>
          <span className="cart-badge">
            🛒 {cart.length}
          </span>
          <button onClick={handleLogout} className="logout-button">
            로그아웃
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* 음성 주문 버튼 */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button onClick={() => setShowVoiceOrder(true)}>
            🎙 음성 주문
          </button>
        </div>

        {/* 음성 주문 모달/컴포넌트 */}
        {showVoiceOrder && (
          <VoiceOrder
            onComplete={handleVoiceOrderComplete}
            onClose={() => setShowVoiceOrder(false)}
          />
        )}

        {/* 메뉴 목록 + 장바구니 */}
        <MenuList onAddToCart={handleAddToCart} />
        
        {cart.length > 0 && (
          <Cart 
            items={cart}
            onRemoveItem={handleRemoveFromCart}
            onUpdateQuantity={handleUpdateQuantity}
            onOrderComplete={handleOrderComplete}
          />
        )}
      </div>
    </div>
  );
}

export default App;

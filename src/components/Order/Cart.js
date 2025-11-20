import React, { useState } from 'react';
import { api } from '../../services/api';
import './Order.css';

function Cart({ items, onRemoveItem, onUpdateQuantity, onOrderComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const handleOrder = async () => {
    if (!userId || !token) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (items.length === 0) {
      setError('장바구니가 비어있습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.createOrder(parseInt(userId), items, token);
      
      if (result.order_id) {
        onOrderComplete(result.order_id);
      } else {
        setError('주문 생성에 실패했습니다.');
      }
    } catch (err) {
      setError('주문 처리 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    onUpdateQuantity(itemId, newQuantity);
  };

  if (items.length === 0) {
    return (
      <div className="cart empty-cart">
        <h2>장바구니</h2>
        <p>장바구니가 비어있습니다.</p>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2>장바구니</h2>
      
      <div className="cart-items">
        {items.map((item, idx) => (
          <div key={idx} className="cart-item">
            <div className="cart-item-info">
              <h4>{item.name}</h4>
              <p className="cart-item-price">{item.price.toLocaleString()}원</p>
            </div>
            
            <div className="cart-item-actions">
              <div className="quantity-control">
                <button onClick={() => handleQuantityChange(item.item_id, item.quantity - 1)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => handleQuantityChange(item.item_id, item.quantity + 1)}>
                  +
                </button>
              </div>
              
              <p className="cart-item-subtotal">
                {(item.price * item.quantity).toLocaleString()}원
              </p>
              
              <button 
                className="remove-button"
                onClick={() => onRemoveItem(item.item_id)}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="total-row">
          <span>총 금액:</span>
          <span className="total-amount">{total.toLocaleString()}원</span>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          className="order-button"
          onClick={handleOrder}
          disabled={loading}
        >
          {loading ? '주문 처리 중...' : '주문하기'}
        </button>
      </div>
    </div>
  );
}

export default Cart;
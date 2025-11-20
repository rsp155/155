import React, { useState } from 'react';
import './Order.css';

function OrderForm({ items, onSubmit, onCancel }) {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!deliveryAddress || !phone) {
      alert('배송지와 연락처를 입력해주세요.');
      return;
    }

    onSubmit({
      items,
      deliveryAddress,
      phone,
      note,
      totalAmount: total
    });
  };

  return (
    <div className="order-form">
      <h2>주문 정보 입력</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>주문 내역</h3>
          <div className="order-summary">
            {items.map((item, idx) => (
              <div key={idx} className="summary-item">
                <span>{item.name} x {item.quantity}</span>
                <span>{(item.price * item.quantity).toLocaleString()}원</span>
              </div>
            ))}
            <div className="summary-total">
              <span>총 금액</span>
              <span>{total.toLocaleString()}원</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>배송 정보</h3>
          
          <div className="form-group">
            <label>배송지 주소 *</label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="배송받으실 주소를 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label>연락처 *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              required
            />
          </div>

          <div className="form-group">
            <label>배송 메모</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="배송 시 요청사항을 입력하세요 (선택)"
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-button">
            취소
          </button>
          <button type="submit" className="submit-button">
            주문하기
          </button>
        </div>
      </form>
    </div>
  );
}

export default OrderForm;
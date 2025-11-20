import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './Order.css';

function OrderStatus({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (orderId) {
      loadOrderStatus();
      // 30초마다 상태 갱신
      const interval = setInterval(loadOrderStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [orderId]);

  const loadOrderStatus = async () => {
    try {
      const data = await api.getOrder(orderId, token);
      setOrder(data);
      setError('');
    } catch (err) {
      setError('주문 정보를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStateText = (state) => {
    const stateMap = {
      'Created': '주문 접수',
      'Accepted': '주문 승인',
      'Preparing': '조리 중',
      'Packaged': '포장 완료',
      'PickedUp': '배달 시작',
      'EnRoute': '배달 중',
      'Delivered': '배달 완료',
      'Failed': '배달 실패',
      'Cancelled': '취소됨'
    };
    return stateMap[state] || state;
  };

  const getStateClass = (state) => {
    if (['Created', 'Accepted'].includes(state)) return 'state-pending';
    if (['Preparing', 'Packaged'].includes(state)) return 'state-preparing';
    if (['PickedUp', 'EnRoute'].includes(state)) return 'state-delivery';
    if (state === 'Delivered') return 'state-completed';
    if (['Failed', 'Cancelled'].includes(state)) return 'state-failed';
    return '';
  };

  if (loading) {
    return <div className="loading">주문 정보를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={loadOrderStatus}>다시 시도</button>
      </div>
    );
  }

  if (!order) {
    return <div className="error-container">주문 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="order-status">
      <h2>주문 상태</h2>
      
      <div className="order-info">
        <div className="info-row">
          <span className="label">주문 번호:</span>
          <span className="value">{order.order_id}</span>
        </div>
        
        <div className="info-row">
          <span className="label">주문 금액:</span>
          <span className="value">{order.total_amount?.toLocaleString()}원</span>
        </div>
        
        <div className="info-row">
          <span className="label">주문 상태:</span>
          <span className={`value state-badge ${getStateClass(order.state)}`}>
            {getStateText(order.state)}
          </span>
        </div>
      </div>

      <div className="status-timeline">
        <div className={`timeline-item ${['Created', 'Accepted', 'Preparing', 'Packaged', 'PickedUp', 'EnRoute', 'Delivered'].includes(order.state) ? 'completed' : ''}`}>
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            <h4>주문 접수</h4>
            <p>주문이 접수되었습니다</p>
          </div>
        </div>

        <div className={`timeline-item ${['Accepted', 'Preparing', 'Packaged', 'PickedUp', 'EnRoute', 'Delivered'].includes(order.state) ? 'completed' : ''}`}>
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            <h4>주문 승인</h4>
            <p>주문이 승인되었습니다</p>
          </div>
        </div>

        <div className={`timeline-item ${['Preparing', 'Packaged', 'PickedUp', 'EnRoute', 'Delivered'].includes(order.state) ? 'completed' : ''}`}>
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            <h4>조리 중</h4>
            <p>음식을 준비하고 있습니다</p>
          </div>
        </div>

        <div className={`timeline-item ${['Packaged', 'PickedUp', 'EnRoute', 'Delivered'].includes(order.state) ? 'completed' : ''}`}>
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            <h4>포장 완료</h4>
            <p>배달 준비가 완료되었습니다</p>
          </div>
        </div>

        <div className={`timeline-item ${['PickedUp', 'EnRoute', 'Delivered'].includes(order.state) ? 'completed' : ''}`}>
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            <h4>배달 중</h4>
            <p>배달이 진행 중입니다</p>
          </div>
        </div>

        <div className={`timeline-item ${order.state === 'Delivered' ? 'completed' : ''}`}>
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            <h4>배달 완료</h4>
            <p>맛있게 드세요!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderStatus;
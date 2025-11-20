import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './Delivery.css';

function TrackDelivery({ orderId }) {
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (orderId) {
      loadDeliveryStatus();
      // 30초마다 배송 상태 갱신
      const interval = setInterval(loadDeliveryStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [orderId]);

  const loadDeliveryStatus = async () => {
    try {
      const data = await api.getDeliveryStatus(orderId, token);
      setDeliveryStatus(data.status || '배송 정보 없음');
      setError('');
    } catch (err) {
      setError('배송 정보를 불러올 수 없습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (!status || status === '배송 정보 없음') return '📦';
    if (status === 'assigned') return '👨‍🍳';
    if (status.includes('준비') || status.includes('preparing')) return '🍳';
    if (status.includes('픽업') || status.includes('picked')) return '🏍️';
    if (status.includes('배달') || status.includes('delivery')) return '🚚';
    if (status.includes('완료') || status.includes('completed')) return '✅';
    return '📦';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'assigned': '배달 기사 배정됨',
      'picked_up': '픽업 완료',
      'on_the_way': '배달 중',
      'delivered': '배달 완료',
      'failed': '배달 실패'
    };
    return statusMap[status] || status || '배송 정보 없음';
  };

  if (loading) {
    return <div className="loading">배송 정보를 불러오는 중...</div>;
  }

  return (
    <div className="track-delivery">
      <h2>배송 추적</h2>
      
      <div className="delivery-info">
        <div className="info-card">
          <div className="info-icon">
            <span className="status-icon">{getStatusIcon(deliveryStatus)}</span>
          </div>
          
          <div className="info-content">
            <p className="info-label">주문 번호</p>
            <p className="info-value">#{orderId}</p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">
            <span className="status-icon">📍</span>
          </div>
          
          <div className="info-content">
            <p className="info-label">배송 상태</p>
            <p className="info-value status-text">
              {getStatusText(deliveryStatus)}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadDeliveryStatus}>다시 시도</button>
        </div>
      )}

      <div className="delivery-notice">
        <p>💡 배송 상태는 자동으로 업데이트됩니다.</p>
        <p>문의사항이 있으시면 고객센터로 연락주세요.</p>
      </div>
    </div>
  );
}

export default TrackDelivery;
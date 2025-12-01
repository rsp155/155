// API 기본 URL (환경 변수에서 가져오기)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// HTTP 요청 헬퍼 함수
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// API 서비스 객체
export const api = {
  // ==================== 인증 관련 ====================
  
  /**
   * 회원가입
   * @param {string} username - 사용자 이름
   * @param {string} password - 비밀번호
   * @param {string} email - 이메일
   * @param {string} role - 역할 (Customer/Staff)
   */
  register: async (username, password, email, role = 'Customer') => {
    return fetchWithAuth(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ username, password, email, role })
    });
  },

  /**
   * 로그인
   * @param {string} username - 사용자 이름
   * @param {string} password - 비밀번호
   */
  login: async (username, password) => {
    return fetchWithAuth(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  /**
   * 프로필 조회
   * @param {number} userId - 사용자 ID
   */
  getProfile: async (userId) => {
    return fetchWithAuth(`${API_BASE_URL}/auth/profile/${userId}`, {
      method: 'GET'
    });
  },

  /**
   * 프로필 업데이트
   * @param {number} userId - 사용자 ID
   * @param {object} profileData - 프로필 데이터
   */
  updateProfile: async (userId, profileData) => {
    return fetchWithAuth(`${API_BASE_URL}/auth/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // ==================== 메뉴 관련 ====================
  
  /**
   * 전체 메뉴 조회
   */
  getMenu: async () => {
    return fetchWithAuth(`${API_BASE_URL}/menu`, {
      method: 'GET'
    });
  },

  /**
   * 메뉴 아이템 조회
   * @param {number} itemId - 메뉴 아이템 ID
   */
  getMenuItem: async (itemId) => {
    return fetchWithAuth(`${API_BASE_URL}/menu/${itemId}`, {
      method: 'GET'
    });
  },

  /**
   * 메뉴 추가 (Staff only)
   * @param {object} menuData - 메뉴 데이터 {name, price, category}
   */
  addMenuItem: async (menuData) => {
    return fetchWithAuth(`${API_BASE_URL}/menu`, {
      method: 'POST',
      body: JSON.stringify(menuData)
    });
  },

  /**
   * 메뉴 수정 (Staff only)
   * @param {number} itemId - 메뉴 아이템 ID
   * @param {object} menuData - 수정할 데이터
   */
  updateMenuItem: async (itemId, menuData) => {
    return fetchWithAuth(`${API_BASE_URL}/menu/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(menuData)
    });
  },

  // ==================== 재고 관련 ====================
  
  /**
   * 재고 조회
   * @param {number} itemId - 메뉴 아이템 ID
   */
  getInventory: async (itemId) => {
    return fetchWithAuth(`${API_BASE_URL}/inventory/${itemId}`, {
      method: 'GET'
    });
  },

  /**
   * 재고 업데이트 (Staff only)
   * @param {number} itemId - 메뉴 아이템 ID
   * @param {number} quantity - 재고 수량
   */
  updateInventory: async (itemId, quantity) => {
    return fetchWithAuth(`${API_BASE_URL}/inventory/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },

  // ==================== 주문 관련 ====================
  
  /**
   * 주문 생성
   * @param {number} customerId - 고객 ID
   * @param {array} items - 주문 아이템 배열 [{item_id, name, price, quantity}]
   * @param {string} token - 인증 토큰
   */
  createOrder: async (customerId, items, token) => {
    return fetchWithAuth(`${API_BASE_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify({ customer_id: customerId, items }),
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  /**
   * 주문 조회
   * @param {number} orderId - 주문 ID
   * @param {string} token - 인증 토큰
   */
  getOrder: async (orderId, token) => {
    return fetchWithAuth(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  /**
   * 고객별 주문 조회
   * @param {number} customerId - 고객 ID
   * @param {string} token - 인증 토큰
   */
  getOrdersByCustomer: async (customerId, token) => {
    return fetchWithAuth(`${API_BASE_URL}/orders/customer/${customerId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  /**
   * 주문 상태 업데이트 (Staff only)
   * @param {number} orderId - 주문 ID
   * @param {string} state - 새로운 상태
   * @param {string} token - 인증 토큰
   */
  updateOrderState: async (orderId, state, token) => {
    return fetchWithAuth(`${API_BASE_URL}/orders/${orderId}/state`, {
      method: 'PUT',
      body: JSON.stringify({ state }),
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  /**
   * 주문 취소
   * @param {number} orderId - 주문 ID
   * @param {string} token - 인증 토큰
   */
  cancelOrder: async (orderId, token) => {
    return fetchWithAuth(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // ==================== 배송 관련 ====================
  
  /**
   * 배송 정보 조회
   * @param {number} orderId - 주문 ID
   * @param {string} token - 인증 토큰
   */
  getDeliveryInfo: async (orderId, token) => {
    return fetchWithAuth(`${API_BASE_URL}/delivery/${orderId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  /**
   * 배송 상태 조회
   * @param {number} orderId - 주문 ID
   * @param {string} token - 인증 토큰
   */
  getDeliveryStatus: async (orderId, token) => {
    return fetchWithAuth(`${API_BASE_URL}/delivery/status/${orderId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  /**
   * 배달 기사 배정 (Staff only)
   * @param {number} orderId - 주문 ID
   * @param {string} driverId - 기사 ID
   * @param {string} token - 인증 토큰
   */
  assignDriver: async (orderId, driverId, token) => {
    return fetchWithAuth(`${API_BASE_URL}/delivery`, {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, driver_id: driverId }),
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  /**
   * 배송 상태 업데이트 (Staff/Driver)
   * @param {number} orderId - 주문 ID
   * @param {string} status - 배송 상태
   * @param {string} token - 인증 토큰
   */
  updateDeliveryStatus: async (orderId, status, token) => {
    return fetchWithAuth(`${API_BASE_URL}/delivery/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
};

export default api;
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import MenuItem from './MenuItem';
import './Menu.css';

function MenuList({ onAddToCart }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await api.getMenu();
      setMenu(data);
      setError('');
    } catch (err) {
      setError('메뉴를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">메뉴를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={loadMenu}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className="menu-list">
      <h2>메뉴</h2>
      <div className="menu-grid">
        {menu.length === 0 ? (
          <p>등록된 메뉴가 없습니다.</p>
        ) : (
          menu.map(item => (
            <MenuItem 
              key={item.item_id} 
              item={item} 
              onAddToCart={onAddToCart}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default MenuList;
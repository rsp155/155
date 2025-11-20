import React from 'react';
import './Menu.css';

function MenuItem({ item, onAddToCart }) {
  const handleAddToCart = () => {
    onAddToCart({
      item_id: item.item_id,
      name: item.name,
      price: item.price,
      quantity: 1
    });
  };

  return (
    <div className="menu-item">
      <div className="menu-item-header">
        <h3>{item.name}</h3>
        <span className="category-badge">{item.category}</span>
      </div>
      
      <div className="menu-item-body">
        <p className="price">{item.price.toLocaleString()}원</p>
        
        <div className="stock-info">
          {item.available && item.stock_quantity > 0 ? (
            <span className="in-stock">재고: {item.stock_quantity}개</span>
          ) : (
            <span className="out-of-stock">품절</span>
          )}
        </div>
      </div>

      <div className="menu-item-footer">
        <button 
          onClick={handleAddToCart}
          disabled={!item.available || item.stock_quantity <= 0}
        >
          {item.available && item.stock_quantity > 0 ? '장바구니 담기' : '품절'}
        </button>
      </div>
    </div>
  );
}

export default MenuItem;
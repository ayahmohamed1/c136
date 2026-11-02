import React from 'react';

interface MenuProps {
  onBack: () => void;
  onNext: () => void;
  onSelect: (page: string) => void;
}

export default function MenuPage({ onBack, onNext, onSelect }: MenuProps) {
  return (
    <div className="content-wrapper">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 className="gift-title">Choose a <span>Surprise</span></h1>
        <p className="description">Tap any memory to reveal</p>
      </div>

      {/* شبكة الاختيار بـ 4 مربعات */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '12px', 
        width: '100%', 
        maxWidth: '360px',
        marginBottom: '1.5rem' 
      }}>
        {/* 1. الكيك */}
        <div 
          onClick={() => onSelect('cake')}
          className="polaroid-card"
          style={{ cursor: 'pointer', textAlign: 'center', padding: '15px 10px' }}
        >
          <span style={{ fontSize: '1.8rem' }}>🎂</span>
          <p style={{ color: '#f472b6', marginTop: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>The Cake</p>
        </div>
        
        {/* 2. الرسالة */}
        <div 
          onClick={() => onSelect('message')}
          className="polaroid-card"
          style={{ cursor: 'pointer', textAlign: 'center', padding: '15px 10px' }}
        >
          <span style={{ fontSize: '1.8rem' }}>💌</span>
          <p style={{ color: '#f472b6', marginTop: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>Message</p>
        </div>

        {/* 3. الصور / Moments */}
        <div 
          onClick={() => onSelect('moments')}
          className="polaroid-card"
          style={{ cursor: 'pointer', textAlign: 'center', padding: '15px 10px' }}
        >
          <span style={{ fontSize: '1.8rem' }}>📸</span>
          <p style={{ color: '#f472b6', marginTop: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>Moments</p>
        </div>

        {/* 4. الأغنية */}
        <div 
          onClick={() => onSelect('song')}
          className="polaroid-card"
          style={{ cursor: 'pointer', textAlign: 'center', padding: '15px 10px' }}
        >
          <span style={{ fontSize: '1.8rem' }}>🎵</span>
          <p style={{ color: '#f472b6', marginTop: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>Our Song</p>
        </div>
      </div>

      {/* زراير الـ Back والـ Next */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button className="btn-secondary" onClick={onBack} style={{ margin: 0 }}>
          ← Back
        </button>
        <button className="btn-primary" onClick={onNext}>
          Next →
        </button>
      </div>
    </div>
  );
}
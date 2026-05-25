import React from 'react';
import { Link } from 'react-router-dom';

export default function MenuItem({ item, openId, setOpenId }) {
    // Se não houver item, não renderiza nada
    if (!item) return null;
    
    const temFilhos = item.children && item.children.length > 0;
    const isOpen = openId === item.pkFuncionalidade;
    
    const handleClick = (e) => {
        if (temFilhos) {
            e.preventDefault();
            // Alterna a abertura
            if (setOpenId) {
                setOpenId(isOpen ? null : item.pkFuncionalidade);
            }
        }
    };
    
    return (
        <li className="nav-item">
            <Link
                className="nav-link btn btn-link text-start text-light"
                to={item.path || '#'}
                onClick={handleClick}
                style={{ textDecoration: 'none' }}
            >
                {item.designacao || item.name || 'Item'}
            </Link>
            
            {temFilhos && isOpen && (
                <ul className="shadow-sm border-0 ps-3 mt-1" style={{ listStyle: 'none', marginLeft: '15px' }}>
                    {item.children.map(child => (
                        <MenuItem 
                            key={child.pkFuncionalidade} 
                            item={child} 
                            openId={openId}
                            setOpenId={setOpenId}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}
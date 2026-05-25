import React, { useState } from 'react';
import MenuItem from './MenuItem';

export default function Menu() {
    const [openId, setOpenId] = useState(null);
    
    let menu = [];
    try {
        const menuString = localStorage.getItem('menu');
        if (menuString && menuString !== 'null' && menuString !== 'undefined') {
            menu = JSON.parse(menuString);
        }
    } catch (error) {
        console.error('Erro ao ler menu:', error);
    }
    
    // Se não houver menu, não renderiza nada
    if (!menu || menu.length === 0) {
        return null;
    }
    
    return (
        <ul className="navbar-nav d-flex flex-row flex-wrap align-items-center gap-3">
            {menu.map(item => (
                <MenuItem 
                    key={item.pkFuncionalidade} 
                    item={item} 
                    openId={openId}
                    setOpenId={setOpenId}
                />
            ))}
        </ul>
    );
}
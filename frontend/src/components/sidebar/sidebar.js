import './sidebar.css'

export const Sidebar = ({ menuItems }) => {
    return (
        <aside className="sidebar">
            <nav>
                <ul className="menu-list">
                    {menuItems.map(item => (
                        <li key={item.id} className="menu-item">
                            <div className="menu-link">
                                <i className={item.icon}></i>
                                <a href={item?.route}>{item.name}</a>
                            </div>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

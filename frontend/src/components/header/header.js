import { useEffect, useState } from 'react';
import './header.css'
import { useNavigate } from 'react-router-dom';

export const Header = ({ username, role }) => {

    const navigate = useNavigate()

    const Clock = () => {
        const [time, setTime] = useState(new Date().toLocaleTimeString());

        useEffect(() => {
            const interval = setInterval(() => {
                setTime(new Date().toLocaleTimeString());
            }, 1000);

            return () => clearInterval(interval);
        }, []);

        return <div>Time: {time}</div>;
    };


    const MenuBar = () => {
        return (
            <div className='menubar'>
                <div className='menu' onClick={navigate('/user')}>
                    User Management
                </div>
                <div className='menu' onClick={navigate('/task')}>
                    Task Management
                </div>
                <div className='menu'>
                    Machine Management
                </div>
            </div>
        )
    };

    return (
        <div className="header-wrapper">
            <div>
                Hi {username}, {role}
            </div>

            <div>
                <MenuBar />
            </div>

            <div>
                <Clock />
            </div>

        </div>
    )
}
import React, { useContext } from 'react';
import styled from 'styled-components';
import AlertContext from '../../context/alert/AlertContext';

const AlertWrapper = styled.div`
  position: fixed;
  top: 70px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AlertItem = styled.div`
  padding: 15px 20px;
  border-radius: 4px;
  animation: slideIn 0.3s ease-in-out;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 350px;
  display: flex;
  align-items: center;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  &.success {
    background-color: #d4edda;
    border-left: 5px solid #28a745;
    color: #155724;
  }
  
  &.danger {
    background-color: #f8d7da;
    border-left: 5px solid #dc3545;
    color: #721c24;
  }
  
  &.warning {
    background-color: #fff3cd;
    border-left: 5px solid #ffc107;
    color: #856404;
  }
  
  &.info {
    background-color: #d1ecf1;
    border-left: 5px solid #17a2b8;
    color: #0c5460;
  }
`;

const AlertIcon = styled.span`
  margin-right: 10px;
  font-size: 20px;
`;

const Alert = () => {
  const { alertState } = useContext(AlertContext);

  if (alertState.length === 0) {
    return null;
  }

  return (
    <AlertWrapper>
      {alertState.map(alert => (
        <AlertItem key={alert.id} className={alert.type}>
          <AlertIcon>
            {alert.type === 'success' && '✓'}
            {alert.type === 'danger' && '✗'}
            {alert.type === 'warning' && '⚠'}
            {alert.type === 'info' && 'ℹ'}
          </AlertIcon>
          {alert.msg}
        </AlertItem>
      ))}
    </AlertWrapper>
  );
};

export default Alert;
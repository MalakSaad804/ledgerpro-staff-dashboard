import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dismissToast } from '../store/uiSlice';

function Toast({ t }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(t.id)), 4000);
    return () => clearTimeout(timer);
  }, [dispatch, t.id]);
  return <div className={`toast toast-${t.type}`} role="status">{t.text}</div>;
}

export default function ToastHost() {
  const toasts = useSelector((s) => s.ui.toasts);
  return <div className="toast-host">{toasts.map((t) => <Toast key={t.id} t={t} />)}</div>;
}

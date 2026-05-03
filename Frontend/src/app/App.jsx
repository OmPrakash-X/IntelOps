import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { router } from './routes'
import { fetchMyProfile } from '../features/auth/authSlice'
import { connectSocket, disconnectSocket } from '../lib/socket'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

const App = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const lenis = new Lenis()
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, []);

  useEffect(() => {
    if (token && !user?.username) {
      dispatch(fetchMyProfile());
    }
  }, [token, user?.username, dispatch]);

  // Connect socket when authenticated, disconnect on logout
  useEffect(() => {
    if (token && user?._id) {
      connectSocket(user._id);
    } else {
      disconnectSocket();
    }
  }, [token, user?._id]);

  return <RouterProvider router={router} />
}

export default App
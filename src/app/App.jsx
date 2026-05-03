import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { router } from './routes'
import { fetchMyProfile } from '../features/auth/authSlice'

const App = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMyProfile());
    }
  }, [token, user, dispatch]);

  return <RouterProvider router={router} />
}

export default App